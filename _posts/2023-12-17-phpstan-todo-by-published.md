---
tags:
    - PHPStan

image: "images/og-images/phpstan-todo-by.jpg"

ogImage:
    title: "new PHPStan extension released"
    subtitle: "declare expiration criteria for your code comments"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "phpstan-todo-by"
---

### Published: phpstan-todo-by

Inspired by [parker-codes/todo-by](https://github.com/parker-codes/todo_by) I recently created [phpstan-todo-by](https://github.com/staabm/phpstan-todo-by) - a new PHPStan extension to check for TODO comments with expiration.

The [announcement tweet](https://twitter.com/markusstaab/status/1735393080704934343) / [toot](https://phpc.social/@markusstaab/111580606678002075) got a lot of attention and I received a lot of positive feedback.
If you did not yet re-tweeted it already, please do so now :-).

The project already [got 50 stars](https://github.com/staabm/phpstan-todo-by/stargazers) within the first week after announcement.


#### Examples

The main idea is, that comments within the source code will be turned into PHPStan errors when a condition is satisfied, e.g. a date reached, a version met.

```php
<?php

// TODO: 2023-12-14 This comment turns into a PHPStan error as of 14th december 2023
function doFoo() {

}

// TODO: <1.0.0 This has to be in the first major release of this repo
function doBar() {

}

// TODO: phpunit/phpunit:5.3 This has to be fixed when updating phpunit to 5.3.x or higher
function doFooBar() {

}

// TODO: php:8 drop this polyfill when php 8.x is required

```

## Supported todo formats

A todo comment can also consist of just a constraint without any text, like `// @todo 2023-12-14`.
When a text is given after the date, this text will be picked up for the PHPStan error message.

- the `todo`, `TODO`, `tOdO` keyword is case-insensitive
- the `todo` keyword can be suffixed or prefixed by a `@` character
- a username might be included after the `todo@`
- the comment might be mixed with `:` or `-` characters
- multi line `/* */` and `/** */` comments are supported

The comment can expire by different constraints, examples are:
- by date with format of `YYYY-MM-DD` matched against the [reference-time](https://github.com/staabm/phpstan-todo-by#reference-time)
- by a semantic version constraint matched against the projects [reference-version](https://github.com/staabm/phpstan-todo-by#reference-version)
- by a semantic version constraint matched against a Composer dependency (matched against `composer.lock`)

Find more details and configuration options in the [projects README](https://github.com/staabm/phpstan-todo-by/blob/main/README.md).

## Give back

In case you find [my PHPStan contributions](https://github.com/phpstan/phpstan-src/pulls?q=is%3Apr+sort%3Aupdated-desc+author%3Astaabm+is%3Amerged) and/or this tool useful, [please consider supporting my open source work](https://github.com/sponsors/staabm).
