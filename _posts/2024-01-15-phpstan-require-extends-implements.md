---
tags:
    - PHPStan
    - sponsoring

image: "images/og-images/phpstan-require-extends-implements.jpg"

ogImage:
    title: "Sponsored PHPStan feature: require-extends & require-implements phpDoc"
    subtitle: "Define requirements interfaces or traits impose on usage classes"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "phpstan-require-extends-implements"
---

### Sponsored PHPStan feature: require-extends & require-implements phpDoc

I spent a few days implementing `@phpstan-require-extends` and `@phpstan-require-implements` semantics in PHPStan.
The feature is available in PHPStan 1.10.56+ and newer.

People using psalm might find this feature familiar as it is [already supported in psalm](https://psalm.dev/docs/annotating_code/supported_annotations/#psalm-require-extends).

The idea is to define at interface or trait level, which requirements the usage class has to fulfill.

The development of this feature was possible, thanks to sponsoring by a interessted party.

If you are in need of a certain feature or bugfix in PHPStan, Rector or related tooling, feel free to [get in touch](https://staabm.github.io/2024/01/01/phpstan-customizing.html#get-in-touch).

#### `@phpstan-require-extends` trait-example

It's best described iwth an example, so have a look at the psalm documentation example:

```php
/**
 * @phpstan-require-extends DatabaseModel
 */
trait SoftDeletingTrait {
  // useful but scoped functionality, that depends on methods/properties from DatabaseModel
}
```

With this declaration we define that a class wich uses the `SoftDeletingTrait` has to extend the `DatabaseModel` class.
If not, PHPStan will report an error. See the full [example running in the PHPStan sandbox](https://phpstan.org/r/490b9ffe-a2f0-404f-a34d-05042e790da4)

#### `@phpstan-require-extends` interface-example

Similar to what was shown above, the same is possible with interfaces:

```php
/**
 * @phpstan-require-extends DatabaseModel
 */
interface SoftDeletingMarkerInterface {
}
```

With this declaration we define that a class which implements the `SoftDeletingMarkerInterface` has to extend the `DatabaseModel` class.

When using interfaces we can achieve more though, because the interface type can be used as a parameter:

```php
/**
 * @phpstan-require-extends DatabaseModel
 */
interface SoftDeletingMarkerInterface {
}

class DatabaseModel {
    public string $tableName;

    public function softDelete():void { /* … */ }
}

// its allowed to call lookup properties and call method of the require-extends type, when using the interface-type
function runSoftDelete(SoftDeletingMarkerInterface $model):void {
    $tableName = $model->tableName;
    $model->softDelete();
    // …
}
```

Since its only valid to implement the `SoftDeletingMarkerInterface` when extending the `DatabaseModel` class,
PHPStan will not error when accessing public properties or calling public methods based on the `SoftDeletingMarkerInterface` type.

See the full [example running in the PHPStan sandbox](https://phpstan.org/r/4998eff7-7117-43b3-b022-0ee185bc4529)

NOTE: Looking up properties/calling methods on the interface type is currently only possible in PHPStan. I have opened a dedicated [psalm feature request #10538 for discussion](https://github.com/vimeo/psalm/issues/10538).

#### `@phpstan-require-implements` trait-example

similar to the `@phpstan-require-extends` trait example, its supported to use `@phpstan-require-implements` on traits:

```php
/**
 * @phpstan-require-implements DatabaseModel
 */
trait SoftDeletingTrait {
  // useful but scoped functionality, that depends on methods/properties from DatabaseModel
}
```


See the full [example running in the PHPStan sandbox](https://phpstan.org/r/124389c9-d215-422a-b09c-2299cc8b33f0)
