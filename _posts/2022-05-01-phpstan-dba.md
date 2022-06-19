---
tags:
- phpstan-dba
- PHPStan
---

## phpstan-dba static analysis

PHPStan based SQL static analysis and type inference for the database access layer.

---

[`phpstan-dba`](https://github.com/staabm/phpstan-dba) makes your phpstan static code analysis jobs aware of datatypes within your database.
With this information at hand we are able to detect type inconsistencies between your domain model and database-schema.
Additionally errors in code handling the results of sql queries can be detected.

This extension provides the following features:

* result set type-inferrence
* inspect sql queries, detect errors and placeholder/bound value mismatches
* query plan analysis to detect performance issues
* builtin support for `doctrine/dbal`, `mysqli`, and `PDO`
* API to configure the same features for your custom sql based database access layer


**Note:**
At the moment only MySQL/MariaDB and PGSQL databases are supported. Technically it's not a big problem to support other databases though.


### DEMO

see the ['Files Changed' tab of the DEMO-PR](https://github.com/staabm/phpstan-dba/pull/61/files#diff-98a3c43049f6a0c859c0303037d9773534396533d7890bad187d465d390d634e) for a quick glance.

### Installation

see the [phpstan-dba GitHub Repository](https://github.com/staabm/phpstan-dba) for usage instructions and setup.

### 💌 Support phpstan-dba

[Consider supporting the project](https://github.com/sponsors/staabm), so we can make this tool even better even faster for everyone.
