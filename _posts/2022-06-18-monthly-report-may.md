## Monthly report: May 2022

Dump of my development activities

---

### [phpstandba](https://github.com/staabm/phpstan-dba/) - created by me

> PHPStan based SQL static analysis and type inference for the database access layer.
> Supports @doctrineproject DBAL, PDO, mysqli with MySQL/MariaDB and @PostgreSQL.

#### Tweets

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">check your sql queries like a boss. resultset type inference included.<br><br>next level static analysis - using the <a href="https://twitter.com/hashtag/phpstandba?src=hash&amp;ref_src=twsrc%5Etfw">#phpstandba</a> extension for <a href="https://twitter.com/phpstan?ref_src=twsrc%5Etfw">@phpstan</a><br><br>Supports <a href="https://twitter.com/doctrineproject?ref_src=twsrc%5Etfw">@doctrineproject</a> DBAL, PDO, mysqli with MySQL/MariaDB and <a href="https://twitter.com/PostgreSQL?ref_src=twsrc%5Etfw">@PostgreSQL</a>.<a href="https://t.co/eyK8jHxaY6">https://t.co/eyK8jHxaY6</a><br><br>plz RT <a href="https://t.co/5yt858JmPw">pic.twitter.com/5yt858JmPw</a></p>&mdash; markus staab (@markusstaab) <a href="https://twitter.com/markusstaab/status/1527376363204001793?ref_src=twsrc%5Etfw">May 19, 2022</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 

**READ MORE**

- [query plan analysis to spot performance problems.](https://twitter.com/markusstaab/status/1529481591222845440)
- [PGSQL support in phpstandba](https://twitter.com/markusstaab/status/1526950527677997056)



### PHPStan - my contributions

> PHPStan finds bugs in your code without writing tests

#### General Improvements

- [Improvements to named arguments handling](https://github.com/phpstan/phpstan-src/pull/1313)

#### Signuature Improvements

Parameter and Returntype improvements help PHPStan to understand your code. The better the inference the less additional manual code is required by you to make PHPStan understand whats going on.

- [implement str-case functions return type extension](https://github.com/phpstan/phpstan-src/pull/1325)
- [
infer non-empty-string on substr() comparison with constant string](https://github.com/phpstan/phpstan-src/pull/1259)
- [infer non-empty-string on str-casing functions comparison with constant string](https://github.com/phpstan/phpstan-src/pull/1382)
- [infer non-empty-string on strstr() comparison with constant string](https://github.com/phpstan/phpstan-src/pull/1365)

- [improve is_subclass_of type checks](https://github.com/phpstan/phpstan-src/pull/1321)
- [use conditional parameter for is_a() via stub](https://github.com/phpstan/phpstan-src/pull/1311)
- [use conditional return type for is_a() via stub](https://github.com/phpstan/phpstan-src/pull/1310)

#### kill `instanceof StringType`

In the PHPStan codebase we should refactor all uses of `instanceof StringType` to `$type->isXXX` checks, which paves the way for different String-Types like `non-empty-string`, `numeric-string` or `non-falsey-string` (to be implemented).

- [Support string accessory types in BitwiseNot](https://github.com/phpstan/phpstan-src/pull/1266)

## 💌 Support my open source activities

Honor the work I am doing in my freetime by [sponsoring me](https://github.com/sponsors/staabm). 
