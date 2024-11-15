---
tags:
- PHPStan

image: "images/og-images/phpstan-non-falsy-string-type.jpg"

ogImage:
  title: "New PHPStan type: non-falsy-string"
  imageUrl: "https://staabm.github.io/staabm.svg"
  fileName: "phpstan-non-falsy-string-type"
---

Recently my [pull request was merged which adds `non-falsy-string`](https://github.com/phpstan/phpstan-src/pull/1542) to the PHPStan type system.

## Whats the problem?

Until PHPStan 1.8.2 we faced the problem that the existing `non-empty-string` did not exclude `'0'`, which is kind of a magic string in PHP.

While it makes sense in some situations like

```php
var_dump((bool) '0'); // bool(false)
var_dump((bool) '1'); // bool(true)
```

there are some really weird cases, e.g. when checking for emptiness:
```php
var_dump(empty('')); // bool(true)
var_dump(empty('0')); // bool(true)
var_dump(empty('1')); // bool(false)
```

The important point is, that a string, if it contains just `'0'` is considered empty.

In PHPStan 1.8.2 this leads to unexpected errors ([PHPStan Bug 5370](https://github.com/phpstan/phpstan/issues/5370), [PHPStan Bug 5317](https://github.com/phpstan/phpstan/issues/5317)) , see e.g.
- [https://phpstan.org/r/0c622014-5d30-41df-8534-240498b80630](https://phpstan.org/r/0c622014-5d30-41df-8534-240498b80630)
- [https://phpstan.org/r/0d0ff87d-1142-4c8d-887a-9ea257c0540b](https://phpstan.org/r/0d0ff87d-1142-4c8d-887a-9ea257c0540b)
- [https://phpstan.org/r/af765852-8582-480e-8225-6457ee0b214e](https://phpstan.org/r/af765852-8582-480e-8225-6457ee0b214e)

because most of the type-system used `non-empty-string` which might include a `'0'`.

## `non-falsy-string` to the rescue

Considering these edge cases, it makes sense to establish a `non-falsy-string` value.
Its effectively a subtype of `non-empty-string`, but it excludes `'0'`.

In other words, the upcoming PHPStan release (I guess it will be 1.9.0; might be 1.8.3 though)
can handle this cases better and no longer produces the mentioned false positive errors.

For those interested in the details can see the corresponding NodeScopeResolverTest,
which shows us how a `non-falsy-string` intersects/interacts with other existing types and what to expect:

_the first argument to `assertType` shows the resulting return-type of the expression given as second argument_

```php
<?php

namespace NonFalseyString;

use function PHPStan\Testing\assertType;

class Foo {
  /**
   * @param non-falsy-string $nonFalseyString
   */
  public function bar($nonFalseyString) {
    assertType('int<min, -1>|int<1, max>', (int) $nonFalseyString);
  }

  /**
   * @param numeric-string $s
   */
  function removeZero(string $s) {
    if ($s === '0') {
      return;
    }

    assertType('non-falsy-string', $s);
  }

  /**
   * @param non-empty-string $nonEmpty
   */
  public function doBar5(string $s, $nonEmpty): void
  {
    if (2 <= strlen($s)) {
      assertType('non-falsy-string', $s);
    }
    assertType('string', $s);

    if (3 === strlen($s)) {
      assertType('non-falsy-string', $s);
    }
    assertType('string', $s);

    if (2 <= strlen($nonEmpty)) {
      assertType('non-falsy-string', $nonEmpty);
    }
  }

  /**
   * @param numeric-string $numericS
   * @param non-falsy-string $nonFalsey
   * @param non-empty-string $nonEmpty
   * @param literal-string $literalString
   */
  function concat(string $s, string $nonFalsey, $numericS, $nonEmpty, $literalString): void
  {
    assertType('non-falsy-string', $nonFalsey . '');
    assertType('non-falsy-string', $nonFalsey . $s);

    assertType('non-falsy-string', $nonFalsey . $nonEmpty);
    assertType('non-falsy-string', $nonEmpty . $nonFalsey);

    assertType('non-falsy-string', $nonEmpty . $nonEmpty);

    assertType('non-falsy-string', $nonFalsey . $literalString);
    assertType('non-falsy-string', $literalString . $nonFalsey);

    assertType('non-falsy-string', $nonFalsey . $numericS);
    assertType('non-falsy-string', $numericS . $nonFalsey);

    assertType('non-falsy-string', $nonEmpty . $numericS);
    assertType('non-falsy-string', $numericS . $nonEmpty);
  }

  /**
   * @param non-falsy-string $nonFalsey
   * @param non-empty-array<non-falsy-string> $arrayOfNonFalsey
   * @param non-empty-array $nonEmptyArray
   */
  function stringFunctions(string $s, $nonFalsey, $arrayOfNonFalsey, $nonEmptyArray)
  {
    assertType('string', implode($nonFalsey, []));
    assertType('non-falsy-string', implode($nonFalsey, $nonEmptyArray));
    assertType('non-falsy-string', implode($nonFalsey, $arrayOfNonFalsey));
    assertType('non-falsy-string', implode($s, $arrayOfNonFalsey));

    assertType('non-falsy-string', addslashes($nonFalsey));
    assertType('non-falsy-string', addcslashes($nonFalsey));

    assertType('non-falsy-string', escapeshellarg($nonFalsey));
    assertType('non-falsy-string', escapeshellcmd($nonFalsey));

    assertType('non-falsy-string', strtoupper($nonFalsey));
    assertType('non-falsy-string', strtolower($nonFalsey));
    assertType('non-falsy-string', mb_strtoupper($nonFalsey));
    assertType('non-falsy-string', mb_strtolower($nonFalsey));
    assertType('non-falsy-string', lcfirst($nonFalsey));
    assertType('non-falsy-string', ucfirst($nonFalsey));
    assertType('non-falsy-string', ucwords($nonFalsey));
    assertType('non-falsy-string', htmlspecialchars($nonFalsey));
    assertType('non-falsy-string', htmlentities($nonFalsey));

    assertType('non-falsy-string', urlencode($nonFalsey));
    assertType('non-falsy-string', urldecode($nonFalsey));
    assertType('non-falsy-string', rawurlencode($nonFalsey));
    assertType('non-falsy-string', rawurldecode($nonFalsey));

    assertType('non-falsy-string', preg_quote($nonFalsey));

    assertType('non-falsy-string', sprintf($nonFalsey));
    assertType('non-falsy-string', vsprintf($nonFalsey, []));

    assertType('int<1, max>', strlen($nonFalsey));

    assertType('non-falsy-string', str_pad($nonFalsey, 0));
    assertType('non-falsy-string', str_repeat($nonFalsey, 1));

  }

  /**
   * @param non-falsy-string $nonFalsey
   * @param positive-int $positiveInt
   * @param 1|2|3 $positiveRange
   * @param -1|-2|-3 $negativeRange
   */
  public function doSubstr($nonFalsey, $positiveInt, $positiveRange, $negativeRange): void
  {
    assertType('non-falsy-string', substr($nonFalsey, -5));
    assertType('non-falsy-string', substr($nonFalsey, $negativeRange));

    assertType('non-falsy-string', substr($nonFalsey, 0, 5));
    assertType('non-falsy-string', substr($nonFalsey, 0, $positiveRange));

    assertType('non-falsy-string', substr($nonFalsey, 0, $positiveInt));
  }
}
```

## Cross tool compatibility

In Psalm the `non-falsy-string` type is available since 4.5.0 with the same semantics.

[Discussing the new addition on Twitter](https://twitter.com/seldaek/status/1552583227893743616) lead some interesting results.
The double negative name `non-falsy-string` is pretty hard to reason about, so we came to the [conclusion to add a `truthy-string` alias](https://github.com/phpstan/phpstan-src/pull/1594).
[Psalm maintainers also agreed](https://twitter.com/orklah/status/1552706224541638660) to add the alias, ~~but I am not sure if it was implemented already.~~ and [I went ahead and send a patch](https://github.com/vimeo/psalm/pull/8400).

## Early feedback

In case you are curious and want to try out the new type, give it a shot at the [https://phpstan.org/try](https://phpstan.org/try) sandbox.

## 💌 Support my open source activities

Honor the work I am doing in my freetime by [sponsoring me](https://github.com/sponsors/staabm).

## Summary

Adding a new type is a rare task and it required collaboration of a few different people.

Especially getting `isSuperType()` and `isSubType()` implementations correct is quite a challenge.
Having end-user code examples with actual vs. expected types and error messages helps to work through all the details.

Thanks to everyone involved.

