---
tags:
    - Rector
    - performance

image: "images/og-images/diff-speeding.jpg"

ogImage:
  title: "Got diff up to speed"
  subtitle: "Performance optimizing Rector, Psalm, PHPUnit and friends."
  imageUrl: "https://staabm.github.io/staabm.svg"
  fileName: "diff-speeding"
---


## Rector diff speeding

After bringing a performance boost to PHPStan in [Speedzember](https://staabm.github.io/2022/12/23/phpstan-speedzember.html), I had a closer look at [Rector](https://getrector.com/).

## Look into it

Like usual I started into the use-case at hand by running a profiler on my workload.
One thing which stood out was the amount of time spent while creating the diff between the original and the migrated code after the actual code transformation happened.
I found it pretty surprising as my initial guess would be a slow type-resolving or duplicate work within a certain Rector rule.

<img width="379" alt="grafik" src="/images/post-images/diff-speeding/profile1.png">

At this point we only know which things are slow, but have not yet a good idea on how it can be improved.
First I [reported a new issue at the Rector repo](https://github.com/rectorphp/rector/issues/7899) with my findings, to get in touch with maintainers and other users.

The issue reported contains [all relevant data to reproduce](https://github.com/rectorphp/rector/issues/7899) the following findings.

## Trying different things

We need to start somewhere to explore the code and build a basic understanding of the relevant parts.

### Disable diffing should be fast

One thing I wanted to rule out first is, whether the diff creation also slows down the whole process when using the `--no-diffs` option.

Turned out when running Rector and we are not interested in the diff, we still pay for it:

[Fixing that](https://github.com/rectorphp/rector-src/pull/3710) was an easy win and a good first step.

`blackfire run php bin/rector.php -c rector-test.php --dry-run -vvv --debug --no-diffs`

<img width="510" alt="grafik" src="/images/post-images/diff-speeding/diff.png">


### Diff only once

Back at the drawing board I had a closer look at the profiles. In my simple case it was surprising to me that Rector build the diff several times,
even though my workload only changes a single file and prints only a single diff in the end:

<img width="320" alt="grafik" src="/images/post-images/diff-speeding/profile2.png">

Rector is working thru the code in several phases. It applies the rules in a loop, one after another as long as the code changes.
When code stabilizes and the rules no longer refactor it, the loop is aborted.
That's actually a good thing, as each code change by a rule might be interesting for already applied rules which therefore are executed again.

The current rector release re-builds the code-diff between each of these steps again.

I did change that and [made Rector only build the diff once](https://github.com/rectorphp/rector-src/pull/3711/), after all rules have been applied.
This resulted in a nice improvement:

<img width="1144" alt="grafik" src="/images/post-images/diff-speeding/diff2.png">

2 minutes faster then before is actually a great improvement.

`@samsonasik` - [one of the Rector maintainers - reported back](https://twitter.com/samsonasik/status/1652510802170249216) that with this change running Rector on CodeIgniter4 considerably improved.

### Make diffing faster

Next I had a look at the actual diffing within [Pull Request 3705](https://github.com/rectorphp/rector-src/pull/3705).
I tried a lot of stuff. Had to compensate changes on the one end to already existing stuff on different ends.

Finally, I found a state which was 1 minute faster than before. Doing my final quality assurance on the said PR and doing some before/after measurements proved all is fine.
As I was looking at the profiles again it was still surprising that even after I already shaved of 3 minutes of runtime, [the remaining dominator of the profile was still the diffing](https://twitter.com/markusstaab/status/1652925369979215878).

This made me think about looking into the underlying [sebastianbergmann/diff](https://github.com/sebastianbergmann/diff) library.
I realized that the actual slowdown seems to be related to an innocent `max()` function call in `MemoryEfficientLongestCommonSubsequenceCalculator`.
Proving it was pretty easy. Just [replace the `max()` by a small `if`](https://github.com/sebastianbergmann/diff/pull/118) and re-measure the workload:

<img width="524" alt="grafik" src="/images/post-images/diff-speeding/diff3.png">

Tadaa: the whole workload is now equal fast, no matter whether diffing is enabled or not. Starting from the initial 7min 35s we are now down to 3min 20s in a real world project workload.

Since I am curious I decided to hack sebastian/diff so it uses a different algorithm named `TimeEfficientLongestCommonSubsequenceCalculator`.
Measuring the workload again showed, that the previously worked out patch for `MemoryEfficientLongestCommonSubsequenceCalculator` made it even faster then `TimeEfficientLongestCommonSubsequenceCalculator`.

So finally [applying the same `max()` fix to `TimeEfficientLongestCommonSubsequenceCalculator`](https://github.com/sebastianbergmann/diff/pull/119) made it as fast as the alternative algorithm.

## Summary

In the end [sebastian/diff](https://github.com/sebastianbergmann/diff) got a nice perf boost by the work described above.
The fixes are already released and you can easily already benefit from it by updating the dependency to the latest release.
[A lot of Tools use Sebastian Bergmanns diffing library](https://packagist.org/packages/sebastian/diff/dependents?order_by=downloads) e.g. PHPUnit, Psalm, PHP-CS-Fixer, Codeception, ECS,… which now benefit from these changes.

We expect this changes to considerably reduce the amount of energy used in CI pipelines.
So that's my take on saving the planet and don't waste energy.

If you are using above-mentioned tools in projects this should also considerably reduce the wait time for the engineers.
A shorter feedback loop helps developers to stay in focus and work more efficiently.

Chances are high, that you or your company is saving a lot of money with recent releases.
[Please consider supporting my work](https://github.com/sponsors/staabm), so I can make sure open source tools keeps as fast as possible and evolves to the next level.

All this performance work have been developed while holiday of my primary job.



