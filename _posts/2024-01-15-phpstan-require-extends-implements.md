---
tags:
    - PHPStan
    - sponsoring

image: "images/og-images/phpstan-require-extends-implements.jpg"

ogImage:
    title: "New in PHPStan: require-extends and require-implements phpDoc"
    subtitle: "Define requirements interfaces or traits impose on usage classes"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "phpstan-require-extends-implements"
---

### Sponsored PHPStan feature: require-extends and require-implements phpDoc

I spent a few days implementing `@phpstan-require-extends` and `@phpstan-require-implements` semantics in PHPStan.
People using psalm might find this feature familiar as it is [already supported in psalm](https://psalm.dev/docs/annotating_code/supported_annotations/#psalm-require-extends).

The idea is to define at interface or trait level, which requirements the usage class has to fulfill.

The development of this feature was possible, thanks to sponsoring by a interessted party.
In addition Ondřej Mirtes provided excellent feedback and guidance during the development.

The feature was implemented in separate Pull Requests:

- [Support for `require-extends` and `require-implements` in phpdoc-parser](github.com/phpstan/phpdoc-parser/pull/226)
- [Plumbing for `@phpstan-require-extends` and `@phpstan-require-implements`](https://github.com/phpstan/phpstan-src/commit/53a61dc8674fe5c61fcc08efe08221e919661132)
- [Implement ClassReflectionExtension](https://github.com/phpstan/phpstan-src/pull/2856)
- [Implement `require-extends` and `require-implements` rules](https://github.com/phpstan/phpstan-src/pull/2859)
- [`require-extends` should not error on interfaces](https://github.com/phpstan/phpstan-src/pull/2861)
- [Support `require-extends` and `require-implements` in result cache](https://github.com/phpstan/phpstan-src/pull/2866)

… which fixed the following issues:

- [PHP^8.2: Access to an undefined property when type hinting interface with `@property`](https://github.com/phpstan/phpstan/issues/10302)
- [`@phpstan-require-use` for requiring implementors/subclasses to use certain traits](https://github.com/phpstan/phpstan/issues/9899)
- [PHP8.2 - Interface property annotation not found inside class](https://github.com/phpstan/phpstan/issues/8550)

… and eventually became the [headlining feature of PHPStan 1.10.56](https://github.com/phpstan/phpstan/releases/tag/1.10.56).

If you are in need of a certain feature or bugfix in PHPStan, Rector or related tooling, please [get in touch](https://staabm.github.io/2024/01/01/phpstan-customizing.html#get-in-touch).

#### `@phpstan-require-extends` trait-example

It's best described with an example, so have a look at the psalm documentation example:

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

When using interfaces we can achieve more though, because the interface type can be used as e.g. a parameter-type:

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
PHPStan will not error when accessing public properties or calling public methods of `DatabaseModel`, based on the `SoftDeletingMarkerInterface` type.

See the full [example running in the PHPStan sandbox](https://phpstan.org/r/4998eff7-7117-43b3-b022-0ee185bc4529)

**NOTE:**
Looking up properties/calling methods on the interface type is currently only possible in PHPStan. I have opened a dedicated [psalm feature request #10538 for discussion](https://github.com/vimeo/psalm/issues/10538).

#### `@phpstan-require-implements` trait-example

Similar to the `@phpstan-require-extends` trait example, its supported to use `@phpstan-require-implements` on traits:

```php
/**
 * @phpstan-require-implements DatabaseModelInterface
 */
trait SoftDeletingTrait {
  // useful but scoped functionality, that depends on methods/properties from DatabaseModel
}
```

With this declaration we define that a class wich uses the `SoftDeletingTrait` has to implement a `DatabaseModelInterface` interface.

See the full [example running in the PHPStan sandbox](https://phpstan.org/r/124389c9-d215-422a-b09c-2299cc8b33f0)


### psalm compatibility

As with most phpDoc annotations, PHPStan will happily accept a psalm-prefxied `@psalm-require-implements`.

**NOTE:**
Looking up properties/calling methods on the interface type is currently only possible in PHPStan. I have opened a dedicated [psalm feature request #10538 for discussion](https://github.com/vimeo/psalm/issues/10538).


### read more

The new feature is mentioned in the [PHPStan docs](https://phpstan.org/writing-php-code/phpdocs-basics#enforcing-class-inheritance-for-interfaces-and-traits) and [PHPStan blog](https://phpstan.org/blog/solving-phpstan-access-to-undefined-property#making-%40property-phpdoc-above-interfaces-work-on-php-8.2%2B) and was recently announced by Ondřej Mirtes [on Twitter](https://twitter.com/OndrejMirtes/status/1745572813367316699) and [mastodon](https://phpc.social/@OndrejMirtes/111739763495147641).


### Future scope: generics support

We plan to support generics in these phpDoc annotations in the future, see the [described idea by Ondřej Mirtes](https://github.com/phpstan/phpstan-src/pull/2856#issuecomment-1884877444).
If you are interessted in this or any other feature addition, please [considering sponsoring it](https://staabm.github.io/2024/01/01/phpstan-customizing.html).
