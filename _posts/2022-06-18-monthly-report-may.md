## Monthly report: May 2022

Dump of my development activities

---

### PHPStan

#### General Improvements

- [Improvements to named arguments handling](https://github.com/phpstan/phpstan-src/pull/1313)

#### Signuature Improvements

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
