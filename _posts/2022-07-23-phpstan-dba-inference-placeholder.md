---
tags:
- phpstan-dba
- PHPStan

image: "images/og-images/phpstan-dba-inference-placeholder.jpg"

ogImage:
  title: "@phpstandba-inference-placeholder"
  subtitle: "Type inference for dynamic sql queries"
  imageUrl: "https://staabm.github.io/staabm.svg"
  filename: "phpstan-dba-inference-placeholder"
---

## Type inference for dynamic sql queries

To determine types involved in SQL based apis [`phpstan-dba`](https://staabm.github.io/2022/05/01/phpstan-dba.html) needs to know your sql queries:

```php
use Doctrine\DBAL\Connection;

class Foo
{
    /** @return array{email: string, adaid: int} */
    public function fetchByEmail(Connection $conn, string $email)
    {
        $query = 'SELECT email, adaid FROM ada WHERE email = :email');
        // phpstan-dba can infer the array shape based on the database schema and the sql query
        // => array{email: string, adaid: int}
        return $conn->fetchOne($query, ['email' => $email]); 
    }
}
```

This even works for conditional queries, as long as the query strings can be figured out at analysis time:

```php
use Doctrine\DBAL\Connection;

class Foo2
{
    /** @return array{email: string, adaid: int} */
    public function fetchByEmail(Connection $conn, string $email, bool $onlyActive, int $typeId)
    {
        $query = 'SELECT email, adaid FROM ada WHERE email = :email');
        $params = ['email' => $email];
        
        if ($onlyActive) {
            $query .= ' AND active = 1';
        }
        
        if ($typeId > 0) {
            $query .= ' AND type_id = :typeId';
            $params['typeId'] = $typeId;
        }
        
        // phpstan-dba can infer the array shape based on the database schema and the sql query
        // because all possible combinations of queries strings are known at analysis time.
        // => array{email: string, adaid: int}
        return $conn->fetchOne($query, $params); 
    }
}
```

### The golden phpstan-dba rules

As a rule of thumb: 
- separate user input from your sql query (use prepared statements) 
- make sure the sql query used is built from scalar values, but does not contain regular `string`
- when `string` is involved try to use `literal-string` and `numeric-string`

If you stick to these rules `phpstan-dba` can figure out the query and [provide its type inference](https://staabm.github.io/2022/06/19/phpstan-dba-type-inference.html) and syntax error checking capabilities.
In this cases `phpstan-dba` can detect errors like
- database schema changes which are not compatible with the types defined in the source
- source code changes which are not compatible with the database schema
- syntax errors in the sql queries
- mismatches in the number or names of parameters required vs. passed to the statement
- queries doing unindexed reads

### Handle more dynamic queries: meet `@phpstandba-inference-placeholder`

In rare cases SQL queries can get pretty complex or depend on external configuration, which cannot be built without using a `string` type:

```php
use Doctrine\DBAL\Connection;

class Foo3
{
    /** @return array{email: string, adaid: int} */
    public function fetchByType(Connection $conn, string $typeId, array $filters)
    {
        $query = 'SELECT email, adaid FROM ada WHERE type_id = :typeId');
        $params = ['typeId' => $typeId];
        
        // because of concat a `string` into the SQL query, phpstan-dba can't know the SQL query at analysis time.
        // => the return type cannot be inferred, sql validation cannot happen.
        $query .= $this->builtFilters($filters)
        return $conn->fetchOne($query, $params); 

    }
    
    /**
     * Builts common filter logic meant for re-use 
     */
    private function builtFilters(array $filter):string {
        $conditions = [];
        
        if (array_key_exists('active', $filter)) {
            $conditions[] = 'active = 1';
        }
        
        if (array_key_exists('deleted', $filter)) {
            $conditions[] = 'deleted = 1';
        }
        
        return implode(' AND ', $conditions);
    }
}
```

Since version 0.2.42 you can use `@phpstandba-inference-placeholder` to give `phpstan-dba` a hint about the query involved, so type inference can still be done:

```php
use Doctrine\DBAL\Connection;

class Foo4
{
    /** @return array{email: string, adaid: int} */
    public function fetchByType(Connection $conn, string $typeId, array $filters)
    {
        $query = 'SELECT email, adaid FROM ada WHERE type_id = :typeId');
        $params = ['typeId' => $typeId];
        
        // the SQL query will be inferred as 'SELECT email, adaid FROM ada WHERE type_id = :typeId AND 1=1',
        // because of the used `@phpstandba-inference-placeholder`.
        // => array{email: string, adaid: int}
        $query .= $this->builtFilters($filters)
        return $conn->fetchOne($query, $params); 

    }
    
    /**
     * Builts common filter logic meant for re-use
     * 
     * @phpstandba-inference-placeholder ' AND 1=1'
     */
    private function builtFilters(array $filter):string {
        $conditions = [];
        
        if (array_key_exists('active', $filter)) {
            $conditions[] = 'active = 1';
        }
        
        if (array_key_exists('deleted', $filter)) {
            $conditions[] = 'deleted = 1';
        }
        
        return implode(' AND ', $conditions);
    }
}
```

At analysis time the SQL expression given in `@phpstandba-inference-placeholder` will be picked up and used in the analysis.
Since the resulting SQL query is executable and can be [`EXPLAIN`'ed](https://dev.mysql.com/doc/refman/8.0/en/explain.html), `phpstan-dba` can do its magic.

As things stand right now, using `@phpstandba-inference-placeholder` is limited to same-class private method calls.
