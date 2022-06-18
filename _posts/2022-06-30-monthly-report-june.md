## Monthly report: June 2022

Dump of my development activities

---

### [rexstan](https://staabm.github.io/2022/06/18/rexstan-REDAXO-AddOn.html) - created by me

> A REDAXO CMS AddOn which adds PHPStan based code analysis to the open source CMS improving developer productivity and code quality.

While rexstan saw early adopters, we improved the experience for first time users.

- Support for [analysing code in modules/templates](https://github.com/FriendsOfREDAXO/rexstan/releases/tag/1.0.12)
- Support for [PHPStan bleeding edge and phpstan-phpunit](https://github.com/FriendsOfREDAXO/rexstan/releases/tag/1.0.10).
- PHPStan updates


### [phpstan-dba](https://github.com/staabm/phpstan-dba/) - created by me

> PHPStan based SQL static analysis and type inference for the database access layer.
> Supports @doctrineproject DBAL, PDO, mysqli with MySQL/MariaDB and @PostgreSQL.

I have worked a lot on `phpstan-dba` during june, to fix minor and a few bigger glitches.

We published releases [improved compatibility with latest upstream PHPStan](https://phpstan.org/blog/preprocessing-ast-for-custom-rules) changes and paved the way for use of phpstan-dba with [PHPStan@bleedingEdge](https://phpstan.org/blog/what-is-bleeding-edge).

Find out more [about recent releases](https://github.com/staabm/phpstan-dba/releases).


### PHPStan - my contributions

> PHPStan finds bugs in your code without writing tests

#### General Improvements

- [allow numeric-strings beeing returned for non-empty-string](https://github.com/phpstan/phpstan-src/pull/1428)
- [Support non-empty-array in InArrayFunctionTypeSpecifyingExtension](https://github.com/phpstan/phpstan-src/pull/1108)

#### Signature Improvements

Parameter and Returntype improvements help PHPStan to understand your code. The better the inference the less additional manual code is required by you to make PHPStan understand whats going on.

- [added SscanfFunctionDynamicReturnTypeExtension return type extension](https://github.com/phpstan/phpstan-src/pull/1434)
- [more precise sprintf() return type on constant formats](https://github.com/phpstan/phpstan-src/pull/1410)
- [support positional arguments in sprintf() constant format inference](https://github.com/phpstan/phpstan-src/pull/1426)
- [cover vsprintf()](https://github.com/phpstan/phpstan-src/pull/1441)


### Symplify - my contributions

Improvements regarding use of static reflection, to prevent class not found errors when custom autoloaders are used.

- [PreventParentMethodVisibilityOverrideRule: use static reflection](https://github.com/symplify/symplify/pull/4167)

## 💌 Support my open source activities

Honor the work I am doing in my freetime by [sponsoring me](https://github.com/sponsors/staabm). 
