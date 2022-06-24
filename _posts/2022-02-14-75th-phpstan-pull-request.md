---
tags:
- PHPStan
---

This post describes how I started into PHPStan. You can get a feeling of how I approach complex things and start building a mental model about a new problem domain.


## today [my 75th pull request to PHPStan](https://twitter.com/markusstaab/status/1493167116056465416) was merged

Looking back I had a great journey contributing to PHPStan.

All started on the 11th Nov 2019, with [a small PR fixing some windows-only glitches](https://github.com/phpstan/phpstan-src/pull/8).
At that time the PHPStan development setup was mainly used on macOS, so I had to fix a few windows DX things before starting into the real business.

As a newcomer to the project, I firstly worked on things I had expertise with, [like improving DX](https://github.com/phpstan/phpstan-src/pull/51) and [integration with the Github Actions pipeline](https://github.com/phpstan/phpstan-src/pull/317).


### `non-empty-string` inference improvements

To get a better feeling of the static analysis problem domain, I approached a simple problem at first, namely [`non-empty-string` inference in url-functions](https://github.com/phpstan/phpstan-src/pull/575).
I got addicted by the `non-empty-string` thing and introduced it in different array functions, like [`array_combine`](https://github.com/phpstan/phpstan-src/pull/578), [`array_merge`](https://github.com/phpstan/phpstan-src/pull/581), [`array_flip`](https://github.com/phpstan/phpstan-src/pull/583) etc.

If you are curious, [I did this very same thing for a lot of functions](https://github.com/phpstan/phpstan-src/pulls?q=is%3Apr+sort%3Aupdated-desc+author%3Astaabm+is%3Amerged++non-empty-string).

Why is this useful you might think? The more PHPStan is able to learn about more precise types while scanning your code,
the less boilerplate code is required to persuade the tool of what you are trying to do.


### `positive-int`, `integer-range`-type and math

After getting this `non-empty-string` thing working, I concentrated my efforts on `integer` semantics.
Doing similar things as before, I firstly worked on getting `positive-int` [type coverage into a few functions](https://github.com/phpstan/phpstan-src/pulls?q=is%3Apr+sort%3Aupdated-desc+author%3Astaabm+is%3Amerged+positive-int).

[Ondrey](https://github.com/ondrejmirtes) guided me through all this - as always - and gave me a few pointers regarding the [IntegerRangeType](https://github.com/phpstan/phpstan-src/blob/e12b4c487c9c7401a7434b682666a4209099349d/src/Type/IntegerRangeType.php).
I taught PHPStan math on integer ranges, so it was able to figure out stuff like:

```php
/**
 * @param int<0, 10> $range1
 * @param int<3, 9> $range2
 * @param int<4, 5> $range3
 * @param int $int
 */
public function integerRangeMaxima($range1, $range2, $range3, $int) {
    assertType('int', min($range1, $range2, $int));
    assertType('int', max($range1, $range2, $int));

    assertType('int<0, 5>', min($range1, $range2, $range3));
    assertType('int<4, 10>', max($range1, $range2, $range3));
}

/**
 * @param int<1, 10> $r1
 * @param int<5, 10> $r2
 * @param int<5, max> $rMax
 */
public function math($r1, $r2, $rMax) {
    assertType('int<5, 14>', $r1 + 4);
    assertType('int<-3, 6>', $r1 - 4);
    assertType('int<4, 40>', $r1 * 4);
    assertType('float|int<0, 2>', $r1 / 4);
    assertType('int<9, max>', $rMax + 4);
    assertType('int<1, max>', $rMax - 4);
    assertType('int<20, max>', $rMax * 4);
    assertType('float|int<1, max>', $rMax / 4);

    assertType('int<6, 20>', $r1 + $r2);
    assertType('int<-9, 5>', $r1 - $r2);
    assertType('int<5, 100>', $r1 * $r2);
    assertType('float|int<0, 1>', $r1 / $r2);
}
```

It took me a [lot of PRs to work out all the rough edges](https://github.com/phpstan/phpstan-src/pulls?q=is%3Apr+sort%3Aupdated-desc+author%3Astaabm+is%3Amerged+range), but it was so much fun.
If you are interested, have a [look at all those test-cases covered](https://github.com/staabm/phpstan-src/blob/c4a662ac6c3ec63f063238880b243b5399c34fcc/tests/PHPStan/Analyser/data/integer-range-types.php#L198-L331).


### `non-empty-array` inference

You guessed it already... In a similar fashion I worked on previous topics, I started working on `non-empty-array` inference.
As soon as PHPStan knows when arrays cannot be empty, it is able to help you by e.g. identifying redundant code like `count($array) === 0`.

When `non-empty-array` is used in combination with loops like `foreach` or `for`, PHPStan can assume a loop-body is evaluated at least once.
This in turn help making things possible like detecting dead code:

```php
/**
 * @param non-empty-array<mixed> $array
 */
public function sayHello($array): void
{
    $x = null;
    foreach($array as $value) {
        $x = 25;
    }
    
    // since foreach will be iterated at least once,
    // $x can never be `null` at this point
    if ($x === null) { 
    }
}
```
__[try this snippet on phpstan.org/try](https://phpstan.org/r/597e97ed-eef8-401a-85f9-abb28526316e)__


## 💌 Support my open source activities

In case you find this stuff useful, and your daily business depends on PHPStan understanding your code [consider supporting my work](https://github.com/sponsors/staabm). 