---
tags:
- phpstan-dba
- PHPStan

image: "images/og-images/phpstan-dba-static-analysis.jpg"

ogImage:
  title: "phpstan-dba static analysis"
  subtitle: "PHPStan based SQL static analysis and type inference for the database access layer"
  imageUrl: "https://staabm.github.io/staabm.svg"
---

## phpstan-dba static analysis

[PHPStan](https://phpstan.org/blog/find-bugs-in-your-code-without-writing-tests) based SQL static analysis and type inference for the database access layer.

---

[`phpstan-dba`](https://github.com/staabm/phpstan-dba) makes your phpstan static code analysis jobs aware of datatypes within your database.
With this information at hand we are able to detect type inconsistencies between your domain model and database-schema.
Additionally errors in code handling the results of sql queries can be detected.

This extension provides the following features, as long as you [stick to the rules](https://staabm.github.io/2022/07/23/phpstan-dba-inference-placeholder.html#the-golden-phpstan-dba-rules):

* [result set type-inferrence](https://staabm.github.io/2022/06/19/phpstan-dba-type-inference.html)
* [detect errors in sql queries](https://staabm.github.io/2022/08/05/phpstan-dba-syntax-error-detection.html)
* [detect placeholder/bound value mismatches](https://staabm.github.io/2022/07/30/phpstan-dba-placeholder-validation.html)
* [query plan analysis](https://staabm.github.io/2022/08/16/phpstan-dba-query-plan-analysis.html) to detect performance issues
* builtin support for `doctrine/dbal`, `mysqli`, and `PDO`
* API to configure the same features for your custom sql based database access layer


**Note:**
At the moment only MySQL/MariaDB and PGSQL databases are supported. Technically it's not a big problem to support other databases though.


### DEMO

see the ['Files Changed' tab of the DEMO-PR](https://github.com/staabm/phpstan-dba/pull/61/files#diff-98a3c43049f6a0c859c0303037d9773534396533d7890bad187d465d390d634e) for a quick glance.

### Installation

see the [phpstan-dba GitHub Repository](https://github.com/staabm/phpstan-dba#installation) for usage instructions and setup.

### 💌 Support phpstan-dba

[Consider supporting the project](https://github.com/sponsors/staabm), so we can make this tool even better even faster for everyone.
