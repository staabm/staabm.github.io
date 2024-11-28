---
tags:
- PHPStan

image: "images/og-images/phpstan-analyzable-api-contracts.jpg"

ogImage:
  title: "Make PHPStan aware of your api implications"
  imageUrl: "https://staabm.github.io/staabm.svg"
  fileName: "phpstan-analyzable-api-contracts"
---

## Make PHPStan aware of your APIs' implications️

It's of really great help, when your APIs' contracts are covered by static analysis.

From time to time I have to implement APIs like this:

```php

class HttpSession {
    /**
     * checks whether the current user has a session
     */
    public function sessionExists(): bool
    {
        // implement me
        return (bool) rand(0,1);
    }

    /**
     * Returns the current user session if it exists. otherwise returns null.
     * @return UserSession|null
     */
    public function getSession(): ?UserSession
    {
        // implement me
        return rand(0,1) ? new UserSession() : null;
    }
}

class UserSession {
    // implement me
    function doSomething(): void {}
}

```

In this case the 2 API methods are kind of interconnected. When `sessionExists` returns `true`, `getSession` will return a `UserSession` - in other words it won't return `null`.

From a API consumer point of view I can call `getSession` and check whether the return value is `null`, or use the dedicated `sessionExists` method.

If you use the code as shown above you will get a [false positive from PHPStan](https://phpstan.org/r/3aab2663-be6a-4489-80c2-a2361d8b7d04) though, when using the more readable `sessionExists` in combination with `getSession`:

```php

function myController(HttpSession $session):void {
    if ($session->sessionExists()) {
        // PHPStan error: Cannot call method doSomething() on UserSession|null.
        $session->getSession()->doSomething();
    }
}

```

This means that I would need an additional null-check, even though from a business logic point of view this is not necessary:

```php

function myController(HttpSession $session):void {
    if ($session->sessionExists()) {
        // no error, but unnecessarry complexity
        if ($session->getSession() !== null) {
            $session->getSession()->doSomething();
        }
    }
}

```

## `@phpstan-assert*` to the rescue

As of [PHPStan 1.9.0](https://phpstan.org/blog/phpstan-1-9-0-with-phpdoc-asserts-list-type#phpdoc-asserts) you can give a hint about the API contract, so it knows about the implications of the API.
By adding a single line of PHPDoc `@phpstan-assert-if-true !null $this->getSession()`, PHPStan can handle the case like you would expect.

```php

class HttpSession {
    /**
     * checks whether the current user has a session
     * @phpstan-assert-if-true !null $this->getSession()
     */
    public function sessionExists(): bool
    {
        // implement me
        return (bool) rand(0,1);
    }

    /**
     * Returns the current user session if it exists. otherwise returns null.
     * @return UserSession|null
     */
    public function getSession(): ?UserSession
    {
        // implement me
        return rand(0,1) ? new UserSession() : null;
    }
}

class UserSession {
    // implement me
    function doSomething(): void {}
}

// ...

function myController(HttpSession $session):void {
    if ($session->sessionExists()) {
        // no error: PHPStan is aware of `getSession()` cannot return null
        $session->getSession()->doSomething();
    }
}

```

The added assertion tells PHPStan that `$session->getSession()` will not return `null` when used within the truethy-context of `$session->sessionExists()`.

Here you can see the same hint at play:

```php

function myController(HttpSession $session):void {
    if (!$session->sessionExists()) {
        return;
    }

    // no error: PHPStan is aware of `getSession()` cannot return null
    $session->getSession()->doSomething();
}

```

See the [example at the PHPStan playground](https://phpstan.org/r/b1e54906-1ad7-4108-b33f-e8c45f1f5d16).
Also, make sure you [read the PHPStan release announcement](https://phpstan.org/blog/phpstan-1-9-0-with-phpdoc-asserts-list-type#phpdoc-asserts) which contains even more details.

