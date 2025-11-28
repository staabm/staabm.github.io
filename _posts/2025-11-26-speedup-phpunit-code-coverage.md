---
tags:
    - PHPStan
    - PHPUnit
    - Mutation Testing

image: "images/og-images/speedup-phpunit-code-coverage.jpg"

ogImage:
    title: "Speedup PHPUnit code coverage generation"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "speedup-phpunit-code-coverage"
---

## Speedup PHPUnit code coverage generation

While working on the PHPStan codebase I recently realized we spent a considerable amount of time to generate code-coverage data,
which we need later on to feed the Infection based [mutation testing process](https://staabm.github.io/2025/08/01/infection-php-mutation-testing.html).

Running mutation testing in our continuous integration pipeline based on GitHub Actions took around ~15m 30s in total per PHP version we support.
In this article I will describe how I approached this problem and what we came up with.

Most of the following ideas and optimizations will also fit for other PHPUnit code coverage use cases.


## Getting a better idea of what is slow

As a very first step I tried to divide the big block of work into smaller parts, to get a better understanding which part actually is slow.
Therefore, separating Infections' preparational initial-tests step from the actual mutation testing was my first take.
This can be achieved by running infection with [`--skip-initial-tests`](https://infection.github.io/guide/command-line-options.html) and record the coverage data beforehand in a separate step.
The resulting GitHub Actions steps for this look like:

```
# see https://infection.github.io/guide/command-line-options.html#coverage
- name: "Create coverage in parallel"
run: |
  php -d pcov.enabled=1 tests/vendor/bin/paratest \
    --passthru-php="'-d' 'pcov.enabled=1'" \
    --coverage-xml=tmp/coverage/coverage-xml --log-junit=tmp/coverage/junit.xml

- name: "Run infection"
run: |
  git fetch --depth=1 origin ${{ steps.default-branch.outputs.name }}
  infection \
    --git-diff-base=origin/${{ steps.default-branch.outputs.name }} \
    --git-diff-lines \
    --coverage=tmp/coverage \
    --skip-initial-tests \
    --ignore-msi-with-no-mutations \
    --min-msi=100 \
    --min-covered-msi=100 \
    --log-verbosity=all \
    --debug \
    --logger-text=php://stdout
```

note, that we are using `pcov` over `xdebug` to record coverage information, as in our case this was the [considerably faster option](https://github.com/phpstan/phpstan-src/pull/4565#issuecomment-3545713472).

also note, that we are using `paratest` - which we use for running tests in phpstan-src already - to create coverage information with parallel running workers.
before this change, when infection itself triggered the initial test step, this work was done on a single process only.

This leads us to the following results:
- the total amount of time required to run this dropped to ~12m 30s
- coverage generation takes ~6m 10s
- from looking at the `paratest` output, we see `Generating code coverage report in PHPUnit XML format ... done [01:00.714]`
- running infection takes ~6m 20s


## Speedup code coverage xml report generation

I was pretty surprised that the xml report generation takes 1 minute alone.

Looking into blackfire profiles of this xml generation process yielded some interesting insight.
While working on a few micro-optimizations in the underlying libraries I slowly started to better understand how all this works.

- Faster coverage-xml report [sebastianbergmann/php-code-coverage#1102](https://github.com/sebastianbergmann/php-code-coverage/pull/1102)
- Simplify XMLSerializer [theseer/tokenizer#24](https://github.com/theseer/tokenizer/pull/24)
- Simplify TokenCollection [theseer/tokenizer#25](https://github.com/theseer/tokenizer/pull/25)
- Streamline XMLSerializer [theseer/tokenizer#29](https://github.com/theseer/tokenizer/pull/29)
- Streamline Tokenizer->fillBlanks() [theseer/tokenizer#32](https://github.com/theseer/tokenizer/pull/32)
- Utilize PhpToken::tokenize() - requires PHP8+ [theseer/tokenizer#35](https://github.com/theseer/tokenizer/pull/35)


After a chat with php-src contributor [Niels Dossche](https://github.com/ndossche) the idea came up,
that XML report generation could see a big speed boost after untangling the DOM and XMLWriter implementation.
A new [pull request which drops the DOM dependency](https://github.com/sebastianbergmann/php-code-coverage/pull/1125) shows we could reach a ~50% faster report generation.
While the implementation before this PR was more flexible, I think this flexibility is not worth such a performance penalty.
By removing the DOM interactions I feel we made the implementation more direct and explicit.

## Faster code coverage data processing

Another idea which came up was looking into the involved data-structures of PHPUnits' [sebastianbergmann/php-code-coverage](https://github.com/sebastianbergmann/php-code-coverage) component.

Reworking the implementation which heavily relied on PHP arrays lead us to [~33% faster data processing](https://github.com/sebastianbergmann/php-code-coverage/pull/1105) for PHPUnits' `--path-coverage` option.
Inspiration for this change came from a [GIST by Nikita Popov](https://gist.github.com/nikic/5015323), which I found on github.com.
It explains in full detail why/when objects use less memory than arrays.

While refactoring the implementation by introducing more immutable objects and reducing unnecessary duplicate work I squeezed out a bit more performance:
- Prevent sorting coverage-data over and over in [sebastianbergmann/php-code-coverage#1107](https://github.com/sebastianbergmann/php-code-coverage/pull/1107) and [sebastianbergmann/php-code-coverage#1108](https://github.com/sebastianbergmann/php-code-coverage/pull/1108)
- Node properties are immutable [sebastianbergmann/php-code-coverage#1117](https://github.com/sebastianbergmann/php-code-coverage/pull/1117)


## Prevent unnecessary work

Sebastian came up with the [suggestion of removing the `<source>`-element](https://github.com/sebastianbergmann/php-code-coverage/pull/1125#issuecomment-3582440397) from the xml coverage report via opt-in flag.

After playing with the idea it seems this information is not required by Infection, so he added a new [`--exclude-source-from-xml-coverage` CLI option](https://github.com/sebastianbergmann/phpunit/issues/6422)
which will be [used by Infection to speedup the coverage generation](https://github.com/infection/infection/pull/2604) when PHPUnit 12.5+ is used.

A test on the PHPStan codebase shows, this can [speedup the xml coverage report generation by ~15%](https://github.com/sebastianbergmann/php-code-coverage/pull/1125#issuecomment-3584453120).



## Taking shortcuts

Working on slow processes like code-coverage recording which takes multiple minutes to execute, its vital to take shortcuts which shorten the feedback loop.
To assist myself I hacked into the process a few lines of code which `serialize`d the generated `CodeCoverage` object and stored it as a 998MB file.

Using the pre-recorded data and the following short script made it possible to profile the xml report generation alone, without long waiting for the data recording:
```php
<?php

require_once 'vendor/autoload.php';

use PHPUnit\Runner\Version;
use SebastianBergmann\CodeCoverage\Report\Xml\Facade as XmlReport;

$coverage = unserialize(file_get_contents(__DIR__ . '/coverage-data.ser'));
$config = file_get_contents(__DIR__ . '/coverage.xml');

$writer = new XmlReport(Version::id());
$writer->process($coverage, $config);
```

I put all this into a [separate git repository](https://github.com/staabm/code-coverage-benchmarks/tree/main/slow-coverage-xml1) to allow re-using it in the future.


## Summary

Working thru all this details and codebases made a lot of fun while also taking a lot of my freetime.

At this point I want to emphasize how important it is to separate the public API of a library/tool/component from the inner workings.
Sebastian Bergmann and Arne Blankerts did a great job in the repositories I worked on in this context by declaring classes `@internal`,
so we could easily even do backwards incompatible changes, as long as the top level public API is untouched.

In the future a lot of projects will benefit from these changes by updating PHPUnit and related libraries.
Faster tooling processes will also save costly CI-minute resources and people waiting time.

Make sure your boss considers [sponsoring my open source work](https://github.com/sponsors/staabm), so I can spend more time on your beloved code quality tooling.

