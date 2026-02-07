---

tags:
    - dx
    - PHPStan

image: "images/og-images/git-bisect-run.jpg"

ogImage:
    title: "git bisect run"
    subtitle: "automate the process to find a regression commit"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "git-bisect-run"
---

## Automate the process to find a regression commit

The first thing after someone reported a regression bug is to find out when it broke.
After finding the regression commit it's easier to reason about the problem context and explore a new fix.

In the past I used [`git bisect`](https://git-scm.com/docs/git-bisect) to run the process and get to the source of the problem one step at a time.

Recently I learned this process can be automated using the `git bisect run` subcommand.
While the following procedure works in any Git based project, I will walk you through a real world PHPStan example.

## Find a regression commit - the manual way

Preparation: Put your reproducer code into `bug-xyz.php` in the phpstan-src root dir and run `bin/phpstan bug-xyz.php` on it to verify/observe the faulty behavior.

Usually running a bisect process works like

1. Initialize the process: `git bisect start`.
2. Tell the tooling about known working and non-working commits using `git bisect bad <your commit>` and `git bisect good <your commit>`.
3. Run `composer install` to build PHPStan with its dependencies for the current commit.
4. Run `bin/phpstan bug-xyz.php` and observe whether PHPStan works like expected. If the faulty behavior can be observed execute `git bisect bad`. If it works like expected execute `git bisect good`.
5. Git will automatically checkout a new commit. You start with step 3 again and do these manual steps until Git tells you that it found the "first bad commit".

While this process works good, it requires a lot of manual input and might take a while until you finally find the regression commit.
Some people might even not use this process because it requires a lot of boring manual commands.

## Find a regression commit - Automated `git bisect`

Automating the process requires a bit more preparation work, but usually it will save you a lot of time in the bisection process.
It also takes away possible human errors in the process, which can be frustrating when e.g. mistakenly mixing up good and bad commits.

After having it setup once you can easily adapt the involved files and apply the idea to different code examples.

### Preparation

Put your reproducer code into `bug-xyz.php` in the phpstan-src root dir and run `bin/phpstan bug-xyz.php` on it to verify/observe the faulty behavior.

#### Variant A: Find a PHPStan false-positive error

In this case we want to find the regression commit in which PHPStan started to emit a wrong error message which it did not emit in previous versions.

Create a file `test.sh` in the phpstan-src root dir:
```
#!/bin/bash

composer install
PHPSTAN_FNSR=1 php bin/phpstan analyze bug-xyz.php --debug |grep "Expected type object, actual: mixed"
```

run `./test.sh` and check whether the script returns as expected using `echo $?`.
exit-code should be `0` when everything went well and non-0 otherwise.

#### Variant B: Find a PHPStan false-negative error

In this case we want to find the regression commit in which PHPStan started to no longer report an expected error message.

Create a file `test.sh` in the phpstan-src root dir:
```
#!/bin/bash

composer install
PHPSTAN_FNSR=1 php bin/phpstan analyze bug-xyz.php --debug |grep "Expected type object, actual: mixed"
test $? -eq 1 # error when grep did not match
```

run `./test.sh` and check whether the script returns as expected using `echo $?`.
exit-code should be `0` when everything went well and non-0 otherwise.

### Run `git bisect`

After we prepared a `bug-xyz.php` and a `test.sh` in the previous steps,
we can now instruct `git bisect` to start the bisection process utilizing `test.sh` to inform Git whether the bug can be observed or not.

Run `git bisect run ./test.sh` and it will run on its own until it finds the first bad commit.
The process might output a big wall of text while working through the Git history:

```
git bisect run ./test.sh
.
.
.
[8612d23273cae722be5d8cfd4e559357edf775a7] Split MutatingScope->resolveType() into smaller methods - part 2 (#4760)
running './test.sh'
Composer could not detect the root package (phpstan/phpstan-src) version, defaulting to '1.0.0'. See https://getcomposer.org/root-version
Gathering patches for root package.
Installing dependencies from lock file (including require-dev)
Verifying lock file contents can be installed on current platform.
Nothing to install, update or remove
Package hoa/compiler is abandoned, you should avoid using it. No replacement was suggested.
Package hoa/consistency is abandoned, you should avoid using it. No replacement was suggested.
Package hoa/event is abandoned, you should avoid using it. No replacement was suggested.
Package hoa/exception is abandoned, you should avoid using it. No replacement was suggested.
Package hoa/file is abandoned, you should avoid using it. No replacement was suggested.
Package hoa/iterator is abandoned, you should avoid using it. No replacement was suggested.
Package hoa/math is abandoned, you should avoid using it. No replacement was suggested.
Package hoa/protocol is abandoned, you should avoid using it. No replacement was suggested.
Package hoa/regex is abandoned, you should avoid using it. No replacement was suggested.
Package hoa/stream is abandoned, you should avoid using it. No replacement was suggested.
Package hoa/ustring is abandoned, you should avoid using it. No replacement was suggested.
Package hoa/visitor is abandoned, you should avoid using it. No replacement was suggested.
Package hoa/zformat is abandoned, you should avoid using it. No replacement was suggested.
Generating autoload files
Generating attributes file
Generated attributes file in 377.431 ms
55 packages you are using are looking for funding.
Use the `composer fund` command to find out more!

 ! [NOTE] The Xdebug PHP extension is active, but "--xdebug" is not used.
 !        The process was restarted and it will not halt at breakpoints.
 !        Use "--xdebug" if you want to halt at breakpoints.

Note: Using configuration file /Users/staabm/workspace/phpstan-src/phpstan.neon.dist.
4a143bdda18c535d66ea5afbcea885c7cce63abd is the first bad commit
commit 4a143bdda18c535d66ea5afbcea885c7cce63abd
Author: Markus Staab <maggus.staab@googlemail.com>
Date:   Thu Jan 15 08:52:27 2026 +0100

    Cache ClassReflections

 src/Type/ObjectType.php | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)
bisect found first bad commit
```

In the above output we can see Git identified a commit:

> 4a143bdda18c535d66ea5afbcea885c7cce63abd is the first bad commit

To get more information about this commit you can for example open it in your browser:
[https://github.com/phpstan/phpstan-src/commit/4a143bdda18c535d66ea5afbcea885c7cce63abd](https://github.com/phpstan/phpstan-src/commit/4a143bdda18c535d66ea5afbcea885c7cce63abd)
