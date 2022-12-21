---
tags:
- phpstan-dba
- PHPStan

image: "images/og-images/phpstan-dba-placeholder-validation.jpg"

ogImage:
  title: "validate sql query placeholders with phpstan-dba"
  subtitle: "Refactor sql queries without fear"
  imageUrl: "https://staabm.github.io/staabm.svg"
  fileName: "phpstan-dba-placeholder-validation"
---

## Placeholder validation in sql queries

Static analysis of database access code is a real thing since [`phpstan-dba`](https://staabm.github.io/2022/05/01/phpstan-dba.html).
Just [stick to the rules](https://staabm.github.io/2022/07/23/phpstan-dba-inference-placeholder.html#the-golden-phpstan-dba-rules) and you will be covered:

```php
use PDO;

class Foo
{
    public function fetchByAdaid(PDO $conn, int $adaid)
    {
        $stmt = $pdo->prepare('SELECT email, adaid FROM ada WHERE adaid = ? and email = ?');
        $stmt->execute([$adaid]);
    }
}
```

phpstan-dba will report

> Query expects 2 placeholders, but 1 value is given.

The same is true for queries using named parameters:

```php
use Doctrine\DBAL\Connection;

class Foo
{
    /** @return array{email: string, adaid: int} */
    public function fetchByEmail(Connection $conn, string $email)
    {
        $query = 'SELECT email, adaid FROM ada WHERE email = :email');
        return $conn->fetchOne($query, ['wrongParamName' => $email]); 
    }
}
```

phpstan-dba will report a few problems with this code:

> Query expects placeholder :email, but it is missing from values given.
> Value :wrongParamName is given, but the query does not contain this placeholder.

Getting this kind of errors at static analysis time is a real time saver and helps you to spot errors in SQL queries early,
without time consuming trial and error loops.

### Read more

Please [find more articles relatd to phpstan-dba](https://staabm.github.io/archive.html#phpstan-dba) and its featureset.