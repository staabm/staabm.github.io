---
tags:
    - Rector
    - performance

image: "images/og-images/debug-rector-performance.jpg"

ogImage:
  title: "How to debug Rector performance"
  subtitle: "Step by step guide on how to find out why Rector is slow on your project"
  imageUrl: "https://staabm.github.io/staabm.svg"
  fileName: "debug-rector-performance"
---

After [initial investigation into Rector performance 🏎️](https://staabm.github.io/2023/05/06/racing-rector.html), we are now at a point where we need more detailed data to get it even faster.
That's why we [added more debug information to the Rector output](https://github.com/rectorphp/rector-src/pull/3785) - inspired by Ruud Kamphuis script to [find slowest PHPStan files](https://gist.github.com/ruudk/41897eb59ff497b271fc9fa3c7d5fb27).

> You want to [look into PHPStan performance](https://staabm.github.io/2022/12/23/phpstan-speedzember.html#how-to-find-slow-files-in-my-project) instead?

## How to find out why Rector is slow on your project?

_Requires Rector 0.16.1 or later_

First we need a single run across the whole project which collects some useful information we can later look into:

```
vendor/bin/rector -vvv --debug --no-diffs | tee rector.log
```

Analyse the generated `rector.log` file with `parse.php`[^parseSource]:
```
php parse.php
```

Now you get a list of files sorted by the time it took Rector to refactor which looks like:

```
Slowest files
4.90 seconds: [file] packages/Testing/PHPUnit/AbstractRectorTestCase.php
4.07 seconds: [file] packages/FamilyTree/Reflection/FamilyRelationsAnalyzer.php
2.99 seconds: [file] packages/Caching/ValueObject/CacheFilePaths.php
2.95 seconds: [file] packages/BetterPhpDocParser/Attributes/AttributeMirrorer.php
2.93 seconds: [file] packages/BetterPhpDocParser/PhpDocNodeVisitor/TemplatePhpDocNodeVisitor.php
2.68 seconds: [file] packages/FamilyTree/Reflection/FamilyRelationsAnalyzer.php
2.61 seconds: [file] packages/NodeTypeResolver/TypeAnalyzer/ArrayTypeAnalyzer.php
2.53 seconds: [file] packages/PHPStanStaticTypeMapper/TypeMapper/OversizedArrayTypeMapper.php
2.07 seconds: [file] packages/BetterPhpDocParser/ValueObject/PhpDocAttributeKey.php
1.71 seconds: [file] bin/clean-phpstan.php
1.52 seconds: [file] config/set/php80.php
1.18 seconds: [file] packages/PhpAttribute/NodeAnalyzer/ExprParameterReflectionTypeCorrector.php
1.01 seconds: [file] packages/Testing/PHPUnit/AbstractRectorTestCase.php
0.97 seconds: [file] config/set/php52.php
0.89 seconds: [file] packages/BetterPhpDocParser/PhpDocNodeVisitor/TemplatePhpDocNodeVisitor.php
0.83 seconds: [file] packages/PHPStanStaticTypeMapper/TypeMapper/ResourceTypeMapper.php
0.83 seconds: [file] packages/Caching/ValueObject/Storage/MemoryCacheStorage.php
0.78 seconds: [file] config/set/php80.php
0.69 seconds: [file] packages/PhpAttribute/AnnotationToAttributeMapper/ArrayItemNodeAnnotationToAttributeMapper.php
0.63 seconds: [file] packages/StaticTypeMapper/PhpDocParser/NullableTypeMapper.php
0.62 seconds: [file] rules/CodingStyle/Rector/ClassConst/VarConstantCommentRector.php
0.60 seconds: [file] packages/PhpAttribute/NodeAnalyzer/ExprParameterReflectionTypeCorrector.php
0.56 seconds: [file] packages/PhpAttribute/AnnotationToAttributeMapper/ArrayItemNodeAnnotationToAttributeMapper.php
...
```

Starting from here you can use your favorite profiler to analyse only the slowest files in isolation.

Example with [blackfire](https://blackfire.io/) and the path to a slow file:
```
blackfire run --ignore-exit-status php vendor/bin/rector -vvv --debug --no-diffs packages/Testing/PHPUnit/AbstractRectorTestCase.php
```

If performance analysis is not your thing, feel free to [open am issue on Rector](https://github.com/rectorphp/rector/issues/new/choose) and bring with you all the information you already gathered in the above process.
Its important you bring all files and configs required to reproduce your performance issue as part of the report.

In case you [support my engagement with a GitHub sponsoring](https://github.com/sponsors/staabm), I can have a look at your performance problem.

----

## `parse.php` script

[^parseSource]: Script to analyse and sort the `rector.log`

```php
<?php // parse.php
declare(strict_types=1);

// inspired and adopted from https://gist.github.com/ruudk/41897eb59ff497b271fc9fa3c7d5fb27

$log = new SplFileObject("rector.log");

$logs = [];
$file = null;
while (! $log->eof()) {
    $line = trim($log->fgets());
    if ($line === '') {
        continue;
    }

    if (str_starts_with($line, '[file]')) {
        $file = $line;
        continue;
    }

    if ($file === null) {
        continue;
    }
    if (preg_match('/took (?<seconds>[\d.]+) s/', $line, $matches) === 1) {
        $logs[] = [(float) $matches['seconds'], $file];
        $file = null;
    }
}

usort($logs, fn(array $left, array $right) => $right[0] <=> $left[0]);
$logs = array_slice($logs, 0, 100);

echo "Slowest files" . PHP_EOL;
foreach ($logs as $log) {
    echo sprintf("%.2f seconds: %s", $log[0], $log[1]) . PHP_EOL;
}
```

