---
tags:
    - symfony
    - performance

image: "images/og-images/doctor-rst-speedup.jpg"

ogImage:
  title: "Optimizing performance of DOCtor-RST"
  subtitle: "My journey with the symfony-docs *.rst files linter"
  imageUrl: "https://staabm.github.io/staabm.svg"
  fileName: "doctor-rst-speedup"
---

## DOCtor-RST speedup

This is another part in the [performance series](https://staabm.github.io/archive.html#performance).

Since I have published the last [performance article about Rector](https://staabm.github.io/2023/05/06/racing-rector.html), [Oskar Stark](https://twitter.com/OskarStark) - one of my twitter followers [got in touch](https://twitter.com/OskarStark/status/1658685669009510400) with me:

> @markusstaab we run OskarStark/doctor-rst on all PRs in symfony/symfony-docs 😃 maybe you will check this package for performance too 😍

He is a member of the [symfony](https://symfony.com/) core team and is working on the symfony-docs.

## DOCtor who?

[DOCtor-RST](https://github.com/OskarStark/doctor-rst) is a linter used in the symfony-docs repo to check *.rst files.
Like other static analysis tools it is scanning the sources at hand and provides feedback about common errors and best practices.

Disclaimer: I had never used this tool before and also have zero experience with RST file format.

At the time of writing, running the linter over the symfony-docs repo takes about 50 seconds in the GitHub Actions workflow.
Lets run DOCtor-RST version 1.46.0 locally on my mac against symfony-docs@ff62e1203 to get a baseline:

```
$ time php bin/doctor-rst analyze ../symfony-docs/ --no-cache

31.35s user 0.30s system 99% cpu 31.689 total
```

### Lets profile it …?

As you already know my the next step when investigating performance is running the blackfire profiler on the workfload.

```
$ blackfire run --ignore-exit-status php bin/doctor-rst analyze ../symfony-docs/ --no-cache

The profile will be stored in your Personal environment. The "--environment" option can be used to specify the target environment.

 Analyze *.rst(.inc) files in: /Users/staabm/workspace/symfony-docs
 Used config file:             /Users/staabm/workspace/symfony-docs/.doctor-rst.yaml


Fatal error: Allowed memory size of 1073741824 bytes exhausted (tried to allocate 4096 bytes) in /Users/staabm/workspace/doctor-rst/vendor/symfony/string/AbstractUnicodeString.php on line 236
PHP Fatal error:  Allowed memory size of 1073741824 bytes exhausted (tried to allocate 4096 bytes) in /Users/staabm/workspace/doctor-rst/vendor/symfony/string/AbstractUnicodeString.php on line 236
```

It's not that unusual that running a profiler requires more memory on a workload, therefore I raised the php memory limit to 16GB.
Still I am running in out of memory errors... 🤔

For a sanity check, I added a memory debug out at the end of the analysis process into the `AnalyzeCommand` and ran it again without blackfire:

```php
    $output->writeln(memory_get_peak_usage(true) / 1024 / 1024 . ' MB');
```

PHP reports a peak memory of 12MB, so it was not that high.
At this point I concluded we are likely facing a memory issue in the profiler and reported the issue to the blackfire team.

To get the analysis process running nevertheless, I then decided to reduce the number of *.rst files to analyse.
Therefore I locally deleted *.rst files in the my symfony-docs checkout until blackfire did run without memory issues.
Its not a perfect situation but we could get at least a first idea of the performance characteristics of the workload.

<img width="854" alt="grafik" src="/images/post-images/doctor-rst-speedup/profile1.png">


### The findings

#### reduce IO

As we already saw in previous investigations [reducing IO](https://github.com/OskarStark/doctor-rst/pull/1404) is a good first thing.
In the following graph you can see a lot of calls to `SplFileInfo->getRealPath()`:

<img src="/images/post-images/doctor-rst-speedup/profile3.png">

We just had to [introduce a local variable and call it a day](https://github.com/OskarStark/doctor-rst/pull/1404).

### excessive use of preg_match()

DOCtor-RST internally uses symfony/string which heavily uses multi-byte string functions.
These functions are known to be inefficient in PHP - even though with the latest PHP releases they got much better.

The profiles show us a memory bottleneck on said calls:

<img width="1140" alt="grafik" src="/images/post-images/doctor-rst-speedup/profile2.png">


One experience I had in the past is that in most cases using regular string functions is way more efficient.
I had a look at all used `->matches(…)` invocations and decided to concentrate on a few simple ones, which can be expressed without regular expressions.

<img width="795" alt="grafik" src="/images/post-images/doctor-rst-speedup/code-diff.png">

[Rewriting these expression](https://github.com/OskarStark/doctor-rst/pull/1405) already yielded a great improvement, as these were invoked quite frequently:

<img src="/images/post-images/doctor-rst-speedup/mem-diff.png" >

----

Another case where I was able to reduce the use of regular expressions was in the `->isFootnote()` method.
In this case we had a expression trying to match a string starting with some certain characters.

I decided to add some quick checks which in most cases prevent the actual regular expression to be executed.

<img width="677" alt="grafik" src="/images/post-images/doctor-rst-speedup/code-diff2.png">

These yielded another great improvement in memory consumption and a small improvement in runtime:

<img src="/images/post-images/doctor-rst-speedup/cpu-diff.png">


----

Even if these optimizations were focused on memory oftentimes it turns out they also improve runtime performance.
PHP needs to handle huge amounts of data in memory and therefore this management results in slower executed scripts.
Also garbage collection needs to be heavily involved which takes time to track the memory.

I did [a few more performance oriented pull requests](https://github.com/OskarStark/doctor-rst/pulls?q=is%3Apr++sort%3Aupdated-desc+author%3Astaabm+label%3APerformance+) but nothing of big interest which needs further explanation.


### The results

After all the changes landed lets have another look at the workload:

```
$ time php bin/doctor-rst analyze ../symfony-docs/ --no-cache

20.35s user 0.30s system 99% cpu 21.689 total
```

We are now able to run the workload ~10 seconds faster then the initial ~30 seconds.
This should reduce wait time when contributing to the symfony-docs.

As always, this improvements were crafted in my freetime. I am not a symfony framework user either.
[Please consider supporting my work](https://github.com/sponsors/staabm), so I can make sure open source tools keeps as fast as possible and evolves to the next level.

Happy documenting! 📖
