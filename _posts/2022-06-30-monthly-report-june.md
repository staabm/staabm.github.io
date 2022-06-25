---
tags:
- monthly report
---

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

We published releases [improving compatibility with latest upstream PHPStan](https://phpstan.org/blog/preprocessing-ast-for-custom-rules) changes and paved the way for use of phpstan-dba with [PHPStan @bleedingEdge](https://phpstan.org/blog/what-is-bleeding-edge).

Find out more [about recent releases](https://github.com/staabm/phpstan-dba/releases).


### PHPStan - my contributions

> PHPStan finds bugs in your code without writing tests

#### General Improvements

- [allow numeric-strings beeing returned for non-empty-string](https://github.com/phpstan/phpstan-src/pull/1428)
- [Support non-empty-array in InArrayFunctionTypeSpecifyingExtension](https://github.com/phpstan/phpstan-src/pull/1108)

#### Signature Improvements

Parameter and Returntype improvements help PHPStan to understand your code. The better the inference the less additional manual code is required by you to make PHPStan understand whats going on.

See [my blog post about the sprintf/sscanf overall picture](https://staabm.github.io/2022/06/23/phpstan-sprintf-sscanf-inference.html).

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">to all sprintf/sscanf lovers.. the next <a href="https://twitter.com/phpstan?ref_src=twsrc%5Etfw">@phpstan</a> release will include type inferrence for most common cases.<br><br>enjoy. <a href="https://t.co/ZytadYf9Yj">pic.twitter.com/ZytadYf9Yj</a></p>&mdash; markus staab (@markusstaab) <a href="https://twitter.com/markusstaab/status/1538045189578805249?ref_src=twsrc%5Etfw">June 18, 2022</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 

### Composer - my contributions

> A Dependency Manager for PHP

Together [with Jordi I worked on a PHPStan extension](https://github.com/composer/composer/pull/10635) for [Composer](https://getcomposer.org/) which detects problems while working with the config object.


### Symplify - my contributions

Improvements regarding use of static reflection, to prevent class not found errors when custom autoloaders are used.

- [PreventParentMethodVisibilityOverrideRule: use static reflection](https://github.com/symplify/symplify/pull/4167)


### Github Maintainer Month

I was selected to be one of those 900 people across the globe to get a [one time sponsorship from GitHub](https://staabm.github.io/2022/06/24/github-maintainer-month.html).


## 💌 Support my open source activities

Honor the work I am doing in my freetime by [sponsoring me](https://github.com/sponsors/staabm). 
