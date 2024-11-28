---
tags:
    - PHPUnit

image: "images/og-images/phpunit-codesprint-munich.jpg"

ogImage:
    title: "PHPUnit Code Sprint in Munich"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "phpunit-codesprint-munich"
---

### PHPUnit codesprint Munich

In October 2024, I was part of a team of PHPUnit contributors who met in Munich for a Code Sprint at the office of [celebrate.company](https://www.celebrate.company/).
We spent 2 days on discussing, coding and issue triage for the PHPUnit open source project together with Sebastian Bergmann, the creator of PHPUnit.

<img src="/images/post-images/phpunit-munich-2024.png" alt="PHPUnit Code Sprint team in Munich" width="920">

_From left to right: [Andreas Möller](https://phpc.social/@localheinz), myself, [Sebastian Heuer](https://phpc.social/@sebastianheuer), [Arne Blankerts](https://phpc.social/@theseer), Nicola Pilcher, and [Fabian Blechschmidt](https://phpc.social/@Schrank).
Photo by [Sebastian Bergmann](https://phpc.social/@sebastian)._

It was the first time I ever was part of a mob programming session - a similar setup to pair programming but in our case with 7 people at once.
Since most of us never met or teamed up before, it was a great way to share knowledge and get to know each other.

We got a lot of stuff done, and it was a awesome event. I am looking forward to the next one.

In the following I want to share the topics I worked on recently which got finalized during the Code Sprint.
I am particular grateful that the team took the time to review and discuss my recently submitted pull requests.

### My Focus: Reduce overhead when running PHPT tests

#### [PR #5989: Disable Xdebug in subprocess when inactive](https://github.com/sebastianbergmann/phpunit/pull/5989)

In my daily job I am often running different PHP cli tools like PHPUnit, PHPStan, Composer, RectorPHP etc.
I spent a lot of time in debugging these tools, and I am using Xdebug for that.

For that reason most of the time I have Xdebug enabled in my PHP cli configuration, which slows things down considerably.
My thesis is, that a lot of developers out there have Xdebug enabled on their workstations as well, for whatever reason.

So one idea I came up with is, to detect within the PHPUnit main process whether Xdebug is loaded.
When PHPUnit is _not_ configured to collect coverage data with Xdebug and [_no_ debugger is attached](https://xdebug.org/docs/all_functions#xdebug_is_debugger_active),
we take this as a signal that Xdebug is likely not needed in subprocesses which get spawned by PHPUnit.

Comparing PHPUnit runs of a PHPT test before and after the change, show a 4-5x improvement in runtime, when Xdebug is loaded.

The PR will also improve runtime of regular PHPUnit tests when run in process isolation.
It will be released with PHPUnit 11.4.2.

What I particularly like about this patch is, that as soon as you have a debugger attached, there is no additional CLI option or configuration needed to get step-debugging started.


#### Do not run SKIPIF/CLEAN section of PHPT test in separate process when not required

Recently I met old and new friends at the [PHP Developer day in Dresden](https://phpdd.org).

While talking with [Juliette Reinders Folmer](https://github.com/jrfnl), she mentioned long turnaround times in projects which rely on PHPT tests with PHPUnit.
That was my trigger to look into the PHPT TestRunner inner workings.

I realized that for a fully fledged PHPT test, until PHPUnit 11.4.2 we had to spawn 1 subprocess for each `--SKIPIF--`, `--TEST--` and `--CLEAN--` section of a single PHPT test.
This means a lot of process creation overhead, especially on Windows based systems which are particular slow in creating processes.

I took some time exploring how PHPT tests are used in the wild and noticed that `--SKIPIF--` oftentimes consist of some really simple checks like:

```php
--SKIPIF--
<?php
version_compare(PHP_VERSION, "8.0", ">=") or die("skip because attributes are only available since PHP 8.0")
?>
```

or

```php
--SKIPIF--
<?php
if (PHP_OS_FAMILY !== "Windows") echo "skip for Windows only";
?>
```

In contrast `--CLEAN--` often times deletes some filesystem stuff:

```php
--CLEAN--
<?php
unlink(__DIR__ . '/stream-url-stat.src.txt');
unlink(__DIR__ . '/stream-url-stat.dest.txt');
unlink(__DIR__ . '/stream-url-stat.link.txt');
```

Looking at code of these `--SKIPF--` and `--CLEAN--` sections made me think that in a lot of cases these could just be executed within the PHPUnit main process, without the need to isolate it in a subprocess.
Of course there are cases where process isolation is required but in the end a big portion of PHP tests do only some really simple checks.

At that point my experience in static analysis tooling came in handy.
It took me a few days building a small tool, in which I can feed a string of PHP-code and get a list of side effects back executing such code would have.
[staabm/side-effects-detector](https://github.com/staabm/side-effects-detector) was born.

The idea was proposed to Sebastian Bergmann who gave me a GO on integrating it in PHPUnit.
I spent a few more days to test it on some more real world examples and try to verify it will return the expected result.

So in the end detecting situations in which it's fine to avoid to start subprocesses for `--SKIPIF--` and `--CLEAN--` sections of PHPT tests was a matter of 2 pull requests,
which we reviewed with the PHPUnit Code Sprint team in Munich.

- [PR #5998: Do not run `--SKIPIF--` section of PHPT test in separate process when not required](https://github.com/sebastianbergmann/phpunit/pull/5998)
- [PR #5995: Do not run `--CLEAN--` section of PHPT test in separate process when it is free of side effects that modify the parent process](https://github.com/sebastianbergmann/phpunit/pull/5999)

My testing suggested that each process creation we can avoid on macOS saves us 25-30ms. On Windows its about 40-50ms.
These patches will be released with PHPUnit 11.5.0.

ProTip™: In the future try to prevent use of `die()` or `exit()` in `--SKIPIF--` sections of PHPT tests,
and use `echo` or similar instead, so PHPUnit can run your `--SKIPIF--` code in the main process.
In case you are not sure whether PHPUnit is starting subprocesses, try running your test with `--debug`,
and watch for the newly added `Child Process Started`, `Child Process Finished` events.

I did just that in [antecedent/patchwork](https://github.com/antecedent/patchwork/pull/168) and [symfony/symfony](https://github.com/symfony/symfony/pull/58680) to utilize this new capability.


### Remove common prefixes and suffixes from actual and expected single-line strings

We [discussed the idea](https://github.com/sebastianbergmann/phpunit/issues/5846#issuecomment-2423687846) of removing unnecessary content from overlong strings or arrays with overlong keys or values:

<img src="/images/post-images/phpunit-codesprint-munich/diff-overlong.png" alt="Long string in PHPUnit output" width="920">

This idea was [implemented in the aftermath](https://github.com/sebastianbergmann/comparator/pull/117) of the Code Sprint in the comparator component.

<img src="/images/post-images/phpunit-codesprint-munich/diff-shortened.png" alt="Shortened string in PHPUnit output" width="920">


### Support my open source work

A big thank-you goes out to my GitHub sponsors who paid for the train and hotel.
In case my open source work is valuable to you, consider [sponsoring my efforts](https://github.com/sponsors/staabm).
