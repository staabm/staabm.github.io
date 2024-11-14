---
tags:
    - PHPStan

image: "images/og-images/phpstan-php-version-narrowing.jpg"

ogImage:
    title: "PHPStan narrows PHP version constants"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "phpstan-php-version-narrowing"
---


Since PHPStan 2.0 we start to narrow PHP version related information for more precise results.


### Dead code detection for PHP_* constants

From time to time its required to check the PHP version to e.g. work around bugs or detect certain behaviour of the language.
Oftentimes checking for certain PHP-version ranges also helps to assert certain behaviour in automated tests.

Example test taken from `maglnet/composer-require-checker`:
```php
...
    public function testDoesNotCollectAnySymbolsForTheRandomExtensionOnPhpVersionsLowerThan82(): void
    {
        if (PHP_VERSION_ID >= 80200) {
            $this->markTestSkipped('This test is only relevant for PHP versions lower than 8.2');
        }

        $symbols = $this->locator->__invoke(['random']);

        $this->assertEmpty($symbols);
    }
...
```

Time moves on, new PHP versions get released and old versions get deprecated, and finally will be declared end-of-live.
The PHP versions your code supports follows this lifecycle, which means the code related to PHP version-checks might become dead code at some point.

In my experience code which no longer needs to be maintained because it is only relevant for no longer supported PHP versions is often overlooked.
That's why I started thinking about implementing a feature in PHPStan to detect dead code related to PHP version checks.

### Lets get our hands dirty

What I came up with was an improvement to type narrowing so constants like `PHP_VERSION_ID`, `PHP_MAJOR_VERSION`, `PHP_MINOR_VERSION`, `PHP_RELEASE_VERSION`
and `PHP_VERSION` will be more precise depending on the declared version range of the projects `composer.json` php-requirement. While discussing it with Ondřej
we figured out that adding support for `version_compare()` and the NEON config file would be a good idea as well.

If you are curious, find the implementation of the above idea in [PHPStan pull request 3585](https://github.com/phpstan/phpstan-src/pull/3584).

This means, as of PHPStan 2.0:
- we will use the `composer.json` php-requirement in case no `phpVersion` parameter is set in the NEON config file
- the `phpVersion` parameter in the NEON config now supports declaring a PHP version range, which will overrule the `composer.json` php-requirement:

```
parameters:
	phpVersion:
		min: 80303
		max: 80104
```

With this information at hand, we are now able to detect 'always true' and 'always false' conditions in code like
```php
if (PHP_MAJOR_VERSION === 7) {}

if (PHP_VERSION_ID < 80100) {}

if (version_compare(PHP_VERSION, '7.0.0') === 1) {}
```

Right after PHPStan 2.0 the first examples show up, that this idea works really well:
- [Remove now-unnecessary PHP <8.2 code](https://github.com/maglnet/ComposerRequireChecker/pull/554)
- [phpstan-strict-rules: Remove dead test because of raised min-php version](https://github.com/phpstan/phpstan-strict-rules/pull/250)
- [phpstan-nette: Removed dead test-code after min-phpversion raise](https://github.com/phpstan/phpstan-nette/pull/164)
- [phpstan-deprecation-rules: Removed always true PHP_VERSION_ID condition](https://github.com/phpstan/phpstan-deprecation-rules/pull/118)

<img src="/images/post-images/phpstan-php-version-narrowing/feedback.png">

In case this feature detected dead code in one of your projects, retweet or retoot my messages to give me a signal that this feature is useful for you.


### Future work

For the future is planned to take PHPUnits `RequiresPhp` attribute into account as well.
```
    #[RequiresPhp('5.4.0-alpha1')]
    public function myTest(): void
    {
    }
```

Maybe we will even add a similar thing for the `@requires` annotation in PHPUnit.



### Support my open source work

In case this article was useful, or you want to honor the effort I put into one of the hundreds of pull-requests to PHPStan, please [considering sponsoring my open-source efforts 💕](https://github.com/sponsors/staabm).
