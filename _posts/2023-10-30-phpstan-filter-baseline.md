---
tags:
    - PHPStan

image: "images/og-images/phpstan-filter-baseline.jpg"

ogImage:
    title: "lost track of your huge PHPStan baseline?"
    subtitle: "filter the baseline to focus on error classes"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "phpstan-filter-baseline"
---

## PHPStan baseline filter

Having a week off from my primary job, means more time for my opensource projects :-).

In this post I will describe one way to work thru the sometimes huge PHPStan baseline.

## Motivation

Not everyone has the luxury to use static analysis from the very start of a project.

When adding PHPStan to a existing project, you usually need to work thru the levels for an initial cleanup.
Oftentimes the initial budget to setup static analysis is not big enough to level up to a point you are happy with.

When running out of budget, I usually try to find a PHPStan config/rule-set,
which makes sure newly implemented code has a pretty high quality barrier.
At the same time this means I need to baseline a lot of errors, because pre-existing code likely does not match these criteria.

Now we need to somehow figure out a way, how and when you want to work thru the remaining errors in the daily job.
The bigger the baseline is, the more important is a good strategy, on which errors you want to work on first.

## Lets go

At first setup [phpstan-baseline-analysis](https://github.com/staabm/phpstan-baseline-analysis#readme) to keep track of the current state of the project.
Using this tool we can analyze the project and get an overview of the current error distribution.
In our projects we generate these numbers in a scheduled GitHub action and create [trend reports for the dev-team](https://github.com/staabm/phpstan-baseline-analysis#example-trend-analysis).

Additionally, you may [create graphs of the progress](https://github.com/staabm/phpstan-baseline-analysis#example-graph-analysis) to have a visual representation.
It can be a good foundation for a conversation with management people, to give an idea where we are and where we are heading.


## Tackle the problem / filter the baseline

Depending on your dev-team focus you might want to work on different PHPStan errors.

Starting with phpstan-baseline-analysis 0.12.4 you can filter the baseline by error classes.
This means we can quickly focus on a certain area of errors.

One common problem in legacy projects is related to invalid PHPDocs.
PHPStan might already be aware of said problems, but since you didn't have the time yet to work on them, these errors are buried in your baseline.

Using the new filtering capabilities you can filter out these problems from your already existing baseline:

```
$ echo "$( phpstan-baseline-filter phpstan-baseline.neon --exclude=Invalid-Phpdocs )" > phpstan-baseline.neon
```

This means, we take the projects baseline run it thru the `phpstan-baseline-filter` and we keep all errors except those matching the `--exclude` filter.

Now you can trigger your regular `phpstan analyze` command which no longer ignores the filtered errors.
That way you can work on the problems as you are used to based on PHPStan result list.

You can use multiple filter keys at once, by separating the keys by comma (`,`) .

Alternatively to `--exclude` you can also use `--include` to filter the baseline, which only outputs the errors matching the filter-key.
This might be useful if you want to further process the filtered error list in a separate tool.

```
$ phpstan-baseline-filter phpstan-baseline.neon --include=Deprecations,Unknown-Types,Anonymous-Variables > result.neon
```

## Filter keys

If you are curious just invoke the tools help command, to get an idea which filter keys are supported.
At the time of writing it looks like:

```
$ phpstan-baseline-filter help

USAGE: phpstan-baseline-filter <GLOB-PATTERN> [--exclude=<FILTER-KEY>,...] [--include=<FILTER-KEY>,...]

valid FILTER-KEYs: Classes-Cognitive-Complexity, Deprecations, Invalid-Phpdocs, Unknown-Types, Anonymous-Variables, Unused-Symbols
```


## Give back

In case you find [my PHPStan contributions](https://github.com/phpstan/phpstan-src/pulls?q=is%3Apr+sort%3Aupdated-desc+author%3Astaabm+is%3Amerged) and/or this content useful, [please consider supporting my open source work](https://github.com/sponsors/staabm).

