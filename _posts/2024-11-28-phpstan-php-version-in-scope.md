---
tags:
    - PHPStan

image: "images/og-images/phpstan-php-version-in-scope.jpg"

ogImage:
    title: "My next PHPStan focus area: multi-phpversion support"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "phpstan-php-version-in-scope"
---

### My new PHPStan focus: multi-phpversion support

[_TL;DR: What’s already done?_](https://staabm.github.io/2024/11/28/phpstan-php-version-in-scope.html#whats-already-done)

In a recent article I was summarizing the problems and results of my work on [`mixed` types in PHPStan](https://staabm.github.io/2024/11/26/phpstan-mixed-types.html).
Now we will have a look at what comes next.

For a few years, I am now contributing to PHPStan with a focus on improving the type inference,
which means I am looking into code where `mixed` types are involved and how I can improve the situation.

In my opinion we are in a pretty good `mixed` type shape, as the most common problems I can think of seem to be addressed.
For sure new examples will show up, and we still will and have to continue to improve the situation.
I am no longer prioritizing `mixed` problems over other things in my PHPStan work, though.

#### Problem space

So what's ahead? My new focus area will be improving the PHPStan story around multi-phpversion supporting code.
This means focusing on stuff which is different between PHP versions and tasks/hurdles common to projects which are in the process of a PHP version upgrade.

If you want to cover your codebase cross several PHP versions, you need to set up a CI matrix with different PHP versions.
You also need multiple PHPStan baselines to ignore errors which are only relevant for a specific PHP version.
Such a setup brings additional complexity not everyone is willing to deal with.

In my experience most projects set up PHPStan only for a single PHP version and ignore the rest, which leaves a lot of potential errors undetected.

Another challenge you face over and over when upgrading PHP versions is the `resource` to objects migration.
There are [articles on the web](https://php.watch/articles/resource-object) on this problem alone.
Different PHP versions use different types for some APIs - e.g. [`curl_init`](https://www.php.net/curl_init) or [`socket_create`](https://www.php.net/socket_create),
to name a few - and as soon as you are planning a PHP upgrade you usually need to deal with supporting both signatures - `resource` and the corresponding object-types - in tandem for a while,
so can run your application on your current and your future production system at the same time.

The topic gets even more complicated in case you are building a tool, library or a framework as you usually need to support multiple PHP version for a longer time.
You also need to handle phasing out and adding support for new PHP versions to your compatibility matrix over and over,
which means you constantly need to answer questions like:
- which code is going to be dead because of a min-php version raise?
- which code needs adjustments to support a new PHP version?
- how can we make sure that code which gets adapted for the new PHP version still works on the old PHP version?
- do we have a rough idea how many problems we need to solve?

To help you answer this questions my goals are:
- Projects which can only afford a single PHPStan CI job should detect as many cross-php version related errors as possible
- Running PHPStan on multiple PHP versions should be as frictionless as possible

#### How can you support my effort?

I think working on this thing will be a multi month freetime effort and will at least take several dozens of pull requests.

If you are hit by at least one of the problems I described above and feel the pain you should talk to your boss to [sponsor my free time efforts](https://github.com/sponsors/staabm),
so I can spend more time on it, and you have less problems to deal with in your daily job.

Your task to upgrade your employers codebases to PHP 8.4 may be already in the pipeline :-).

### What's next?

The current plan is to make PHPStan aware of a narrowed [PHP-Version within the current scope](https://github.com/phpstan/phpstan-src/pull/3642) and utilize this information in type inference and error reporting.
This means while analyzing code we no longer just use a fixed PHP version configured in e.g. PHPStan NEON configuration, but also narrow it further down based on the code at hand.
Nearly all rules in the PHPStan core and 1st party extensions need to be adjusted.

Let me give you a few examples which currently don't work well, but should work much better after the project evolves:

At the time of writing PHPStan 2.0.2 will report null coalescing errors in your code only if you narrow down the PHP version by configuration.
This means you define the PHP version or version-range by NEON config, `composer.json` (as of PHPStan 2+) or implicitly by the PHP runtime version you are using for PHPStan.

Running the below example without additional configuration on PHP8 only will not yield any errors.
As of now you would need e.g. a separate CI job configured for PHP 7.3 or lower to catch the error.
In the future, I want PHPStan catch this error even when running on PHP8 or later and without additional configuration required:

```php

if (PHP_VERSION_ID < 70400) {
    // should error about null coalescing assign operator,
    // which requires PHP 7.4+
    $y['y'] ??= [];
} else {
    $y['x'] ??= [];
}

```

Another example: PHPStan is using a single knowledge base for return and parameter types of functions and methods.
This information is narrowed down by PHPStan Extensions when e.g. parameter values are known at static analysis time.
In the future I want to improve the type inference e.g. for cases where PHP used `resource` types in the past, but uses class/object types in more modern versions:

```php

class MySocket
{
  public function create(): ?Socket
  {
    if (PHP_VERSION_ID < 80000) {
        throw new RuntimeException('PHP 8.0 required');
    }

    // can only return `\Socket|false` but PHPStan sometimes
    // mixes it up with PHP7 `resource` type
    return socket_create(AF_INET, SOCK_DGRAM, SOL_UDP) ?: null;
  }
}

```

There are a lot of other problem areas, for which you see the errors only when PHPStan is configured with certain PHP versions:
- named arguments
- parameter contravariance
- return type covariance
- non-capturing exception catches
- native union types
- several deprecated features around how php-src handles parameters
- class constants
- legacy constructors
- parameter type widening
- `unset` cast
- multibyte string handling functions
- readonly properties
- readonly classes
- enums
- intersection types
- tentative return types
- array unpacking
- dynamic properties
- constants in traits
- php native attributes
- implicit parameter nullability

What you just read about is the result of my initial research.
I am pretty sure we will shape new ideas after iterating on the problems involved and the solutions we come up with.

I will work through the mentioned problem areas one after another, which also means your developer experience when using PHP
version specific language features with PHPStan should improve over time, release after release.

Do these problems sound relevant to you?
Please spread the word about my free time project and [retoot on Mastodon](https://phpc.social/@markusstaab/113559437972344037) or [retweet on Twitter/X](https://x.com/markusstaab/status/1862037669833769276).

### What's already done?

_this chapter will be updated to reflect the ongoing progress_

#### Narrow types by PHP_VERSION_ID

The first step in this direction was already achieved by making PHPStan aware of `composer.json` defined PHP version requirements
and taking this knowledge into account to narrow constants like `PHP_VERSION_ID` et. all. since PHPStan 2.0.

There is a dedicated blog post about this topic already: [PHPStan PHP Version Narrowing](https://staabm.github.io/2024/11/14/phpstan-php-version-narrowing.html)

#### Report deprecations in `ini_*()` functions

At the time of writing there are ~20 deprecated php.ini options.
A [new PHPStan rule](https://github.com/phpstan/phpstan-deprecation-rules/pull/120) was implemented which reports usages of `ini_*()` functions which use a deprecated option:

```php
<?php declare(strict_types = 1);

// new error:
// Call to function ini_get() with deprecated option 'assert.active'.
var_dump(ini_get('assert.active'));
```

[PHPStan playground snippet](https://phpstan.org/r/e0076edd-fb0d-4490-96cc-d3ff4356b0ae)
