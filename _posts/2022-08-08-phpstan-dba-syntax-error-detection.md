---
tags:
- phpstan-dba
- PHPStan

image: "images/og-images/phpstan-dba-syntax-error-detection.jpg"

ogImage:
  title: "detect sql errors using static analysis"
  subtitle: "code <-> db schema consistency checks with phpstan-dba"
  imageUrl: "https://staabm.github.io/staabm.svg"
  filename: "phpstan-dba-syntax-error-detection"
---

## Check your sql queries for errors

Static analysis of database access code is a real thing since [`phpstan-dba`](https://staabm.github.io/2022/05/01/phpstan-dba.html).
Just [stick to the rules](https://staabm.github.io/2022/07/23/phpstan-dba-inference-placeholder.html#the-golden-phpstan-dba-rules) and you will be covered:

```php
use PDO;

class Foo
{
    public function unknownTable(PDO $conn)
    {
        $pdo->query('SELECT * FROM unknownTable', PDO::FETCH_ASSOC);
    }
}
```

phpstan-dba will report

> Query error: Table 'phpstan_dba.unknownTable' doesn't exist (1146).

There are a lot more scenarios in which you get a proper error:

```php
use Doctrine\DBAL\Connection;

class Foo
{
    public function syntaxErrors(Connection $conn)
    {
        $query = 'SELECT email adaid WHERE gesperrt freigabe1u1 FROM ada';
        $row = $conn->fetchOne($query, []); 
    }
    
    public function unknownColumn(\mysqli $conn)
    {
        $query = 'SELECT doesNotExist, adaid, gesperrt, freigabe1u1 FROM ada';
        return mysqli_query($conn, $query); 
    }
}
```

phpstan-dba will report a few problems with this code:

> Query error: You have an error in your SQL syntax; check the manual that corresponds to your MySQL/MariaDB server version for the right syntax to use near 'freigabe1u1 FROM ada LIMIT 0' at line 1 (1064).
> Query error: Unknown column 'doesNotExist' in 'field list' (1054).

Getting this kind of errors at static analysis time is a real time saver and helps you to spot errors in SQL queries early,
without time consuming trial and error loops.

Since you are covered by the tooling, you can work with confidence on your database access code and sql queries.
Additionally you can make sure that changes in your database schema will not break existing queries throughout the codebase.

### Read more

Please [find more articles relatd to phpstan-dba](https://staabm.github.io/archive.html#phpstan-dba) and its featureset.