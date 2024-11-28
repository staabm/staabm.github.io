---
tags:
    - PHPStan
    - performance

image: "images/og-images/phpstan-result-cache-gotcha.jpg"

ogImage:
    title: "PHPStan result cache gotcha"
    subtitle: "get the most out of it - less waiting, more focus"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "phpstan-result-cache-gotcha"
---

## PHPStan result cache gotchas

As part of the [performance post series](https://staabm.github.io/archive.html#performance) we had a look into a lot of profiling and in detail code optimizations.

In this post we will have a top level look on PHPStan performance from a enduser perspective.

## Goal

While we are working hard on [squeezing out every bit of performance](https://github.com/phpstan/phpstan-src/pulls?q=is%3Apr+sort%3Aupdated-desc+fast+is%3Amerged+) out of PHPStan,
you as an end user should foremost make sure that PHPStan can benefit from its [result cache](https://phpstan.org/user-guide/result-cache) as often as it can.

In the projects I am working on, we usually see PHPStan analysis times dropping from 5-10 _minutes_ to 10-30 _seconds_
when everything is going according to plan and the tool can do its job utilizing the result cache.

But what could possibly go wrong?
In this post I will write down what I learned from setting up PHPStan in a lot of different projects and environments.

## Lets go

You don't need to enable result cache explicitly, as it's enabled by default.
PHPStan tries to be as smart as possible about invalidating the cache when required.

### How it works

To find out when/whether PHPStan is using the result cache, you can use the `-vvv` flags.

- Running it on a project for the very first time will always result in a full analysis:

```bash
$ phpstan -vvv
Result cache not used because the cache file does not exist.
 1562/1562 [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100% 20 secs/20 secs

Result cache is saved.


 [OK] No errors


Used memory: 2.13 GB
```

-> note the initial message, telling you about result cache usage.

-> note the analysis in this project is taking 20 seconds and 2.13 GB of memory.

- On a subsequent run, PHPStan will use the result cache:

```bash
$ phpstan -vvv
Note: Using configuration file /Users/staabm/workspace/phpstan-src/phpstan.neon.dist.
 1562/1562 [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100% < 1 sec/< 1 sec

Result cache is saved.


 [OK] No errors


Used memory: 133.88 MB
```

-> the analysis process finished in under 1 second in comparison to 20 seconds before.

-> it took 134 MB of memory in comparison to 2.13 GB before.

- In case you e.g. modify dependencies via composer, PHPStan invalidates the cache and triggers a full analysis scan:

```bash
$ phpstan -vvv
Note: Using configuration file /Users/staabm/workspace/phpstan-src/phpstan.neon.dist.
Result cache not used because the metadata do not match: projectConfig, composerLocks
1562/1562 [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100% 19 secs/19 secs

Result cache is saved.


[OK] No errors


Used memory: 2.14 GB
```

-> you can see PHPStan realized the `composerLocks` are different, which made it invalidate the cache.
Starting with PHPStan 1.10.36 we [print the reason why invalidation happened](https://github.com/phpstan/phpstan-src/pull/2630).

-> There can be different reasons why the cache is invalidated or not used at all. Find all the details in the [ResultCacheManager class](https://github.com/phpstan/phpstan-src/blob/1.11.x/src/Analyser/ResultCache/ResultCacheManager.php).

- If you want to invalidate the cache manually, you can use the `clear-result-cache` command. This will also reveal the location of the result cache files:

```bash
$ phpstan clear-result-cache -vvv
Note: Using configuration file /Users/staabm/workspace/phpstan-src/phpstan.neon.dist.
Result cache cleared from directory:
/Users/staabm/workspace/phpstan-src/tmp
```

- When running PHPStan with the `--debug` option, it will not use the result cache:

```bash
$ phpstan --debug -vvv
Note: Using configuration file /Users/staabm/workspace/phpstan-src/phpstan.neon.dist.
Result cache not used because of debug mode.
...
```

- [Regeneration of the baseline with a warmed result cache should finish instantly](https://github.com/phpstan/phpstan-src/pull/2606) starting with PHPStan 1.10.34:

```bash
$ phpstan -vvv --generate-baseline
Note: Using configuration file /Users/staabm/workspace/phpstan-src/phpstan.neon.dist.
 1562/1562 [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100% < 1 sec/< 1 sec

Result cache is saved.


 [OK] Baseline generated with 645 errors.


Used memory: 147.88 MB
```

### Debugging the inner workings

[Ondřej Pro-Tip](https://github.com/phpstan/phpstan/issues/10027#issuecomment-1770318942): If you need to know in detail, why PHPStan decided to not use the result cache you can `diff` the result-cache file before and after the run.
That can be especially helpful in CI environments, when debugging the problem at hand is pretty hard.

### Result cache on the developer machine

#### Dedicated `resultCachePath`

PHPStan by default uses a singe result cache file for all projects on your machine.
This means when you work and switch between multiple projects the very first run after the project-switch will need a full analysis scan.

To get a more efficient experience when switching between projects, you may consider using a different `resultCachePath` file-name in every projects configuration file.

```
parameters:
    resultCachePath: %tmpDir%/resultCache-project-X.php
```

### Result cache in CI

#### Dedicated `resultCachePath`

In case your CI server does not run projects in a isolated filesystem, you should use a [dedicated `resultCachePath`](https://staabm.github.io/2023/10/21/phpstan-result-cache-gotchas.html#dedicated-resultcachepath)


#### GitHub Actions

When using GitHub Actions you should consider using a [cache action](https://github.com/actions/cache) to persist the result cache between runs.

```yaml
  - name: "Cache result cache"
    uses: actions/cache@v3
    with:
      path: ./tmp
      key: "result-cache-v1-{% raw %}${{ matrix.php-version }}{% endraw %}-{% raw %}${{ github.run_id }}{% endraw %}"
      restore-keys: |
        result-cache-v1-{% raw %}${{ matrix.php-version }}{% endraw %}-
```

- By default the cache is written within `./tmp` on linux based systems
- Using `{% raw %}${{ github.run_id }}{% endraw %}` you can make sure to re-use the most recent result cache
- Use a separate result cache per php version, e.g. using `{% raw %}${{ matrix.php-version }}{% endraw %}`
- Use the `push` GitHub Actions event on the default-branch, to make sure newly created PRs will utilize a fresh cache from the default-branch.

In case you are working with long running branches you may consider using separate `actions/cache/restore@v3` and `actions/cache/save@v3` steps instead, to make sure the result cache [is also persisted on failling jobs](https://github.com/actions/cache/tree/main/save#always-save-cache):

```yaml
  - name: "Restore result cache"
    uses: actions/cache/restore@v3
    with:
      path: ./tmp
      key: "result-cache-v1-{% raw %}${{ matrix.php-version }}{% endraw %}-{% raw %}${{ github.run_id }}{% endraw %}"
      restore-keys: |
        result-cache-v1-{% raw %}${{ matrix.php-version }}{% endraw %}-

  # … run phpstan

  - name: "Save result cache"
    uses: actions/cache/save@v3
    if: always()
    with:
      path: ./tmp
      key: "result-cache-v1-{% raw %}${{ matrix.php-version }}{% endraw %}-{% raw %}${{ github.run_id }}{% endraw %}"
```

**Update:** The above tip regarding GitHub Actions cache handling works also for other tools, like e.g. RectorPHP.

## Give back

In case you find [my PHPStan contributions](https://github.com/phpstan/phpstan-src/pulls?q=is%3Apr+sort%3Aupdated-desc+author%3Astaabm+is%3Amerged) and/or this content useful, [please consider supporting my open source work](https://github.com/sponsors/staabm).

