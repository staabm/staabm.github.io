---
tags:
  - PHPStan

image: "images/og-images/phpstan-mixed-types.jpg"

ogImage:
  title: "A PHPStan mixed type journey"
  imageUrl: "https://staabm.github.io/staabm.svg"
  fileName: "phpstan-mixed-types"
---


A `mixed` typed represents the absence of type information. It is a union of all types, which means it can be anything.
This in turn leads to suboptimal PHPStan analysis results which can lead to missing errors or even false positives.

### A `mixed` type PHPStan journey

For a [few years](https://github.com/phpstan/phpstan-src/pulls?q=sort%3Aupdated-desc+is%3Apr+author%3Astaabm+is%3Amerged), I am now contributing to PHPStan with a focus on improving the type inference,
which means looking into code where `mixed` types are involved and figure out how the situation can be improved.

I will start to focus on a different PHPStan area soon, so I thought it would be a good time to summarize the achievements made.

In this article I want to share the most meaningful contributions to PHPStan core,
but also look at PHPStan extensions work which was helpful along the way.


#### Narrow types from if-conditions

What most situations we are looking at have in common is, that we have very little information at the beginning.
One useful tool to handle that is a subtractable type, which PHPStan is using for `mixed` for a long time already.
This means we don't describe what we know about a type, but instead we narrow it down by what we know it is not:

```php

function doFoo($mixed) {
  if ($mixed) {
    // $mixed can be anything but a falsey type
    \PHPStan\dumpType($mixed); // mixed~(0|0.0|''|'0'|array{}|false|null)
  }

  if (!$mixed) {
    // $mixed can be anything but a truethy type
    \PHPStan\dumpType($mixed); // 0|0.0|''|'0'|array{}|false|null
  }
}

```

The subtractable type narrowing is used in PHPStan strict-comparisons (e.g. `===` or `!==`) and for some very specific but often used code patterns already.
I was looking at cases where it was still missing like, type-casts in conditions:

```php

class Test {

  private ?string $param;

  function show() : void {
    if ((int) $this->param) {
      \PHPStan\dumpType($this->param); // string
    } elseif ($this->param) {
      \PHPStan\dumpType($this->param); // non-falsy-string
    }
  }

  function show2() : void {
    if ((float) $this->param) {
      \PHPStan\dumpType($this->param); // string|null
    } elseif ($this->param) {
      \PHPStan\dumpType($this->param); // non-falsy-string
    }
  }

  function show3() : void {
    if ((bool) $this->param) {
      \PHPStan\dumpType($this->param); // non-falsy-string
    } elseif ($this->param) { // Elseif condition is always false.
      \PHPStan\dumpType($this->param); // *NEVER*
    }
  }

  function show4() : void {
    if ((string) $this->param) {
      \PHPStan\dumpType($this->param); // non-empty-string
    } elseif ($this->param) { // Elseif condition is always false.
      \PHPStan\dumpType($this->param); // *NEVER*
    }
  }
}

```

Next I was looking into how a cast on already subtracted mixed types influences the results:

```php

/**
 * @param int|0.0|''|'0'|array{}|false|null $moreThenFalsy
 */
function subtract(mixed $m, $moreThenFalsy) {
  if ($m !== true) {
    assertType("mixed~true", $m);
    assertType('bool', (bool) $m); // mixed could still contain something truthy
  }
  if ($m !== false) {
    assertType("mixed~false", $m);
    assertType('bool', (bool) $m); // mixed could still contain something falsy
  }
  if (!is_bool($m)) {
    assertType('mixed~bool', $m);
    assertType('bool', (bool) $m);
  }
  if (!is_array($m)) {
    assertType('mixed~array<mixed, mixed>', $m);
    assertType('bool', (bool) $m);
  }

  if ($m) {
    assertType("mixed~(0|0.0|''|'0'|array{}|false|null)", $m);
    assertType('true', (bool) $m);
  }
  if (!$m) {
    assertType("0|0.0|''|'0'|array{}|false|null", $m);
    assertType('false', (bool) $m);
  }
  if (!$m) {
    if (!is_int($m)) {
      assertType("0.0|''|'0'|array{}|false|null", $m);
      assertType('false', (bool)$m);
    }
    if (!is_bool($m)) {
      assertType("0|0.0|''|'0'|array{}|null", $m);
      assertType('false', (bool)$m);
    }
  }

  if (!$m || is_int($m)) {
    assertType("0.0|''|'0'|array{}|int|false|null", $m);
    assertType('bool', (bool) $m);
  }

  if ($m !== $moreThenFalsy) {
    assertType('mixed', $m);
    assertType('bool', (bool) $m); // could be true
  }

  if ($m != 0 && !is_array($m) && $m != null && !is_object($m)) { // subtract more types then falsy
    assertType("mixed~(0|0.0|''|'0'|array<mixed, mixed>|object|false|null)", $m);
    assertType('true', (bool) $m);
  }
}

```

A case where we did not properly narrow types was in comparisons with `strlen()` and integer-range types:

```php

function narrowString(string $s) {
  $i = rand(0, 1) ? 1 : 5;
  if (strlen($s) == $i) {
    \PHPStan\dumpType($s); // non-empty-string
  }

  $i = rand(0, 1) ? 2 : 5;
  if (strlen($s) == $i) {
    \PHPStan\dumpType($s); // non-falsey-string
  }
}

```

This also works in a similar fashion when comparing the results of `substr()`:

```php

/**
 * @param non-empty-string $nonES
 * @param non-falsy-string $falsyString
 */
public function stringTypes(string $s, $nonES, $falsyString): void
{
  if (substr($s, 10) === $nonES) {
    assertType('non-empty-string', $s);
  }

  if (substr($s, 10) === $falsyString) {
    assertType('non-falsy-string', $s);
  }
}

```

A pretty complex field was to think about what `isset($array[$key])` means for the type of `$key`:

```php

/**
 * @param array<int, string> $intKeyedArr
 * @param array<string, string> $stringKeyedArr
 */
function narrowKey($mixed, string $s, int $i, array $generalArr, array $intKeyedArr, array $stringKeyedArr): void {
  if (isset($generalArr[$mixed])) {
    assertType('mixed~(array|object|resource)', $mixed);
  } else {
    assertType('mixed', $mixed);
  }
  assertType('mixed', $mixed);

  if (isset($generalArr[$i])) {
    assertType('int', $i);
  } else {
    assertType('int', $i);
  }
  assertType('int', $i);

  if (isset($intKeyedArr[$mixed])) {
    assertType('mixed~(array|object|resource)', $mixed);
  } else {
    assertType('mixed', $mixed);
  }
  assertType('mixed', $mixed);

  if (isset($intKeyedArr[$s])) {
    assertType("lowercase-string&numeric-string&uppercase-string", $s);
  } else {
    assertType('string', $s);
  }
  assertType('string', $s);

  if (isset($stringKeyedArr[$mixed])) {
    assertType('mixed~(array|object|resource)', $mixed);
  } else {
    assertType('mixed', $mixed);
  }
  assertType('mixed', $mixed);
}

function emptyString($mixed)
{
  // see https://3v4l.org/XHZdr
  $arr = ['' => 1, 'a' => 2];
  if (isset($arr[$mixed])) {
    assertType("''|'a'|null", $mixed);
  } else {
    assertType('mixed', $mixed); // could be mixed~(''|'a'|null)
  }
  assertType('mixed', $mixed);
}

function numericString($mixed, int $i, string $s)
{
  $arr = ['1' => 1, '2' => 2];
  if (isset($arr[$mixed])) {
    assertType("1|2|'1'|'2'|float|true", $mixed);
  } else {
    assertType('mixed', $mixed);
  }
  assertType('mixed', $mixed);
}

function arrayAccess(\ArrayAccess $arr, $mixed) {
  if (isset($arr[$mixed])) {
    assertType("mixed", $mixed);
  } else {
    assertType('mixed', $mixed);
  }
  assertType('mixed', $mixed);
}

```

#### Immediate-invoked-function-expression (IIFE)

A pattern know from javascript projects and sometimes also popping up in PHP code is immediately-invoked-function-expressions.
Type inference improvements for this pattern in particular was implemented to support [TwigStan](https://github.com/twigstan/twigstan):

```php

/** @param array{date: DateTime} $c */
function main(mixed $c): void{
  assertType('array{date: DateTime}', $c);
  $c['id']=1;
  assertType('array{date: DateTime, id: 1}', $c);

  $x = (function() use (&$c) {
    assertType("array{date: DateTime, id: 1}", $c);
    $c['name'] = 'ruud';
    assertType("array{date: DateTime, id: 1, name: 'ruud'}", $c);
    return 'x';
  })();

  assertType("array{date: DateTime, id: 1, name: 'ruud'}", $c);
}


/** @param array{date: DateTime} $c */
function main2(mixed $c): void{
  assertType('array{date: DateTime}', $c);
  $c['id']=1;
  $c['name'] = 'staabm';
  assertType("array{date: DateTime, id: 1, name: 'staabm'}", $c);

  $x = (function() use (&$c) {
    assertType("array{date: DateTime, id: 1, name: 'staabm'}", $c);
    $c['name'] = 'ruud';
    assertType("array{date: DateTime, id: 1, name: 'ruud'}", $c);
    return 'x';
  })();

  assertType("array{date: DateTime, id: 1, name: 'ruud'}", $c);
}

```

#### New PHPStan doc-types

To express types better a few phpdoc improvements have been implemented
- [`non-falsy-string`](https://staabm.github.io/2022/08/11/phpstan-non-falsy-string.html)
- [`@param-out`](https://github.com/phpstan/phpstan-src/pull/1804)
- support for [`value-of<BackedEnum>`](https://github.com/phpstan/phpstan-src/pull/1082)
- [`@pure-unless-callable-is-impure`](https://github.com/phpstan/phpdoc-parser/pull/253)
- [`@pure-unless-parameter-passed`](https://github.com/phpstan/phpdoc-parser/pull/259)
- [`@require-extends and @require-implements`](https://staabm.github.io/2024/01/15/phpstan-require-extends-implements.html)


Whats great about new phpdoc types is, that we can utilize them in stubs shipped with PHPStan releases, but they can also be used in any userland php codebase to help improve static analysis results.

If PHPStan would infer all this information from the source it would be a lot slower as it is right now.

By adding doc-types you also give information/semantic to the code and tell about your intents.
This is something not only helpful for the tooling but also developers reading your implementation.

That way PHPStan can tell you whether expectations are right or whether you are lying :-).


#### New PHPStan Extension types

Using [ParameterOutTypeExtensions](https://github.com/phpstan/phpstan-src/pull/3083) by-reference parameters can be programmatically and context-sensitively narrowed for functions/methods since PHPStan 1.11.6.
This was later on used to improve by-reference parameter type inference after calls to `parse_str` and `preg_match*`.

#### Utilizing information outside the PHP Source

A different take was used to improve type inference of the `$matches` by-ref parameter of `preg_match()` based on a REGEX abstract syntax tree.
It's a complex story on its own with a [dedicated array shape match inference article](https://staabm.github.io/2024/07/05/array-shapes-for-preg-match-matches.html).

Similar improvements landed for the `printf()` family of functions, see [PHPStan sprintf/sscanf type inference](https://staabm.github.io/2022/06/23/phpstan-sprintf-sscanf-inference.html).

Last but not least a PHPStan extension named `phpstan-dba` was created which introspects the database schema
to implement type inference for the database access layer via SQL abstract syntax tree.
This is covered by a [series of blog posts](https://staabm.github.io/archive.html#phpstan-dba).


### After one focus area is before the next

This article highlighted only a few of the many contributions I made to PHPStan in the [last](https://staabm.github.io/2023/12/07/contribution-summary-2023.html) [years](https://staabm.github.io/2022/12/20/2022-wrap-up.html).

A big thank-you goes out to [all my sponsors and supporters](https://github.com/sponsors/staabm), who make it possible for me to work on PHPStan and other open-source projects.

While closing this type inference focus chapter, I am looking forward to the next challenges.
What comes up next will be the topic of a future blog post.

stay tuned ⚡️
