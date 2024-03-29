---
tags:
- PHPStan

image: "images/og-images/analyze-your-PHPStan-baseline.jpg"

ogImage:
  title: "Analyze your PHPStan baseline"
  subtitle: "get an idea about technical debt and complexity within your projects"
  imageUrl: "https://staabm.github.io/staabm.svg"
  fileName: "analyze-your-PHPStan-baseline"
---


## Analyze your PHPStan baseline

> Analyzes PHPStan baseline files and creates aggregated error trend-reports.

---

At my daily job I am mostly working on software which is more then 15 years old.
We try to keep the codebases as clean as possible since we know they will exist for a long time.

To get an idea about technical debt and complexity within the different projects we analyze our [PHPStan baseline files](https://phpstan.org/user-guide/baseline).
In a legacy project the PHPStan baseline is a good source to find out about all problems your code might have.
It contains all errors you did not yet have time to dig into.

[We have built a small tool](https://github.com/staabm/phpstan-baseline-analysis) which allows us to track different metrics over time.

### example report

```
$ phpstan-baseline-analyze *phpstan-baseline.neon
Analyzing app/portal/phpstan-baseline.neon
  Overall-Errors: 41
  Classes-Cognitive-Complexity: 70
  Deprecations: 2
  Invalid-Phpdocs: 5
  Unknown-Types: 1
  Anonymous-Variables: 4
  Native-Property-Type-Coverage: 1
  Native-Param-Type-Coverage: 27
  Native-Return-Type-Coverage: 4
  Unused-Symbols: 3
```

As you can see, it aggregates different kind of errors and sum their occurrences.
[The PHPStan rules currently supported](https://github.com/staabm/phpstan-baseline-analysis#supported-phpstan-rulesets) are listed in the projects README.

Visualizing the number of deprecation errors to get an idea whether things might start breaking in the future.

We also deep analyse some error messages, which tell us more about the complexity of our product and therefore refactoring opportunities.

Tracking unknown types and anonymous variables helps us to get an idea whether PHPStan has a good understanding of the codebase (PHPStan code coverage).

### example trend analysis

the following example shows the evolution of errors in phpstan baselines.
see the trend between 2 different points in time like:

```
$ git clone ...

$ phpstan-baseline-analyze *phpstan-baseline.neon --json > now.json

$ git checkout `git rev-list -n 1 --before="1 week ago" HEAD`

$ phpstan-baseline-analyze *phpstan-baseline.neon --json > reference.json

$ phpstan-baseline-trend reference.json now.json
Analyzing Trend for app/portal/phpstan-baseline.neon
  Overall-Errors: 30 -> 17 => improved
  Classes-Cognitive-Complexity: 309 -> 177 => improved
  Deprecations: 1 -> 2 => worse
  Invalid-Phpdocs: 3 -> 1 => good
  Unknown-Types: 5 -> 15 => worse
  Anonymous-Variables: 4 -> 3 => good
  Unused-Symbols: 1 -> 1 => good
  Native-Return-Type-Coverage: 20 -> 2 => worse
  Native-Property-Type-Coverage: 3 -> 3 => good
  Native-Param-Type-Coverage: 4 -> 40 => improved
```

Tracking the teams progress over time is great way to make the work you put into the software visible, either to gamify the process for developers involved, but also to make this metrics transparent for the management.
Often times its not easy to get the points of software quality across to business people.

Read more on the [Project Repository](https://github.com/staabm/phpstan-baseline-analysis)
