---
tags:
    - PHPStan

image: "images/og-images/phpstan-php-version-in-scope.jpg"

ogImage:
    title: "My next PHPStan focus area: multi-phpversion support"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "phpstan-php-version-in-scope"
---


In a recent article I was summarizing the problems and results of my work on [`mixed` types in PHPStan](https://staabm.github.io/2024/11/26/phpstan-mixed-types.html).
Now we will have a look at what comes next.

### My new PHPStan focus: multi-phpversion support

For a few years, I am now contributing to PHPStan with a focus on improving the type inference,
which means I am looking into code where `mixed` types are involved and how I can improve the situation.

In my opinion we are in a pretty good `mixed` type shape, as the most common problems I can think of seem to be addressed.
For sure new examples will show up, and we still will and have to continue to improve the situation.
I am no longer prioritizing `mixed` problems over other things in my PHPStan work, though.

So what's ahead? My new focus area will be improving the PHPStan story around multi-phpversion supporting code.
This means focusing on stuff which is different between PHP versions and tasks/hurdles common to projects which are in the process of a PHP version upgrade.

#### Narrow types by PHP_VERSION_ID

The first step in this direction was already achieved by making PHPStan aware of `composer.json` defined PHP version requirements
and taking this knowledge into account to narrow constants like `PHP_VERSION_ID` et. all. since PHPStan 2.0.

There is a dedicated blog post about this topic already: [PHPStan PHP Version Narrowing](https://staabm.github.io/2024/11/14/phpstan-php-version-narrowing.html)


#### So what's next?

The current plan is to make PHPStan aware of a narrowed PHP-Version within the current scope and utilize this information in type inference and error reporting.
This means while analyzing code we no longer use just use a fixed PHP version configured in e.g. PHPStan NEON configuration, but also narrow it further down based on the code at hand.

Let me give you a few examples which currently don't work well, but should work much better after the project evolves:

At the time of writing PHPStan 2.0.2 will report null coalescing errors in your code only if you narrow down the PHP version by configuration.
This means you e.g. define the PHP version or version-range by NEON config, `composer.json` (as of PHPStan 2+) or implicitly by the PHP runtime version you are using for PHPStan.
Running the below example without additional configuration on PHP8 will not yield any errors. As of now you would need e.g. a separate CI job configured for PHPStan 7.3 or lower to catch the error.
In the future, I want PHPStan catch this error even when running on PHP8 or later.

```php

if (PHP_VERSION_ID < 70400) {
    $y = $_GET['y'] ?? []; // should error about null coalescing operator, which requires PHP 7.4+
} else {
    $x = $_GET['x']?? [];
}

```

Another example: PHPStan is using a single knowledge base for return and parameter types of functions and methods.
This information is narrowed down by PHPStan Extensions when e.g. parameter values are known at static analysis time.
In the future I want to improve the type inference e.g. for cases where PHP used `resource` types in the past, but uses class/object types in more modern versions:

```php

class MySocket
{
  public function create(): \Socket
  {
    if (PHP_VERSION_ID < 80000) {
        throw new RuntimeException('PHP 8.0 required');
    }

    return socket_create(AF_INET, SOCK_DGRAM, SOL_UDP); // can only return `\Socket|false` but PHPStan sometimes mixes it up with `resource`
  }
}

```

This also means your developer experience when using PHP version specific language features in code being analyzed with PHPStan should improve over time.

These are only a few examples of my current state of mind. I am pretty sure we will shape new ideas after iterating on the problems involved and the solutions we come up with.

### How can you support my effort?

I think working on this thing will be a multi month effort and will at least take several dozens of pull requests.

If you are hit by one of the problems I described above and feel the pain you might be interested in [sponsoring my free time efforts](https://github.com/sponsors/staabm), so I can spend more time on this problem.
