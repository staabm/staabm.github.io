---
tags:
    - PHPStan

image: "images/og-images/phpstan-remember-constructor-types.jpg"

ogImage:
    title: "PHPStan remembered types from constructor"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "phpstan-remember-constructor-types"
---

### PHPStan remembered types from constructor

Over the last few days I am working on a new PHPStan capability,
which allows PHPStan to use type information from analyzing a class-constructor
with the goal to improve results when later on analyzing instance methods or property hook bodies.

Let's have a look into a few example use-cases for this new feature:

#### Remember `class_exists()`, `function_exists()`

Checking class- or function existence in the constructor in combination with an aborting expression which prevents object creation,
will prevent errors like `Function some_unknown_function not found.` in instance methods. The same is true for `class_exists`.

This means you no longer need to wrap a call to a conditionally defined function in a `function_exists` block everytime you use it.
PHPStan will remember for the whole class that the function will exist, when analyzing instance methods or property hook bodies.

Static methods will still emit a `Function some_unknown_function not found.` error, as these can still be called even if the constructor failed to create an object.

```php
class User
{
	public function __construct(
	) {
		if (!function_exists('some_unknown_function')) {
			throw new \LogicException();
		}
	}

	public function doFoo(): void
	{
		some_unknown_function();
	}

}
```

#### Remember Constants

Similar to the example above its possible to check for the existence of a global constant in the constructor.
What also comes in handy is narrowing the global constant type will also be preserved for the whole class.

```php
class HelloWorld
{
	public function __construct()
	{
		if (!defined('REMEMBERED_FOO')) {
			throw new LogicException();
		}
		if (!is_string(REMEMBERED_FOO)) {
			throw new LogicException();
		}
	}

	static public function staticFoo2(): void
	{
		echo REMEMBERED_FOO; // error, as can be invoked without instantiation
	}

	public function returnFoo2(): int
	{
		return REMEMBERED_FOO; // error, as the constant was narrowed to string
	}
}
```

#### Remember class property types

With all the required machinery in place we went one step further and also remember type information about class properties.

##### `readonly` property types

When properties are declared `readonly` PHPStan is now able to remember all possible types assigned in the constructor.
You no longer need to declare a narrow phpdoc type in this case to make PHPStan aware of the concrete values.

```php
class User
{
	public string $name {
		get {
			assertType('1|2', $this->type);
			return $this->name ;
		}
	}

	private readonly int $type;

	public function __construct(
		string $name
	) {
		$this->name = $name;
		if (rand(0,1)) {
			$this->type = 1;
		} else {
			$this->type = 2;
		}
	}
}
```

##### typed properties and the uninitialized state

Until now PHPStan didn't know which properties have been initialized in the constructor.
Thanks to the recent additions the analysis of instance methods is now aware which properties can no longer be in the uninitialized state, because they have been initialized already.

With this knowledge we are able to tell whether `isset()`, `empty()` or `??` is redundant.

```php
class User
{
    private string $string;

    public function __construct()
    {
        if (rand(0, 1)) {
            $this->string = 'world';
        } else {
            $this->string = 'world 2';
        }
    }

    public function doFoo(): void
    {
		// Property User::$string in isset() is not nullable nor uninitialized.
        if (isset($this->string)) {
            echo $this->string;
        }
    }

    public function doBar(): void
    {
		// Property User::$string on left side of ?? is not nullable nor uninitialized.
        echo $this->string ?? 'default';
    }
}
```

Related PHPStan issues:
- [#12860: Remember narrowed types from the constructor when analysing other methods](https://github.com/phpstan/phpstan/issues/12860)
- [#10048: False positive "Access to an uninitialized readonly property"](https://github.com/phpstan/phpstan/issues/10048)
- [#11828: False-positive "property.uninitializedReadonly" when used indirectly by anonymous function](https://github.com/phpstan/phpstan/issues/11828)
- [#9075: Improve type inference using information from the Class constructor](https://github.com/phpstan/phpstan/issues/9075)
- [#6063: Expression on left side of ?? is only nullable, but non-nullable properties do not cause an error](https://github.com/phpstan/phpstan/issues/6063)
- [#12723: Typed property mistaken as nullable](https://github.com/phpstan/phpstan/issues/12723)
