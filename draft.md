---
tags:
    - PHPStan

image: "images/og-images/phpstan-todo-by.jpg"

ogImage:
    title: "new PHPStan extension released"
    subtitle: "declare expiration dates for your code comments"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "phpstan-todo-by"
---

### Published: phpstan-todo-by

Inspired by [parker-codes/todo-by](https://github.com/parker-codes/todo_by) I recently created [phpstan-todo-by](https://github.com/staabm/phpstan-todo-by) - a new PHPStan extension.
A extension to check for TODO comments with expiration date.

The [announcement tweet](https://twitter.com/markusstaab/status/1735393080704934343) / [toot](https://phpc.social/@markusstaab/111580606678002075) got a lot of attention and I received a lot of positive feedback.
If you did not yet re-tweeted it already, please do so now :-).

The project already [got 50 stars](https://github.com/staabm/phpstan-todo-by/stargazers) within the first week after announcement.


#### Example:

```php
<?php

// TODO: 2023-12-14 This comment turns into a PHPStan error as of 14th december 2023
function doFoo() {

}

```


#### Supported todo formats

In the very first release we started with a todo format compatible with the project this extension took inspiration from.

Since then we added support for more formats, because of popular demand.
- the `todo`, `TODO`, `tOdO` keyword is now case-insensitive
- the `todo` keyword can be suffixed or prefixed by a `@` character
- a username might be included after the `@`
- the comment might be mixed with `:` or `-` characters
- multi line `/* */` and `/** */` comments are supported

examples supported as of version 0.1.5:

```php
// @todo: 2023-12-14 fix it
// @todo 2023-12-14: fix it
// todo - 2023-12-14 fix it
// todo 2023-12-14 - fix it

// TODO@lars 2023-12-14 - fix it
// TODO@lars: 2023-12-14 - fix it

/*
 * other text
 *
 * @todo 2023-12-14 classic multi line comment
 *   more comment data
 */
```

## Give back

In case you find [my PHPStan contributions](https://github.com/phpstan/phpstan-src/pulls?q=is%3Apr+sort%3Aupdated-desc+author%3Astaabm+is%3Amerged) and/or this tool useful, [please consider supporting my open source work](https://github.com/sponsors/staabm).
