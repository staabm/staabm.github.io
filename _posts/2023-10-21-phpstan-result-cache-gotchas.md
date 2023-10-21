---
tags:
    - PHPStan
    - performance

image: "images/og-images/phpstan-result-cache-gotcha.jpg"

ogImage:
    title: "PHPStan result cache gotcha"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "phpstan-result-cache-gotcha"
---

As part of the [performance post series](https://staabm.github.io/archive.html#performance) we had a look into a lot of profiling and in detail code optimizations.

In this post we will have a top level look on PHPStan performance from a enduser perspective.

## Goal

While we are working hard on squeezing out every bit of performance out of PHPStan,
you as an end user should foremost make sure that PHPStan can benefit from its [result cache](https://phpstan.org/user-guide/result-cache) as often as it can.

In the projects I am working on, we usually see PHPStan analysis times dropping from 5-10 _minutes_ to 10-30 _seconds_
when everyting is going according to plan and the tool can do its job utilizing the result cache.

But what could possibly go wrong?
In this post I will write down what I learned from setting up PHPStan in a lot of different projects and environments.

## Lets go

You don't need to enable result cache explicitly, as it's enabled by default.
PHPStan tries to be as smart as possible about invalidating the cache when required.

### How it works

To find out when PHPStan is using the result cache, you can use the `-vvv` flags.

- Running it on a project for the very first time will always result in a full analysis:

```bash
phpstan -vvv
Result cache not used because the cache file does not exist.
 1562/1562 [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100% 20 secs/20 secs

Result cache is saved.


 [OK] No errors


Used memory: 2.13 GB
```

- On a subsequent run, PHPStan will use the result cache:

```bash
phpstan -vvv
Note: Using configuration file /Users/staabm/workspace/phpstan-src/phpstan.neon.dist.
 1562/1562 [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100% < 1 sec/< 1 sec

Result cache is saved.


 [OK] No errors


Used memory: 133.88 MB
```

-> the analysis process finished in under 1 seconds in comparison to 20 seconds before.
-> it took 134 MB of memory in comparison to 2.13 GB before.

- In case you e.g. modify dependencies via composer, PHPStan invalidates the cache and once does a new full analysis scan:

```bash
phpstan -vvv
Note: Using configuration file /Users/staabm/workspace/phpstan-src/phpstan.neon.dist.
Result cache not used because the metadata do not match: projectConfig, composerLocks
1562/1562 [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100% 19 secs/19 secs

Result cache is saved.


[OK] No errors


Used memory: 2.14 GB
```

-> you can see PHPStan realized the `composerLocks` are different, which made it invalidate the cache.
Starting with PHPStan 1.10.36 we [print the reason why invalidation happened](https://github.com/phpstan/phpstan-src/pull/2630).

- If you want to invalidate the cache manually, you can use the `clear-result-cache` command. This will also reveal the location of the result cache files:

```bash
phpstan clear-result-cache -vvv
Note: Using configuration file /Users/staabm/workspace/phpstan-src/phpstan.neon.dist.
Result cache cleared from directory:
/Users/staabm/workspace/phpstan-src/tmp
```

- When running PHPStan with the `--debug` option, it will not use the result cache:

```bash
phpstan --debug -vvv
Note: Using configuration file /Users/staabm/workspace/phpstan-src/phpstan.neon.dist.
Result cache not used because of debug mode.
...
```

### Debugging the inner workings

[Ondřej Pro-Tip](https://github.com/phpstan/phpstan/issues/10027#issuecomment-1770318942): If you need to know, why PHPStan decided to not use the result cache you can `diff` the result-cache file before and after the run.
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
      - name: "Cache Result cache"
        uses: actions/cache@v3
        with:
          path: ./tmp
          key: "result-cache-v1-${{ matrix.php-version }}-${{ github.run_id }}"
          restore-keys: |
            result-cache-v1-${{ matrix.php-version }}-
```

- By default the cache is written within `./tmp` on linux based systems
- Using `\${{ github.run_id }}` you can make sure to re-use the most recent result cache
- Use a separate result cache per php version, e.g. using `\${{ matrix.php-version }}`
- Utilize the `push` GitHub Actions event on the default-branch, to make sure newly created PRs will utilize a fresh cache from the default-branch.
- In case you are are working with long running branches you may consider using separate `actions/cache/retore@v3` and `actions/cache/save@v3` steps to make sure the result cache [is also persisted on failling jobs](https://github.com/actions/cache/tree/main/save#always-save-cache).



## Give back

In case you find this content useful, [please consider supporting my open source work](https://github.com/sponsors/staabm).

