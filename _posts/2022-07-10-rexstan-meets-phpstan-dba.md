## `rexstan` meets `phpstan-dba`

I have already written a few posts regarding [`phpstan-dba`](https://staabm.github.io/2022/05/01/phpstan-dba.html) and [`rexstan`](https://staabm.github.io/2022/06/18/rexstan-REDAXO-AddOn.html).
On a hot sunday in june, I don't had a chance leaving the house, so I decided to work on these 2 projects.

### integrating `phpstan-dba` and `rexstan`

As `rexstan` is meant to be a one click solution to get PHPStan based code analysis into the REDAXO CMS for users not able to do the tool setup,
a good next step was enhance the analysis with data from the database.

Since REDAXO CMS provides its own database access layer, I had to [re-use existing `phpstan-dba` rules](https://github.com/FriendsOfREDAXO/rexstan/pull/32/files#diff-3213361648fe9752aea629ab101f50e050717203626386da0172a19247204c90) for this context.

With this logic applied, `rexstan` is able to detect syntax errors in queries given to the `rex_sql` class:
<img width="733" alt="Bildschirmfoto 2022-06-19 um 11 17 46" src="https://user-images.githubusercontent.com/120441/174474750-45edaaaf-98b3-4ec1-bce8-8244ab78f329.png">


### Advanced Usage / Re-Using phpstan-dba PHPStan for custom query APIs

The required PHPStan configuration is described in a [dedicated doc chapter](https://github.com/staabm/phpstan-dba/blob/main/docs/rules.md).


### next steps

When time allows I have [planned to work on getting type-inference](https://github.com/FriendsOfREDAXO/rexstan/issues/33) done for the [`rex_sql->getValue()`](https://github.com/redaxo/redaxo/blob/34fefa576148573dc28000458abf40ba1bfdf402/redaxo/src/core/lib/sql/sql.php#L742-L776) API by re-using part of `phpstan-dba`.
Thats stuff for a different blog post though - stay tuned


