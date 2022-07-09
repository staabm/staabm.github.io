---
tags:
- PHPStan

image: "images/og-images/phpstan-monorepo-result-cache.jpg"

ogImage:
  title: "PHPStan result caching in a monorepo"
  subtitle: "scanning several project is no longer slow"
  imageUrl: "https://staabm.github.io/staabm.svg"
  filename: "phpstan-monorepo-result-cache"
---

I worked on improvements to the PHPStan result cache recently.

## How does the PHPStan result cache work?

On a first analyze run, PHPstan builds and stores a [result cache](https://phpstan.org/user-guide/result-cache) which allows for faster subsequent runs. When analyzing a codebase after the result cache is available, PHPStan can determine which files changed and which files are affected by this change.

Because of the smart result cache, [you should always analyze your whole project](https://phpstan.org/blog/why-you-should-always-analyse-whole-project).

## PHPStan result cache not used

For a few years we use PHPStan in our GitHub Action based continuous integration (CI) pipeline at work.
Since our projects grow in size every day, scanning the codebase on every commit got slower and slower.

At the time of writing the GitHub Action PHPStan job runs roughly 2 minutes.

I am working on the PHPStan project nearly on a daily basis but until today did not yet realize that our CI jobs are running so long... for some reason PHPStan does not use its result cache - even though we were persisting the results cache folder between runs.

After doing a few tests locally, I came to the conclusion that at the time of writing PHPStan only manages a single result cache.
We are using PHPStan in a monorepo setup, in which we have several phpstan.neon configuration files.
Since we are running several PHPStan processes within a single CI run, the cache gets overwritten over and over again,
but is never restored and utilized.

If you are interested - I described the underlying problem in [more detail in PHPStan issue #7517](https://github.com/phpstan/phpstan/issues/7517).


### Sounds interesting... does it also affect me?

When working on a project which uses several PHPStan configuration files, for which you invoke `phpstan` in a CI job,
chances are high you are also affected by that problem.

Another scenario where you might hit this problem is a classical shared CI server setup, where several projects run CI jobs in a single non-isolated environment.

The most common case is a workstation, where several projects are developed. As soon as you jump between projects PHPStan needs to rebuild the cache from scratch.

In such mentioned cases, until PHPStan 1.8.1 you had to define a [`tmpDir`](https://phpstan.org/config-reference#caching) or `resultCachePath` per PHPStan configuration beeing used.


### Working on a fix

After reporting the problem, Ondrej pointed me to an already existing and known issue, in which we [discussed how to proceed](https://github.com/phpstan/phpstan/issues/7379#issuecomment-1164140188).

I have [submitted a fix in pull request #1469](https://github.com/phpstan/phpstan-src/pull/1469), which allows PHPStan to store several result caches.
After the usual review process, I realized the already existing functionality was not yet covered by tests.
Therefore, [another pull request increasing test coverage was submitted](https://github.com/phpstan/phpstan-src/pull/1475) to make sure we don't regress existing functionality with the planned changes.


### What to expect

In our setup CI job runtimes improved a lot. While we saw 2 minutes and more before the fix, most of the time is now spent in setting up the GitHub Action.
Since then the actual scanning of PHPStan takes only a few seconds, and the job itself finishes in roughly 30 seconds.

Running PHPStan on the local development workstation is now a matter of a few seconds, where it took 2-3 minutes before the fix. I am really happy with the result, so we can stay focused while the tools are covering our back.
