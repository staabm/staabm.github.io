---
tags:
- phpstan-dba
- PHPStan
---


### phpstan-dba type inference

PHPStan based SQL static analysis and type inference for the database access layer.

---

In the last few months I have been working on a PHPStan extension called [phpstan-dba](https://staabm.github.io/2022/05/01/phpstan-dba.html).
Its most valuable feature - from a extension user point of view - is the type inference you get for your SQL queries.

Lets start with a motivation example and after that we dive into more details.


### Type inference Example

When [`phpstan-dba` is properly configured](https://github.com/staabm/phpstan-dba#installation) PHPStan is able to understand database access oriented code:

```php
/**
 * @return array{email: string, userid: string}  
 */
function fetchUser(\PDO $pdo, string $userToken):array {
    $query = 'SELECT email, userid FROM users WHERE token = ?';
    $preparedStatement = $pdo->prepare($query);
    $preparedStatement->execute([$userToken]);
    return $preparedStatement->fetch(\PDO::FETCH_ASSOC);
}
```

Without `phpstan-dba`, [PHPStan will error](https://phpstan.org/r/d61b9704-bea2-4881-b5d5-aab7c065765e):
> Method HelloWorld::fetchUser() should return array{email: string, userid: string} but returns mixed.

With the extension enabled, PHPStan is able to figure out the SQL query beeing executed and the used fetch-mode.
The information at hand is enough to built a proper return type for `$preparedStatement->fetch(\PDO::FETCH_ASSOC)` and therefore the above mentioned error no longer appears.

Turned differently: In case this code will be changed in the future, because of `phpstan-dba` PHPStan is able to report errors, it could not catch otherwise:

```php
// example including an error

/**
 * @return array{email: string, userid: string}  
 */
function fetchUser(\PDO $pdo, string $userToken):array {
    // error: the sql query selects a 'surname' and a 'userid' column, but no 'email'.
    // the fetchUser() return type expects 'email' beeing returned though 
    $query = 'SELECT surname, userid FROM users WHERE token = ?';
    $preparedStatement = $pdo->prepare($query);
    $preparedStatement->execute([$userToken]);
    return $preparedStatement->fetch(\PDO::FETCH_ASSOC);
}
```


### database schema datatypes

Another source of errors in database access source code is a mismatch between database column types and the types used within the PHP code:

```php
// example including an error

/**
 * @return array{email: string, userid: int}  
 */
function fetchUser(\PDO $pdo, string $userToken):array {
    // error: the 'userid' column is defined as a varchar in the database,
    // but the fetchUser() return type expects 'userid' as an int. 
    $query = 'SELECT surname, userid FROM users WHERE token = ?';
    $preparedStatement = $pdo->prepare($query);
    $preparedStatement->execute([$userToken]);
    return $preparedStatement->fetch(\PDO::FETCH_ASSOC);
}
```

This kind of error easily happen when new SQL queries are implemented or the database schema is changed,
while not every spot in the codebase was adjusted for the changed column type.


### complex sql queries

The previous examples seem pretty obvious, but `phpstan-dba` is also able to figure out more complex scenarios:

```php
/**
 * @return array{email: string, userid: int}  
 */
function fetchUser(\PDO $pdo, string $userToken, int $mode = 0, bool $lockedOnly = false):array {
    $query = 'SELECT surname, userid FROM users WHERE token = ?';
    
    $params['token'] = $userToken;
    
    if ($mode > 0) {
        $sql .= ' AND mode = :mode';
        $params['mode'] = $mode;
    }
    
    if ($lockedOnly) {
        $sql .= ' AND locked = :locked';
        $params['locked'] = 1;
    }
        
    $preparedStatement = $pdo->prepare($query);
    $preparedStatement->execute($params);
    return $preparedStatement->fetch(\PDO::FETCH_ASSOC);
}
```


### supported datatabase access apis

At the time of writing `phpstan-dba` has builtin support for [doctrine/dbal](https://github.com/doctrine/dbal), [mysqli](https://www.php.net/mysqli), and [PDO](https://www.php.net/pdo).

As backend it currently supports MySQL, MariaDB and [PGSQL](https://twitter.com/markusstaab/status/1526950527677997056).


### read more

`phpstan-dba` has a lot more to offer then type inference.

As the sql queries get analyzed, phpstan-dba is able to warn about possible syntax errors. Prepared [statement parameters are validated](https://staabm.github.io/2022/07/30/phpstan-dba-placeholder-validation.html). 
With recent releases it also learned to [analyze database queries execution plans](https://twitter.com/markusstaab/status/1529481591222845440), to e.g. warn about queries not using an index.

see the [DEMO to get a sneak peak](https://github.com/staabm/phpstan-dba/pull/61/files#diff-98a3c43049f6a0c859c0303037d9773534396533d7890bad187d465d390d634e) of what is possible.

We will explore this features in separate Blog posts in the future - stay tuned. 
