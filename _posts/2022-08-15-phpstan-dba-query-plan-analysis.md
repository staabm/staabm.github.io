---
tags:
- phpstan-dba
- PHPStan

image: "images/og-images/phpstan-dba-query-plan-analysis.jpg"

ogImage:
  title: "detect slow queries before they hit your production database"
  subtitle: "phpstan-dba query plan analysis"
  imageUrl: "https://staabm.github.io/staabm.svg"
  filename: "phpstan-dba-query-plan-analysis"
---

## Detect slow queries before they hit your production database

Static analysis of database access code is a real thing since [`phpstan-dba`](https://staabm.github.io/2022/05/01/phpstan-dba.html).
Just [stick to the rules](https://staabm.github.io/2022/07/23/phpstan-dba-inference-placeholder.html#the-golden-phpstan-dba-rules) and you will be covered:

When enabled, `phpstan-dba` will error when queries are not using indices or queries are inefficient.
The analyzer is reporting problems related to queries not using index, full-table-scans and too many unindexed reads.

```php
use Doctrine\DBAL\Connection;

class Foo
{
    public function unindexRead(Connection $conn, string $email): void
    {
        $conn->executeQuery('SELECT * FROM ada WHERE email = ?', [$email]);
    }
}
```

phpstan-dba will report

> Query is not using an index on table 'ada'.
> 
> Consider optimizing the query.
> In some cases this is not a problem and this error should be ignored.

Within your `phpstan-dba-bootstrap.php` file, you need to optionally enable query plan analysis:

## Configuration

### Signature

`analyzeQueryPlans($numberOfAllowedUnindexedReads = true, $numberOfRowsNotRequiringIndex = QueryPlanAnalyzer::TABLES_WITHOUT_DATA)`

### Examples

Passing `true` will enable the feature:

```php
$config = new RuntimeConfiguration();
$config->analyzeQueryPlans(true);
```

For more fine grained control, you can pass a positive-integer describing the number of unindexed reads a query is allowed to execute before being considered inefficient.
This will only affect queries which already use an index.

```php
$config = new RuntimeConfiguration();
$config->analyzeQueryPlans(100000);
```

To disable the effiency analysis but just check for queries not using indices at all, pass `0`:

```php
$config = new RuntimeConfiguration();
$config->analyzeQueryPlans(0);
```

When running in environments in which only the database schema, but no data is available pass `$numberOfRowsNotRequiringIndex=0`:

```php
$config = new RuntimeConfiguration();
$config->analyzeQueryPlans(true, QueryPlanAnalyzer::TABLES_WITHOUT_DATA);
```

In case you are running a real database with production quality data, you should ignore tables with only few rows, to reduce false positives:

```php
$config = new RuntimeConfiguration();
$config->analyzeQueryPlans(true, QueryPlanAnalyzer::DEFAULT_SMALL_TABLE_THRESHOLD);
```

**Note:** For a meaningful performance analysis it is vital to utilize a database, which containts data and schema as similar as possible to the production database.

**Note:** "Query Plan Analysis" requires an active database connection.

**Note:** ["Query Plan Analysis" is not yet supported on the PGSQL driver](https://github.com/staabm/phpstan-dba/issues/378)

### Read more

Please [find more articles relatd to phpstan-dba](https://staabm.github.io/archive.html#phpstan-dba) and its featureset.