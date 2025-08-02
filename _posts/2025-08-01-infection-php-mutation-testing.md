---
tags:
    - Infection
    - Mutation Testing

image: "images/og-images/infection-php-mutation-testing.jpg"

ogImage:
    title: "Mutation testing with Infection in PHP"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "infection-php-mutation-testing"
---

### Mutation testing with Infection in PHP

Recently I started playing with [Infection](https://infection.github.io/), a mutation testing framework for PHP.
Mutation testing is a technique to evaluate the quality of your tests.

This article describes my personal experience and ideas about mutation testing.
I am intentionally not describing the theory behind it, but focus on my personal hands-on experience.

It was a natural choice for me to look into this topic, as it combines several concepts I am interested in:
- Automated testing
- Abstract syntax tree (AST) based analysis and manipulation
- Static analysis
- Type inference
- Code quality tooling

After getting used to Infection and applying it to my own projects, I started to contribute to the project itself.
As usual, I start reporting issues with ideas for improvements and questions about my understanding of the approach.
The maintainers were very responsive and helpful, which made it easy to get started.
Within ~2 months I was able to contribute [~85 pull requests](https://github.com/infection/infection/pulls?q=sort%3Aupdated-desc+is%3Apr+is%3Aopen+author%3Astaabm).

So let's have a top level look at the tool.

### What to expect from mutation testing?

From my point of view what you get from applying mutation testing is:
- more precise metric for your test suite quality
- a copilot for writing better tests
- dead code detection

#### more precise metric for your test suite quality

After running Infection on your codebase, you will get a report with a [mutation score indicator (MSI)](https://infection.github.io/guide/#Metrics-Mutation-Score-Indicator-MSI).
It's a metric which describes how likely you or your colleagues can introduce a new bug/regression into your codebase without your quality tooling noticing it.
The higher the MSI, the more likely it is that your tooling will catch the bug.

In contrast, you might expect from your code line coverage report that any bug introduced in a covered line will be caught by your tests.
However, this is not the case, as your tests might not be precise enough to catch the problem.

#### a copilot for writing better tests

Let's have a look at a simple example:

```php
if ($x > 0) {
    echo "hello world";
}
```

To cover this simple code with tests, you can do multiple mistakes:
- you could assert only the positive case but forget to assert the negative case
  - does the implementation produces the correct output depending on the condition?
  - do your tests assert expectations when the condition is not met?
- you could add tests which do not properly cover the boundary of the `x > 0`  expression, meaning off-by-one errors will not be detected
  - e.g. you need to verify whether it should be `$x >= 0` or `$x > 1` or `$x < 0` etc.

Running infection will give you examples (escaped mutants) to give some inspiration what your test-suite does not cover properly.
See the [above example in the Infection playground](https://infection-php.dev/r/23mw) in action.

For instance, the following escaped mutant tells you, that your tests do not make a difference whether the condition is `$x > 0` or `$x >= 0`:

<img width="740" height="160" alt="Infection playground" src="/images/post-images/infection-php-mutation-testing/greater-than-mutant.png" />

This does not necessarily mean that your implementation is wrong, but it tells you that your tests do not cover the condition properly.
This might also be a indicator that your assertions need to be more precise, or that you need to add additional tests to cover the edge cases.

#### dead code detection

From a different perspective, looking at mutation testing results (escaped mutants) can help you to detect dead code.
In case you are confident that your test suite covers all relevant cases,
a escaped mutant tells you that certain code in your implementation doesn't make a difference for the end result.
This means that the code is dead and can be removed.

<img width="740" height="160" alt="Image" src="/images/post-images/infection-php-mutation-testing/unwrap-trim-mutant.png" />

See the [above example in the Infection playground](https://infection-php.dev/r/53ze) in action.


### Summary

Playing 2 months with Infection was a lot of fun.
It made me curious what else I can do to improve the tool and which value it can provide to the PHP community and my projects.

I think it is not that easy to start with running Infection on a existing project,
therefore I am planning to write another article about how to get started with it.


