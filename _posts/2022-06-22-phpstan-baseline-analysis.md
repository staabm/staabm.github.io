## Analyze your PHPStan baseline

> Analyzes PHPStan baseline files and creates aggregated error trend-reports.

---

At my daily job I am mostly working on software which is more then 10 years old.
We try to keep the codebases as clean as possible since we know they will exist for a long time.

To get an idea about technical debt and complexity within the different projects we analyze our [PHPStan baseline files](https://phpstan.org/user-guide/baseline).
[We have built a small tool](https://github.com/staabm/phpstan-baseline-analysis) which allows us to track different metrics over time.

### example report

```
$ phpstan-baseline-analyze *phpstan-baseline.neon
Analyzing app/portal/phpstan-baseline.neon
  Classes-Cognitive-Complexity: 270
  Deprecations: 2
  Invalid-Phpdocs: 5
  Unknown-Types: 1
  Anonymous-Variables: 4
```

### example trend analysis

the following example shows the evolution of errors in your phpstan baselines.
see the trend between 2 different points in time like:

```
$ git clone ...

$ phpstan-baseline-analyze *phpstan-baseline.neon --json > now.json

$ git checkout `git rev-list -n 1 --before="1 week ago" HEAD`

$ phpstan-baseline-analyze *phpstan-baseline.neon --json > reference.json

$ phpstan-baseline-trend reference.json now.json
Analyzing Trend for app/portal/phpstan-baseline.neon
  Classes-Cognitive-Complexity: 309 -> 177 => improved
  Deprecations: 1 -> 2 => worse
  Invalid-Phpdocs: 3 -> 1 => good
  Unknown-Types: 5 -> 15 => worse
  Anonymous-Variables: 4 -> 3 => good
```


see the [Project Repository](https://github.com/staabm/phpstan-baseline-analysis)
