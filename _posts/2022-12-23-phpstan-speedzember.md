---
tags:
- PHPStan

image: "images/og-images/phpstan-speedzember.png"

ogImage:
  title: "PHPStan got a speed boost in december"
  imageUrl: "https://staabm.github.io/staabm.svg"
  fileName: "phpstan-speedzember"
---

In december I was on vacation from my daily job.
As the weather was either too cold or too rainy to go outside I decided to spend some time on PHPStan.

## Speed it is ⚡️

Since it was likely I had several hours a day in a row available, I decided to focus on PHPStan's performance issues.

So the first step was to find code snippets which are slow with the current PHPStan version.
Since Ondrej is doing a great job in issue triage, that was rather ease - just look for [the `performance` label](https://github.com/phpstan/phpstan/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Aperformance).

Next step is to run your profiling tool of choice against the reproducing code snippet mentioned in these issues.
I used [Blackfire](https://blackfire.io/) for this.

1. make sure your profile tooling setup works 
1. take code from snippet
1. put code into a `bug-$issueNumber.php` file
1. run `blackfire run php bin/phpstan analyze bug-$issueNumber.php --debug` - we use `--debug` to make sure the PHPStan result cache is not used.

After that you can open the profile in your browser and start digging into the results.
Watching these profiles needs a bit of practice, but you will get better over time.

<img width="657" alt="grafik" src="https://user-images.githubusercontent.com/120441/208893476-e7d44943-201f-44cf-a662-e66ffba16a84.png">

Look only for the things which clearly dominate the profile. Usually there are a few functions/methods taking most of the time.
After we have an idea what is slow, lets think about how the logic could be made faster.

I usually try a few quick and dirty changes, and afterwards running the profiling again.
In case these changes lead to a considerable speedup I think about how the fix should be structured and engineered properly.
In case the changes don't lead to a measurable speedup, I will usually discard the changes and try something different.

## Surprising gifts 🎁

People usually find it surprising when a final patch, which changes just a few lines of code can make such a difference. 
See for example [`Faster ConstantFloatType->isSuperTypeOf(ConstantFloatType)`](https://github.com/phpstan/phpstan-src/pull/2080).
It is a tiny change resulting in a big speedup for some very specific code snippet.

The actual code changes are easy to grasp… the hard part is to identify which lines to change.
Usually it takes a few hours of trial and error, watching profiles, or thinking about it while going out for a walk.
It is pretty normal, that I think about a problem for a few days, and then suddenly I have an idea how to solve it.

In other words: You don't see at all how much time went into a pull request.
Most of the time it is even the other way around: the simpler a solution is, the more time it took to engineer it.

## How to find slow files in my project?

You should have an idea when running PHPStan across your project, which files consume the most time to analyse.
It happens that analyzing a project containing thousands or even millions of files, contain a handful of files which take 70-80% of the analysis time.

In case you want to get an idea how PHPStan is measing your project, [have a look at this great small writeup](https://gist.github.com/ruudk/41897eb59ff497b271fc9fa3c7d5fb27) of [Ruud Kamphuis](https://gist.github.com/ruudk).
If you find stuff which is slow, try to reduce it as much as you can. Just make sure the performance characteristics of the code don't change.
[Open a issue on PHPStan](https://github.com/phpstan/phpstan/issues) so we can investigate what can be done about it.

## PHPStan speedzember 🎄

Working thru existing performance issues revealed a few different things.
Most specific to the code snippet at hand, but a few even more general - e.g. [Windows only issues](https://github.com/phpstan/phpstan-src/pull/2068).

Things which often are visible in profiles are IO related. IO is very unpredictable and can be slow even on fast SSDs.
- https://github.com/phpstan/phpstan-src/pull/2069
- https://github.com/phpstan/phpstan-src/pull/2068
- https://github.com/phpstan/phpstan-src/pull/2094

Most interesting are optimization opportunities within the PHPStan core. These help to speedup the analysis in general:
- https://github.com/phpstan/phpstan-src/pull/2073
- https://github.com/phpstan/phpstan-src/pull/2074
- https://github.com/phpstan/phpstan-src/pull/2072

Especially within the type system improvements help a lot:
- https://github.com/phpstan/phpstan-src/pull/2081
- https://github.com/phpstan/phpstan-src/pull/2080
- https://github.com/phpstan/phpstan-src/pull/2083
- https://github.com/phpstan/phpstan-src/pull/2086

PHPStan does a lot of work within the Scope-class which reflects the state of types of the given code at hand.
It decides how the types flow thru the code, and how logic influence the types.
- https://github.com/phpstan/phpstan-src/pull/2092
- https://github.com/phpstan/phpstan-src/pull/2116

PHPStan implements rules on top of the type system. Reducing calls into the `Scope`-class to a minimal can help keep things fast.
- https://github.com/phpstan/phpstan-src/pull/2071
- https://github.com/phpstan/phpstan-src/pull/2099
- https://github.com/phpstan/phpstan-src/pull/2100
- https://github.com/phpstan/phpstan-src/pull/2101
- https://github.com/phpstan/phpstan-src/pull/2104
- https://github.com/phpstan/phpstan-src/pull/2103
- https://github.com/phpstan/phpstan-src/pull/2098
- https://github.com/phpstan/phpstan-src/pull/2106

Our internal benchmarks looked pretty good:
<img width="918" alt="grafik" src="https://user-images.githubusercontent.com/120441/208891903-d7ccc2e5-32aa-442b-ab2a-845cde12e99d.png">

## End-user Feedback

In the end all this work only pays off, when it really helps the end-users within their projects.
Whether performance improvements we measured on small reduced snippets also make a difference for the whole project analysis is a different story.

After release we got a lot of positive reports though, which makes me confident that we are on the right track.

<img width="916" alt="grafik" src="https://user-images.githubusercontent.com/120441/208891496-abcf01ac-a86a-4b97-8e91-efd26292ad45.png">

<img width="910" alt="grafik" src="https://user-images.githubusercontent.com/120441/208891732-fbe8dbbf-d6c9-4c26-bff6-26e1121cdd82.png">

<img width="911" alt="grafik" src="https://user-images.githubusercontent.com/120441/208892101-bb9ba37d-21f6-4fd5-9c6c-13b64a10ce95.png">
