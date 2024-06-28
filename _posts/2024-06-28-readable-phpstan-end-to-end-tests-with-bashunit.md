---
tags:
    - PHPStan
    - bashunit

image: "images/og-images/phpstan-e2e-bashunit.jpg"

ogImage:
    title: "Readable end-to-end tests for PHPStan with bashunit"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "phpstan-e2e-bashunit"
---

### Readable end-to-end tests for PHPStan with bashunit

For a long time in the PHPStan repository, we have isolated, highly-parallel end-to-end tests which are written in bash utilizing GitHub Actions.
The design and initial implemenation - as far as I know - has been done by Ondřej Mirtes.

I don't know any other project doing end-to-end tests the way it is done in PHPStan.
Since I have recently added [`bashunit`](https://bashunit.typeddevs.com/) to the end-to-end tests, I wanted to share some insights and the benefits of this approach.

NOTE: This post is only about end-to-end tests, not about unit tests or integration tests which would require a largely different setup. 
Also it is not about promoting this approach or comparing it against other mechanisms to implement end-to-end tests.

### What's a end-to-end test?

In the context of this article a PHPStan end-to-end test runs a previously compiled phar-file on the command line
and asserts expectations based on the cli exit-code or the generated command output.

Example:

```bash
cd e2e/different-php-parser2 # change to test-directory
../../phpstan analyse -l 5 src/ # run the precompiled PHPStan
```

When these commands are executed within a GitHub Action, the test is considered successful when all commands exit with a `0` exit-code.
As soon as a single command exits with a non-zero exit-code, the GitHub Action will stop executing and report an error - similar to how `set -e` works in bash scripts.

The PHPStan analyze command will return a non-zero exit-code when errors are found or internal errors happen.
When the PHPStan analyze command ends without errors a `0` exit-code is returned.


### GitHub Action based "data-provider"

Putting such a test into a GitHub Action is a great way to run it in a controlled environment.
Every action run is isolated from others and depending on your GitHub pricing-plan the runner environment will execute even hundreds of these tests in parallel:

```yaml
name: "E2E Tests"

on:
  pull_request:
     # … whatever event you want to trigger the tests

jobs:
  e2e-tests:
    name: "E2E tests"
    runs-on: "ubuntu-latest"
    timeout-minutes: 60

    strategy:
      matrix:
        include:
          - script: | # the actual test
            cd e2e/different-php-parser2
            composer install # install the tests' dependencies
            ../../phpstan analyse -l 5 src # run the precompiled PHPStan

          # script: | # … next test

    steps:
      - name: "Checkout" # checkout of the phpstan repository contains the test-source and a precompiled phar
        uses: actions/checkout@v4

      - name: "Install PHP"
        uses: "shivammathur/setup-php@v2"
        with:
          coverage: "none"
          php-version: "8.1"

      - name: "Test"
        run: {% raw %}${{ matrix.script }}{% endraw %}
```

Each end-to-end test in this case is a simple directory, which can contain anything a regular project could contain, like a `composer.json`, a `phpstan.neon` or a `phpunit.xml.dist` file.
It means we can reproduce real world issue, which PHPStan users might face. Even if they only happen combined with other tools.

This setup also works for any other tool which has a command line interface.

For inspiration: Any [subfolder below `e2e/` in the PHPStan repository](https://github.com/phpstan/phpstan/tree/1.11.x/e2e) represents a single end-to-end test.


Since we are using a regular [GitHub Action matrix](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs) in this scenario, we can easily add more test-parameters to the mix to cover other use-cases:

```yaml
name: "E2E Tests"

on:
  pull_request:
     # … whatever event you want to trigger the tests

jobs:
  e2e-tests:
    name: "E2E tests"
    runs-on: "ubuntu-latest"
    timeout-minutes: 60

    strategy:
      matrix:
        include:
          - php-version: "8.1"
            script: |
            cd e2e/different-php-parser2
            composer install
            ../../phpstan analyse -l 5 src

          - php-version: "7.4"
            script: |
            cd e2e/another-test
            ../../phpstan analyse -l 5 src

          # script: | # … next test

    steps:
      - name: "Checkout"
        uses: actions/checkout@v4

      - name: "Install PHP"
        uses: "shivammathur/setup-php@v2"
        with:
          coverage: "none"
          php-version: "{% raw %}${{ matrix.php-version }}{% endraw %}"

      - name: "Test"
        run: {% raw %}${{ matrix.script }}{% endraw %}
```

Using such parameters one could easily:
- use a different operating system per test
- use different PHP versions per test
- use different PHP extensions per test
- …


### Utilize `bashunit` in end-to-end tests

I recently stumbled over a end-to-end test use-case, in which I needed to assert certain error-message within the output of the PHPStan command.

My initial take on the reproducer, which got refined after great review feedback from Ondřej:

```bash
cd e2e/trait-caching
../../bin/phpstan analyze --no-progress --level 8 --error-format raw data/
patch -b data/TraitOne.php < TraitOne.patch
OUTPUT=$(../../bin/phpstan analyze --no-progress --level 8 --error-format raw data/ || true)
echo "$OUTPUT"
[ $(echo "$OUTPUT" | wc -l) -eq 1 ]
grep 'Method TraitsCachingIssue\\TestClassUsingTrait::doBar() should return stdClass but returns Exception.' <<< "$OUTPUT"
```

This particular test - while working correctly - had a few problems, which make it hard to read, especially for people not used to bash.
- what is `[ $(echo "$OUTPUT" | wc -l) -eq 1 ]` doing?
- PHPStan error messages contain all kind of characters, and some of them need special escaping in bash - e.g. doubling the `\`.
- the `grep` command using input redirection with `<<< "$OUTPUT"`, which handles multi-line strings looks strange for the untrained eye.


In the next iteration to improve the test, I added a small [`assert.sh` wrapper script](https://github.com/phpstan/phpstan-src/blob/51fe9c57222b3040368d4c3e2fa397d6ae1580ef/e2e/assert.sh) around `bashunit`, which allowed us to call the bashunit-assertion functions from the cli:

```bash
cd e2e/trait-caching
../../bin/phpstan analyze --no-progress --level 8 --error-format raw data/
patch -b data/TraitOne.php < TraitOne.patch
OUTPUT=$(../../bin/phpstan analyze --no-progress --level 8 --error-format raw data/ || true)
echo "$OUTPUT"
../assert.sh equals `echo "$OUTPUT" | wc -l` 1
../assert.sh contains 'Method TraitsCachingIssue\TestClassUsingTrait::doBar() should return stdClass but returns Exception.' "$OUTPUT"
```

Note the easily readable assertions without the need to escape certain characters.

At this point we got in contact with the `bashunit` maintainers, which immediately helped us with a few problems in the initial setup.
They also liked the `assert.sh` script so much, that they natively integrated the feature natively into `bashunit` as of version 0.13 ([Release Post](https://bashunit.typeddevs.com/blog/2024-06-21-phpstan-integration)).

So the final test-case in the end looks like:

```bash
cd e2e/trait-caching
../../bin/phpstan analyze --no-progress --level 8 --error-format raw data/
patch -b data/TraitOne.php < TraitOne.patch
OUTPUT=$(../../bin/phpstan analyze --no-progress --level 8 --error-format raw data/ || true)
echo "$OUTPUT"
../bashunit -a line_count 1 "$OUTPUT"
../bashunit -a contains 'Method TraitsCachingIssue\TestClassUsingTrait::doBar() should return stdClass but returns Exception.' "$OUTPUT"
```


### Support my open source work

In case this article was useful, or you want to honor the effort I put into one of the hundreds of pull-requests to PHPStan, please [considering sponsoring my open-source efforts 💕](https://github.com/sponsors/staabm).
