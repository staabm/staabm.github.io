---
tags:
    - PHPStan

image: "images/og-images/array-shape-for-preg-match-matches.jpg"

ogImage:
    title: "The journey to precise $matches for preg_match() in PHPStan"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "array-shape-for-preg-match-matches"
---


In August 2023, I started into an adventure which in the end took me 10 months to figure out.
It's another part about my ongoing efforts to close blind spots in PHPStan's type inference.

I did similar things before with `phpstan-dba`, which implements SQL based [static analysis and type inference for the database access layer](https://staabm.github.io/archive.html#phpstan-dba).


### The journey to precise array-shapes for `preg_match` $matches

In its most basic form, we search for the answer to the following question:
How does the `$matches` array look like after a `preg_match` call?

```php
function doFoo(string $s): void {
    if (preg_match('/(?:(a)(\d))?(c)(\s)*/', $s, $matches)) {
        // how can $matches look like at this line?
    } else {
        // how can $matches look like at this line?
    }
    // how can $matches look like at this line?
}
```

I am not aware of any static analysis tool which is able to figure this out,
so it kind of was clear that this will take a few experiments and time-consuming research.
Play with the [example in the PHPStan playground](https://phpstan.org/r/c4c1ac4b-93ec-4b67-9ca0-b4aa836c847d).

To explore a possible solution, I had to answer a few questions:
- Which capturing groups (named vs. unnamed) are contained in the used pattern?
- Which capturing groups are optional/conditional?
- How do the capturing groups relate to the array-shape of `$matches`?
- How can the `$flags` parameter influence the array-shape of `$matches`?
- How do the resulting array-shapes flow through the branches of the if-else construct?
- How to implement this type-inference improving mechanism in a way, that other `preg_match` wrapping libraries could benefit from it (e.g. `composer/pcre`, `nette/utils`)?

Thanks to the great PHPStan community a few other people stopped by and helped me with some super special corner cases.
Also adding more test-cases to the initial prototype was really helpful to get a high quality implementation in the end.

TL;DR: The feature is already merged into PHPStan starting with 1.11.6 and can be enabled via [Bleeding Edge](https://phpstan.org/blog/what-is-bleeding-edge).

**Update**: Starting with PHPStan 1.12.x [precise type inference for regular expressions is enabled by default](https://phpstan.org/blog/phpstan-1-12-road-to-phpstan-2-0).

Most relevant pull requests along the road were...
- the [very first iteration](https://github.com/phpstan/phpstan-src/pull/2589)
- implementation of [ParameterOutTypeExtensions](https://github.com/phpstan/phpstan-src/pull/3083)
- improvements in the [type-specifier to handle non-strict comparisons](https://github.com/phpstan/phpstan-src/pull/3175)
- drop the regex pattern hack and do [everything in the regex AST](https://github.com/phpstan/phpstan-src/pull/3184)
- handling of [optional top level groups](https://github.com/phpstan/phpstan-src/pull/3189)
- handling of [top level alternation groups](https://github.com/phpstan/phpstan-src/pull/3202)

Figuring this one out was a joy, sometimes frustrating, and a time-consuming task.
It's a thing no other static analyzer I am aware of can handle and it will save any PHPStan user fiddling with `preg_match` a lot of time and effort.
Please [considering sponsoring my open-source efforts 💕](https://github.com/sponsors/staabm).

TL;DR aside, lets dive into it...


### Which capturing groups are contained in the used pattern?

One of the easier questions at first sight, since the initial requester of the above feature provided a [regex pattern hack](https://3v4l.org/sOXbn) which obviously provided this information.
I went with this hack for a few months and moved along.

While adding more and more test-cases with different patterns, we realized that the hack was not reliable.
It needed a few tweaks to also work with named capturing. It does not work consistently across PHP versions.

As an alternative I started playing around with [`Hoa\Regex`](https://github.com/hoaproject/Regex), a library already contained in PHPStan to build a abstract syntax tree (AST) for regex patterns.
It's the only library I could find in the PHP ecosystem suitable for this task. An additional complication is, that this library is not maintained anymore and has a few bugs.
To get the AST parsing up to speed, I had to backport a few yet unreleased fixes from the upstream repository and with the support of Michael Voříšek we were able to fix the grammar file so named capturing groups were properly recognized.

In the end we decided to go with the AST parsing, since it was more reliable and also was the only solution which would work consistently for all php versions PHPStan 1.x supports (PHP 7.2+).


### Which capturing groups are optional/conditional? How do the capturing groups relate to the array-shape of `$matches`?

In early prototype stage I had implemented a hybrid approach between the regex pattern hack and the AST parsing.
We used the AST to identify which capturing groups would be contained and the pattern hack with `PREG_UNMATCHED_AS_NULL` to get an idea of the optional/conditional groups.
`PREG_UNMATCHED_AS_NULL` started [working properly in PHP 7.4](https://www.php.net/manual/en/migration74.incompatible.php#migration74.incompatible.pcre), so making this work consistently across php-versions was another problem to solve.

Later I re-implemented the optional/conditional capturing group detection with plain AST based logic, which was a hell of a ride on its own.
The main quest was to figure out when `preg_match` would leave out a capturing group from `$matches` (trailing optional groups) and how to properly structure the shape,
when optional capturing groups are involved before mandatory capturing groups.
Additionally, it's not that easy to figure out, when a capturing group is optional or conditional.
A group might be part of an alternation like `(?:(\d)|(\w))` or `(?:(\d)|(\w)|no-group)`.
An alternation element might be optional on its own - as in `(?:(\d)*|(\w))` - or the whole alternation might be optional like in `(?:(\d)|(\w))?` - or a mix of all that.
As you might already imagine the field is pretty complex and doing the regex AST dance properly is quite a challenge.

You can find what was needed to get this working in the related classes: [RegexArrayShapeMatcher](https://github.com/phpstan/phpstan-src/blob/f546c37a4da85a7ffb4c0718a01479c690776322/src/Type/Php/RegexArrayShapeMatcher.php), [RegexCapturingGroup](https://github.com/phpstan/phpstan-src/blob/f546c37a4da85a7ffb4c0718a01479c690776322/src/Type/Php/RegexCapturingGroup.php), [RegexNonCapturingGroup](https://github.com/phpstan/phpstan-src/blob/f546c37a4da85a7ffb4c0718a01479c690776322/src/Type/Php/RegexNonCapturingGroup.php).

At this point the [implementation got simpler](https://github.com/phpstan/phpstan-src/pull/3184) because we no longer had this hybrid thing.

Ondřej was also pretty happy about that:

[<img width="658" alt="grafik" src="/images/post-images/preg-match-array-shapes/purrrfect.png">](https://github.com/phpstan/phpstan-src/pull/3184#issuecomment-2188728831)


### How can the `$flags` parameter influence the array-shape of `$matches`?

That one was easier than the others. Bonus points were in because possible flags are php-version specific.
Flags like `PREG_UNMATCHED_AS_NULL` can also lead to `$matches` to contain `null` values.
`PREG_OFFSET_CAPTURE` will lead to a different array-shape, since values will be accompanied by their offset in the input string.


### How do the resulting array-shapes flow through the branches of the if-else construct?

Let's have a look back at our initial example:

```php
function doFoo(string $s): void {
    if (preg_match('/(?:(a)(\d))?(c)(\s)*/', $s, $matches)) {
        // (a) how can $matches look like at this line?
    } else {
        // (b) how can $matches look like at this line?
    }
    // (c) how can $matches look like at this line?
}
```

One might think getting it resolved should be some kind of already solved puzzle. `preg_match` needs some special treatment though,
because of the by-ref `$matches` arg is changing the variable outside the if-branch scope.
See the following example which asserts the expected PHPStan type-inference within the given branches:

```php
use function PHPStan\Testing\assertType;

function doFoo(string $s): void {
    if (preg_match('/(?:(a)(\d))?(c)(\s)*/', $s, $matches)) {
        // (a)
        assertType('array{0: string, 1: string, 2: string, 3: string, 4?: string}', $matches);
    } else {
        // (b)
        assertType('array{}', $matches);
    }
    // (c)
    assertType('array{}|array{0: string, 1: string, 2: string, 3: string, 4?: string}', $matches);
}
```

- In the `(a)` branch, the pattern surely matches, so the array-shape consists of a mix of always-matched and sometimes-matched offsets
- In the `(b)` branch, the pattern surely does not match, so the array-shape is empty
- In the `(c)` branch, we don't know whether the pattern matched, therefore the array-shape could be empty or a match

If you are interested in other test-cases and the types PHPStan can understand in these situations, please [consult the test-suite](https://github.com/phpstan/phpstan-src/blob/f546c37a4da85a7ffb4c0718a01479c690776322/tests/PHPStan/Analyser/nsrt/preg_match_shapes.php).
Alternatively copy the example code, drop it into the [PHPStan online playground](https://phpstan.org/try) (don't forget to enable the 'Bleeding Edge' checkbox) and see the expected types.

In an early prototype I was using only a [TypeSpecifyingExtension](https://phpstan.org/developing-extensions/type-specifying-extensions) to override the type of `$matches`. This lead to some consequential problems though.
TypeSpecifyingExtension are meant to narrow an existing type for the if-branch and/or the else-branch. It will not change the types after the if/else construct though.

We had to come up with a new type of PHPStan extension to properly handle the by-ref `$matches` argument.
Up to this point in time a `param-out` type could only be defined using phpDoc.
So we implemented [ParameterOutTypeExtensions](https://github.com/phpstan/phpstan-src/pull/3083) which allow to define `param-out` types programmatically and in a context-sensitive way.

The idea is, to use a `FunctionParameterOutTypeExtension` to type `$matches` the way the outer scope expects it to be (see `(c)`).
On top, we use a `FunctionTypeSpecifyingExtension` to narrow this type for the if-branch `(a)` and/or the else-branch `(b)`.


### How to implement this type-inference improving mechanism in a way, that other `preg_match` wrapping libraries could benefit from it?

In the previous chapter we learned what PHPStan needs to ship in its core to support $matches type-inference for the `preg_match` function.
The mentioned `FunctionParameterOutTypeExtension` and `FunctionTypeSpecifyingExtension` both rely on the magic which happens in `RegexArrayShapeMatcher`, which is doing the heavy lifting.

This `RegexArrayShapeMatcher`-class is declared as `@api` which means it is meant for use by other extensions outside the phpstan-src repository.
We use it to implement the same type [inference capabilities in nette/utils](https://github.com/phpstan/phpstan-nette/commit/3e68a5d7f0be96bb97b3a8770391b23dfdc07c08) or [composer/pcre](https://github.com/composer/pcre/pull/24).
You might also use this class to build custom extensions for your very own `preg_match`-wrapping API.


### Future work

For the future is planned to
- stabilize the implementation to [make it general available](https://github.com/phpstan/phpstan-src/commit/bd2cec118592f7c66dff5a7ae28882654daf6468) (without Bleeding Edge)
- [finalize the `composer/pcre` integration](https://github.com/composer/pcre/releases/tag/2.2.0)
- [finalize the PHP-CS-Fixer `Preg::match` integration](https://github.com/PHP-CS-Fixer/PHP-CS-Fixer/pull/8103)
- use similar type narrowing for `preg_match_all` and maybe other functions
- [use more precise types](https://github.com/phpstan/phpstan/issues/11222) when possible


### Support my open source work

In case this article was useful, or you want to honor the effort I put into one of the hundreds of pull-requests to PHPStan, please [considering sponsoring my open-source efforts 💕](https://github.com/sponsors/staabm).
