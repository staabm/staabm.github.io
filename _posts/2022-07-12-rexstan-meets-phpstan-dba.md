---
tags:
- rexstan
- REDAXO
- phpstan-dba
- PHPStan

image: "images/og-images/new-project-rexstan.jpg"

ogImage:
  title: "rexstan meets phpstan-dba"
  subtitle: "Adding static analysis to the REDAXO CMS database access layer"
  imageUrl: "https://staabm.github.io/staabm.svg"
---

## `rexstan` meets `phpstan-dba`

I have already written a few posts regarding [`phpstan-dba`](https://staabm.github.io/2022/05/01/phpstan-dba.html) and [`rexstan`](https://staabm.github.io/2022/06/18/rexstan-REDAXO-AddOn.html).
On a hot sunday in june 😅, I don't had a chance leaving the house, so I decided to work on these 2 projects.

### integrating `phpstan-dba` and `rexstan`

As `rexstan` is meant to be a one click solution to get PHPStan based code analysis into the REDAXO CMS for users not able to do the tool setup,
a good next step was enhance the analysis with data from the database.

Since REDAXO CMS provides its own database access layer, I had to [re-use existing `phpstan-dba` rules](https://github.com/FriendsOfREDAXO/rexstan/pull/32/files#diff-3213361648fe9752aea629ab101f50e050717203626386da0172a19247204c90) for this context.

The `rex_sql` api was designed back in 2010 without static analysis in mind. I am pretty sure, we would built the class very differently today, but people are used to it now, and it is still pretty similar what we had even before in REDAXO 4.x times. One challange this brings with it, is that `rex_sql` uses the same api for working with prepared statements and regular non-prepared queries. Thats the reason why the [phpstan-dba config file needs to be a bit more complicated](https://github.com/FriendsOfREDAXO/rexstan/blob/2f86fbaca8b7316f3465d986859b332c12bb79fb/lib/phpstan-dba.neon#L4-L24), then usually.

With this logic applied, `rexstan` is able to detect syntax errors in queries e.g. given to the `rex_sql->setQuery()` class:
<img width="733" alt="Bildschirmfoto 2022-06-19 um 11 17 46" src="https://user-images.githubusercontent.com/120441/174474750-45edaaaf-98b3-4ec1-bce8-8244ab78f329.png">

The required configuration is described in more detail in a [dedicated phpstan-dba doc chapter](https://github.com/staabm/phpstan-dba/blob/main/docs/rules.md).

### `rex::getTable()` and `rex::getTablePrefix()`

In REDAXO it is common to use small utility methods to build the sql query. These methods return concatenation of a pre-configured string and the given arguments. 

In 99% of the cases the default table prefix, which is `rex_` is used. So adding a [DynamicStaticMethodReturnTypeExtension for these was they way forward](https://github.com/FriendsOfREDAXO/rexstan/blob/2f86fbaca8b7316f3465d986859b332c12bb79fb/lib/RexClassDynamicReturnTypeExtension.php).

Making these methods return a `ConstantStringType` allows the query analysis to detect the actual query string beeing executed. Based on this additional PHPStan-Extension information, even query strings containing calls to `rex::getTable()` or `rex::getTablePrefix()` turn analyzable:

```php
$db = rex_sql::factory();
$db->setQuery('select * from ' . rex::getTablePrefix() . 'article_slice where article_id=? and clang_id=? and revision=? ORDER by ctype_id, priority', [$articleId, $clang, $fromRevisionId]);
```

Without the extension, phpstan-dba would have skipped these queries as the `rex::getTablePrefix()` call would have injected a non-constant value, not known at analysis time.

The same is true for the legacy `rex_sql::escape()` and `rex_sql::escapeLikeWildcards` method calls. These are covered by a [different but similiar PHPStan-extension](https://github.com/FriendsOfREDAXO/rexstan/blob/2f86fbaca8b7316f3465d986859b332c12bb79fb/lib/RexSqlDynamicReturnTypeExtension.php). 
Dear REDAXO-User: Obviously prepared statements should be preferred over the legacy escaping api.


### next steps

When time allows I have [planned to work on getting type-inference](https://github.com/FriendsOfREDAXO/rexstan/issues/33) done for the [`rex_sql->getValue()`](https://github.com/redaxo/redaxo/blob/34fefa576148573dc28000458abf40ba1bfdf402/redaxo/src/core/lib/sql/sql.php#L742-L776) API by re-using part of `phpstan-dba`.
Thats stuff for a different blog post though - stay tuned
