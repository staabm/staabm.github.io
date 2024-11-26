---
tags:
    - PHPStan

image: "images/og-images/phpstan-mixed-types.jpg"

ogImage:
    title: "A PHPStan mixed type journey"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "phpstan-mixed-types"
---


A `mixed` typed represents the absence of type information. It is a union of all types, which means it can be anything.
This in turn leads to suboptimal PHPStan analysis results which can lead to missing errors or even false positives.

### A `mixed` type PHPStan journey

For a few years, I am now contributing to PHPStan with a focus on improving the type inference,
which means I am looking into code where `mixed` types are involved and how I can improve the situation.

In this article I want to share the most meaningful contributions to PHPStan core,
but also look at PHPStan extensions work which was helpful along the way.


#### Narrow types from if-conditions

What most situations we are looking at have in common is, that we have very little information at the beginning.
One useful tool to get information is a subtractable type, which PHPStan is using for `mixed` for a long time already.
This means we don't describe what we know about a type, but instead we narrow it down by what we know it is not:

```php

function doFoo($mixed) {
    if ($mixed) {
        // $mixed can be anything but a falsey type
        \PHPStan\dumpType($mixed); // mixed~(0|0.0|''|'0'|array{}|false|null)
    }

    if (!$mixed) {
        // $mixed can be anything but a truethy type
        \PHPStan\dumpType($mixed); // 0|0.0|''|'0'|array{}|false|null
    }
}

```

The subtractable type narrowing is used in PHPStan strict-comparisons (e.g. `===` or `!==`) and for some very specific but often used code patterns.
I was looking at cases where it was still missing like, type-casts in conditions:

```php

class Test {

	private ?string $param;

	function show() : void {
		if ((int) $this->param) {
			\PHPStan\dumpType($this->param); // string
		} elseif ($this->param) {
			\PHPStan\dumpType($this->param); // non-falsy-string
		}
	}

	function show2() : void {
		if ((float) $this->param) {
			\PHPStan\dumpType($this->param); // string|null
		} elseif ($this->param) {
			\PHPStan\dumpType($this->param); // non-falsy-string
		}
	}

	function show3() : void {
		if ((bool) $this->param) {
			\PHPStan\dumpType($this->param); // non-falsy-string
		} elseif ($this->param) { // Elseif condition is always false.
			\PHPStan\dumpType($this->param); // *NEVER*
		}
	}

	function show4() : void {
		if ((string) $this->param) {
			\PHPStan\dumpType($this->param); // non-empty-string
		} elseif ($this->param) { // Elseif condition is always false.
			\PHPStan\dumpType($this->param); // *NEVER*
		}
	}
}

```

Next I was looking into how a cast on already subtracted mixed types influences the results:

```php

/**
 * @param int|0.0|''|'0'|array{}|false|null $moreThenFalsy
 */
function subtract(mixed $m, $moreThenFalsy) {
	if ($m !== true) {
		assertType("mixed~true", $m);
		assertType('bool', (bool) $m); // mixed could still contain something truthy
	}
	if ($m !== false) {
		assertType("mixed~false", $m);
		assertType('bool', (bool) $m); // mixed could still contain something falsy
	}
	if (!is_bool($m)) {
		assertType('mixed~bool', $m);
		assertType('bool', (bool) $m);
	}
	if (!is_array($m)) {
		assertType('mixed~array<mixed, mixed>', $m);
		assertType('bool', (bool) $m);
	}

	if ($m) {
		assertType("mixed~(0|0.0|''|'0'|array{}|false|null)", $m);
		assertType('true', (bool) $m);
	}
	if (!$m) {
		assertType("0|0.0|''|'0'|array{}|false|null", $m);
		assertType('false', (bool) $m);
	}
	if (!$m) {
		if (!is_int($m)) {
			assertType("0.0|''|'0'|array{}|false|null", $m);
			assertType('false', (bool)$m);
		}
		if (!is_bool($m)) {
			assertType("0|0.0|''|'0'|array{}|null", $m);
			assertType('false', (bool)$m);
		}
	}

	if (!$m || is_int($m)) {
		assertType("0.0|''|'0'|array{}|int|false|null", $m);
		assertType('bool', (bool) $m);
	}

	if ($m !== $moreThenFalsy) {
		assertType('mixed', $m);
		assertType('bool', (bool) $m); // could be true
	}

	if ($m != 0 && !is_array($m) && $m != null && !is_object($m)) { // subtract more types then falsy
		assertType("mixed~(0|0.0|''|'0'|array<mixed, mixed>|object|false|null)", $m);
		assertType('true', (bool) $m);
	}
}

```

A case where we did not properly narrow types was in comparisons with `strlen()` and integer-range types:

```php

function narrowString(string $s) {
    $i = rand(0, 1) ? 1 : 5;
    if (strlen($s) == $i) {
        \PHPStan\dumpType($s); // non-empty-string
    }

    $i = rand(0, 1) ? 2 : 5;
    if (strlen($s) == $i) {
        \PHPStan\dumpType($s); // non-falsey-string
    }
}

```

This also works in a similar fashion when comparing the results of `substr()`:

```php

/**
 * @param non-empty-string $nonES
 * @param non-falsy-string $falsyString
 */
public function stringTypes(string $s, $nonES, $falsyString): void
{
    if (substr($s, 10) === $nonES) {
        assertType('non-empty-string', $s);
    }

    if (substr($s, 10) === $falsyString) {
        assertType('non-falsy-string', $s);
    }
}

```

A pretty complex way of looking at code was to think about what `isset($array[$key])` means for the type of `$key`:

```php
/**
 * @param array<int, string> $intKeyedArr
 * @param array<string, string> $stringKeyedArr
 */
function narrowKey($mixed, string $s, int $i, array $generalArr, array $intKeyedArr, array $stringKeyedArr): void {
	if (isset($generalArr[$mixed])) {
		assertType('mixed~(array|object|resource)', $mixed);
	} else {
		assertType('mixed', $mixed);
	}
	assertType('mixed', $mixed);

	if (isset($generalArr[$i])) {
		assertType('int', $i);
	} else {
		assertType('int', $i);
	}
	assertType('int', $i);

	if (isset($generalArr[$s])) {
		assertType('string', $s);
	} else {
		assertType('string', $s);
	}
	assertType('string', $s);

	if (isset($intKeyedArr[$mixed])) {
		assertType('mixed~(array|object|resource)', $mixed);
	} else {
		assertType('mixed', $mixed);
	}
	assertType('mixed', $mixed);

	if (isset($intKeyedArr[$i])) {
		assertType('int', $i);
	} else {
		assertType('int', $i);
	}
	assertType('int', $i);

	if (isset($intKeyedArr[$s])) {
		assertType("lowercase-string&numeric-string&uppercase-string", $s);
	} else {
		assertType('string', $s);
	}
	assertType('string', $s);

	if (isset($stringKeyedArr[$mixed])) {
		assertType('mixed~(array|object|resource)', $mixed);
	} else {
		assertType('mixed', $mixed);
	}
	assertType('mixed', $mixed);

	if (isset($stringKeyedArr[$i])) {
		assertType('int', $i);
	} else {
		assertType('int', $i);
	}
	assertType('int', $i);

	if (isset($stringKeyedArr[$s])) {
		assertType('string', $s);
	} else {
		assertType('string', $s);
	}
	assertType('string', $s);
}

/**
 * @param array<int, array<string, float>> $arr
 */
function multiDim($mixed, $mixed2, array $arr) {
	if (isset($arr[$mixed])) {
		assertType('mixed~(array|object|resource)', $mixed);
	} else {
		assertType('mixed', $mixed);
	}
	assertType('mixed', $mixed);

	if (isset($arr[$mixed]) && isset($arr[$mixed][$mixed2])) {
		assertType('mixed~(array|object|resource)', $mixed);
		assertType('mixed~(array|object|resource)', $mixed2);
	} else {
		assertType('mixed', $mixed);
	}
	assertType('mixed', $mixed);

	if (isset($arr[$mixed][$mixed2])) {
		assertType('mixed~(array|object|resource)', $mixed);
		assertType('mixed~(array|object|resource)', $mixed2);
	} else {
		assertType('mixed', $mixed);
		assertType('mixed', $mixed2);
	}
	assertType('mixed', $mixed);
	assertType('mixed', $mixed2);
}

/**
 * @param array<int, string> $arr
 */
function emptyArrr($mixed, array $arr)
{
    if (count($arr) !== 0) {
        return;
    }

    assertType('array{}', $arr);
    if (isset($arr[$mixed])) {
        assertType('mixed', $mixed);
    } else {
        assertType('mixed', $mixed);
    }
    assertType('mixed', $mixed);
}

function emptyString($mixed)
{
    // see https://3v4l.org/XHZdr
    $arr = ['' => 1, 'a' => 2];
    if (isset($arr[$mixed])) {
        assertType("''|'a'|null", $mixed);
    } else {
        assertType('mixed', $mixed); // could be mixed~(''|'a'|null)
    }
    assertType('mixed', $mixed);
}

function numericString($mixed, int $i, string $s)
{
    $arr = ['1' => 1, '2' => 2];
    if (isset($arr[$mixed])) {
        assertType("1|2|'1'|'2'|float|true", $mixed);
    } else {
        assertType('mixed', $mixed);
    }
    assertType('mixed', $mixed);

    $arr = ['0' => 1, '2' => 2];
    if (isset($arr[$mixed])) {
        assertType("0|2|'0'|'2'|float|false", $mixed);
    } else {
        assertType('mixed', $mixed);
    }
    assertType('mixed', $mixed);

	$arr = ['1' => 1, '2' => 2];
	if (isset($arr[$i])) {
		assertType("1|2", $i);
	} else {
		assertType('int', $i);
	}
	assertType('int', $i);

	$arr = ['1' => 1, '2' => 2, 3 => 3];
	if (isset($arr[$s])) {
		assertType("'1'|'2'|'3'", $s);
	} else {
		assertType('string', $s);
	}
	assertType('string', $s);

	$arr = ['1' => 1, '2' => 2, 3 => 3];
	if (isset($arr[substr($s, 10)])) {
		assertType("string", $s);
		assertType("'1'|'2'|'3'", substr($s, 10));
	} else {
		assertType('string', $s);
	}
	assertType('string', $s);
}

function intKeys($mixed)
{
    $arr = [1 => 1, 2 => 2];
    if (isset($arr[$mixed])) {
        assertType("1|2|'1'|'2'|float|true", $mixed);
    } else {
        assertType('mixed', $mixed);
    }
    assertType('mixed', $mixed);

    $arr = [0 => 0, 1 => 1, 2 => 2];
    if (isset($arr[$mixed])) {
        assertType("0|1|2|'0'|'1'|'2'|bool|float", $mixed);
    } else {
        assertType('mixed', $mixed);
    }
    assertType('mixed', $mixed);
}

function arrayAccess(\ArrayAccess $arr, $mixed) {
    if (isset($arr[$mixed])) {
        assertType("mixed", $mixed);
    } else {
        assertType('mixed', $mixed);
    }
    assertType('mixed', $mixed);
}
```
