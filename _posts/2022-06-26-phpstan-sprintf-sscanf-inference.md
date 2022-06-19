## PHPStan sprintf/sscanf type inference

In a series of pull requests I have been working on the improving the PHPStan type inference for `sprintf`, `vsprintf` and `sscanf`.

### `sprintf` inference

On the 4th of june Philippe Villiers (aka [@kissifrot](https://github.com/kissifrot)) reported an [interessting issue regarding `sprintf`](https://github.com/phpstan/phpstan/issues/7387).
The [code example he provided](https://phpstan.org/r/546a013a-1028-41d6-9256-2528c6123498) made me immediately think about our own codebase.
It looked so familiar to me, that I decided fixing this problem might fix issues in our own codebase. So I started to work on it.

The [first iteration](https://github.com/phpstan/phpstan-src/pull/1410) on the problem fixed the issue mentioned.
I just had to make the already existing `SprintfFunctionDynamicReturnTypeExtension` handle a possible `ConstantStringType`-format-string.
When the format is constant we know all its details at analysis time and can do a better return type inference.

This first PR also sparked [some](https://github.com/phpstan/phpstan-src/pull/1410#issuecomment-1152123657) [great](https://github.com/phpstan/phpstan-src/pull/1410#issuecomment-1152131750) conversations with other PHPStan contributors,
which made it obvious that we can do even better.

One obvious improvement was to add [support for positional arguments](https://github.com/phpstan/phpstan-src/pull/1437).

The more time you invest into the problem area the better your mental model gets.
While working thru all this I had a few [more ideas about possible use cases](https://github.com/phpstan/phpstan-src/pull/1440), which I wanted to cover.

### `sscanf` inference

I always try to step back for a moment and get the overall picture of my change. While doing a walk arround my home area I realized that there is a obvious counterpart to `sprintf` - namely `sscanf`.
While `sprintf` is used to format a string, `sscanf` can be used to parse a string back into separate parts.

Using the format-string one can define which datatype to expect and php-src returns such types when found.
For the time beeing PHPStan treated the returned variables as a generic array, without further type specification.

```php
$parts = sscanf($mandate, "%s %d %d");
// PHPStan until 1.7.14 treated $parts as a plain array
```

With a new [SscanfFunctionDynamicReturnTypeExtension](https://github.com/phpstan/phpstan-src/pull/1434) I was able to give PHPStan a better idea of the types involved:

```php
// as of PHPStan 1.7.15+ knows the types
list(
  $month, // string
  $day, // int
  $year // int
) = fscanf($r, "%s %d %d");
```

### `vsprintf` inference

After doing all of the above, I realized php-src also contains a `vsprintf` function -  I have never used before.
Since this function accepts the same format string as `sprintf`, I just had to [adjust the already existing extension](https://github.com/phpstan/phpstan-src/pull/1441) to also do its magic for this function.


### summary

Working on this kind of problems makes really fun. I have used these functions a lot and have a pretty good idea what to expect from them.

PHPStan until 1.7.14 did not have a good idea about the types involved, and therefore you would have written some unnecessary code to make it aware of the obvious stuff like:
```php
// PHPStan until 1.7.14, you had to work arround unknown types
list(
  $month, // mixed
  $day, // mixed
  $year // mixed
) = fscanf($r, "%s %d %d");

if (!is_string($month)) {
  throw new \Exception('month is not a string');
}
if (!is_int($day)) {
  throw new \Exception('day is not an integer');
}
if (!is_int($year)) {
  throw new \Exception('year is not an integer');
}

// work with the parsed values
```

With the newly added extensions, as of PHPStan 1.7.15+ you no longer need to write boilerplate to convince PHPStan about the types involved.
It just knows them by heart:

```php
// as of PHPStan 1.7.15+ knows the types
list(
  $month, // string
  $day, // int
  $year // int
) = fscanf($r, "%s %d %d");
```