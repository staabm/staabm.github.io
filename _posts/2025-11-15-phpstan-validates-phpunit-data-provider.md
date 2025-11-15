---
tags:
    - PHPStan
    - PHPUnit

image: "images/og-images/new-and-noteworthy-phpstan-phpunit-integration.jpg"

ogImage:
    title: "New and noteworthy: PHPStan and PHPUnit integration"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "new-and-noteworthy-phpstan-phpunit-integration"
---

### New and noteworthy: PHPStan and PHPUnit integration

In this article we will have a brief look into the latest update to [`phpstan/phpstan-phpunit`](https://github.com/phpstan/phpstan-phpunit) 2.0.8.

### PHPStan validates PHPUnit data providers

On of the features, which I am most proud of is the data provider validation.
It was requested by several people years ago, but we did not yet have a good idea how to make it happen without major changes in the PHPStan core.

Starting with this release, we take each data-set of a data-provider and check it against the signature of the corresponding test-case.

At the time of writing we support multiple kind of data-providers:
- `@test`
- `#[Test]`
- "test*" method name prefix
- `@dataProvider`
- `#[DataProvider]`
- `static` data-provider
- non-`static` data-provider
- `return []` data-providers
- `yield []` data-providers
- `yield from []` data-providers
- named arguments in data-providers

See it in action:

```php
#[DataProvider('aProvider')]
public function testTrim(string $expectedResult, string $input): void
{
}

public function aProvider(): array
{
   return [
      [
         'Hello World',
         " Hello World \n",
      ],
      [
         // Parameter #2 $input of method FooTest::testTrim() expects string, int given.
         'Hello World',
         123,
      ],
      [
         // Parameter #2 $input of method FooTest::testTrim() expects string, false given.
         'Hello World',
         false,
      ],
      [
         // Method FooTest::testTrim() invoked with 1 parameter, 2 required.
         'Hello World',
      ],
   ];
}
```

For this to happen we re-use existing rules for method call validation via the newly introduced [`NodeCallbackInvoker`](https://github.com/phpstan/phpstan-src/blob/2.1.x/src/Analyser/NodeCallbackInvoker.php).
This new interface allows us to create virtual made-up AST nodes, which are handled like regular method calls.

Related pull requests:
- [Implement DataProviderDataRule](https://github.com/phpstan/phpstan-phpunit/pull/238)
- [NodeCallbackInvoker](https://github.com/phpstan/phpstan-src/pull/4429)
- [CompositeRule](https://github.com/phpstan/phpstan-src/pull/4438)


### Ignore `missingType.iterableValue` for data-providers

You likely have been haunted by this error in your test-suite:

> Method DataProviderIterableValueTest\Foo::dataProvider() return type has no value type specified in iterable type iterable.

Even in the PHPStan-src codebase this error was ignored by NEON config in the past, as it was really not that useful to repeat all types in every data-provider,
which were already present in the test-case method signatures.

As you already saw in the above paragraph we learned how to validate data-providers with this release.
We went one step further and re-used the existing validation logic to omit the `missingType.iterableValue` error only for those data-providers which we are able to validate.
This is possible by [implementing a new `IgnoreErrorExtension`](https://github.com/phpstan/phpstan-phpunit/pull/246).


### Improved `assertArrayHasKey` inference

Based on a [fix in the PHPStan core](https://github.com/phpstan/phpstan-src/pull/4473), we are now able to properly narrow types after a call to PHPUnits' `assertArrayHasKey()`.
This will help to prevent false positive errors you may have experienced in the past.


### PHPUnit version detector

With the addition of [`PHPUnitVersionDetector`](https://github.com/phpstan/phpstan-phpunit/pull/248)
we will be able to easily implement rules or extensions tailored to certain PHPUnit versions.

This will be useful in the future, so we can for example assist in PHPUnit migrations and pave the way for a smoother upgrade path.


### Performance improvements

People reading my blog or social media posts know [my obsession in making things faster](https://staabm.github.io/archive.html#performance).
This release is no difference, as some changes have been done to make most PHPUnit specific rules [more efficient by reducing unnecessary work](https://github.com/phpstan/phpstan-phpunit/pull/247).


### Easter eggs included

There is even more magic under the hood.

We have a experimental feature in PHPStan which allows us to not just report errors, but also `--fix` some of them.
This new ability was also added to a few `assert*` rules.


### Summary

I spent a lot of time over a few weeks to make the PHPUnit integration shine. I feel we are on a totally new level and even more new cool stuff is getting possible.

Make sure your boss considers [sponsoring my open source work](https://github.com/sponsors/staabm), so I can spent more time no your beloved code quality tooling.

