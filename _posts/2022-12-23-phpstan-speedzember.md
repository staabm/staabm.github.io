---
tags:
    - PHPStan
    - performance

image: "images/og-images/phpstan-speedzember.jpg"

ogImage:
  title: "PHPStan got a speed boost in december"
  imageUrl: "https://staabm.github.io/staabm.svg"
  fileName: "phpstan-speedzember"
---

## PHPStan speedzember

In december I was on vacation from my daily job.
As the whether was either too cold or too rainy to go outside I decided to spend some time on PHPStan.

_This was the first post of the [PHP performance series](https://staabm.github.io/archive.html#performance)._

## Speed it is ⚡️

Since I likely had several hours a day in a row available, I decided to focus on PHPStan's performance issues.

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

<img width="657" alt="grafik" src="/images/post-images/phpstan-speedzember/profile1.png">

Look only for the things which clearly dominate the profile. Usually there are a few functions/methods taking most of the time.
After we have an idea what is slow, lets think about how the logic could be made faster.

I usually try a few quick and dirty changes, and afterwards run the profiling again.
In case these changes lead to a considerable speedup I think about how the fix should be structured and engineered properly.
In case the changes don't lead to a measurable speedup, I will usually discard the changes and try something different.


## Surprising gifts 🎁

People usually find it surprising when a final patch, which changes just a few lines of code can make such a difference.
See for example [`Faster ConstantFloatType->isSuperTypeOf(ConstantFloatType)`](https://github.com/phpstan/phpstan-src/pull/2080).
It is a tiny change resulting in a big speedup for some very specific code snippet.

<img width="715" alt="grafik" src="/images/post-images/phpstan-speedzember/diff1.png">

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

> You want to [look into Rector performance](https://staabm.github.io/2023/05/10/how-to-debug-slow-rector-projects.html) instead?


## PHPStan speedzember 🎄

Working thru existing performance issues revealed a few different things.
Most specific to the code snippet at hand, but a few even more general - e.g. [Windows only issues](https://github.com/phpstan/phpstan-src/pull/2068).

Things which often are visible in profiles are IO related. IO is very unpredictable and can be slow even on fast SSDs.
- [https://github.com/phpstan/phpstan-src/pull/2069](https://github.com/phpstan/phpstan-src/pull/2069)
- [https://github.com/phpstan/phpstan-src/pull/2068](https://github.com/phpstan/phpstan-src/pull/2068)
- [https://github.com/phpstan/phpstan-src/pull/2094](https://github.com/phpstan/phpstan-src/pull/2094)

Most interesting are optimization opportunities within the PHPStan core. These help to speedup the analysis in general:
- [https://github.com/phpstan/phpstan-src/pull/2073](https://github.com/phpstan/phpstan-src/pull/2073)
- [https://github.com/phpstan/phpstan-src/pull/2074](https://github.com/phpstan/phpstan-src/pull/2074)
- [https://github.com/phpstan/phpstan-src/pull/2072](https://github.com/phpstan/phpstan-src/pull/2072)

Especially within the type system improvements help a lot:
- [https://github.com/phpstan/phpstan-src/pull/2081](https://github.com/phpstan/phpstan-src/pull/2081)
- [https://github.com/phpstan/phpstan-src/pull/2080](https://github.com/phpstan/phpstan-src/pull/2080)
- [https://github.com/phpstan/phpstan-src/pull/2083](https://github.com/phpstan/phpstan-src/pull/2083)
- [https://github.com/phpstan/phpstan-src/pull/2086](https://github.com/phpstan/phpstan-src/pull/2086)

PHPStan does a lot of work within the Scope-class which reflects the state of types of the given code at hand.
It decides how the types flow thru the code, and how logic influence the types.
- [https://github.com/phpstan/phpstan-src/pull/2092](https://github.com/phpstan/phpstan-src/pull/2092)
- [https://github.com/phpstan/phpstan-src/pull/2116](https://github.com/phpstan/phpstan-src/pull/2116)
- [https://github.com/phpstan/phpstan-src/pull/2139](https://github.com/phpstan/phpstan-src/pull/2139)

PHPStan implements rules on top of the type system. Reducing calls into the `Scope`-class to a minimal can help keep things fast.
- [https://github.com/phpstan/phpstan-src/pull/2071](https://github.com/phpstan/phpstan-src/pull/2071)
- [https://github.com/phpstan/phpstan-src/pull/2099](https://github.com/phpstan/phpstan-src/pull/2099)
- [https://github.com/phpstan/phpstan-src/pull/2100](https://github.com/phpstan/phpstan-src/pull/2100)
- [https://github.com/phpstan/phpstan-src/pull/2101](https://github.com/phpstan/phpstan-src/pull/2101)
- [https://github.com/phpstan/phpstan-src/pull/2104](https://github.com/phpstan/phpstan-src/pull/2104)
- [https://github.com/phpstan/phpstan-src/pull/2103](https://github.com/phpstan/phpstan-src/pull/2103)
- [https://github.com/phpstan/phpstan-src/pull/2098](https://github.com/phpstan/phpstan-src/pull/2098)
- [https://github.com/phpstan/phpstan-src/pull/2106](https://github.com/phpstan/phpstan-src/pull/2106)

Our internal benchmarks looked pretty good:
<img width="918" alt="grafik" src="/images/post-images/phpstan-speedzember/gh-comment.png">


## The oversized array case

One topic stood out of all the ones mentioned above.
In [the oversized array pull request](https://github.com/phpstan/phpstan-src/pull/2116) I came up with [an idea to improve runtime](https://github.com/phpstan/phpstan-src/pull/2116#issuecomment-1354395469) on files with huge constant arrays (> 256 elements).
[A early prototype](https://twitter.com/markusstaab/status/1604417771416100865) suggested that the basic idea works.

The code went thru a lot of iterations and was re-structured a few times. My initial prototype was implemented as a [NodeVisitor](https://github.com/nikic/PHP-Parser/blob/3182d12b55895a2e71ed6684f9bd5cd13527e94e/lib/PhpParser/NodeVisitor.php),
but lead thru the code review process the code was refactored. My thinking was building this thing based on pure AST would be the only way to make the snippets at hand fast enough.
At some point we even reached a point where all tests went green and one might think the patch would be considered acceptable.

Another batch of review comments later, we saw a different picture.
After I worked thru the feedback, it got clear that we can utilize the existing type-classes to re-model the logic at the PHPStan core.
We made it work for most but a few test cases. For at least 15 hours I tried to make the pull request pass for the few remaining test cases.
I did not succeed though.

Even if I did not talk about losing my motivation to get this PR merged,
[ondrej seemed to realize](https://github.com/phpstan/phpstan-src/pull/2116#issuecomment-1359006986) that it was best to take the state at that time for a last polish.
He refactored the implementation once again, [prepared existing ground](https://github.com/phpstan/phpstan-src/pull/2131) for the coming adjustments and merged the PR.

It was so great to see the PR getting merged, as I invested so much time into it.


## End-user Feedback

In the end all this work only pays off, when it really helps the end-users within their projects.
Whether performance improvements we measured on small reduced snippets also make a difference for the whole project analysis is a different story.

After release we got a lot of positive reports though, which makes me confident that we are on the right track.

<img width="916" alt="grafik" src="/images/post-images/phpstan-speedzember/gh-comments2.png">

<img width="910" alt="grafik" src="/images/post-images/phpstan-speedzember/gh-comments3.png">

<img width="911" alt="grafik" src="/images/post-images/phpstan-speedzember/gh-comments4.png">

## Save the planet; keep people in focus

We expect this changes to considerably reduce the amount of energy used in CI pipelines.
So that's my take on saving the planet and don't waste energy.

If you are using PHPStan in projects this will also [considerably reduce the wait time](https://twitter.com/OndrejMirtes/status/1601514447159578624) for the engineers.
A shorter feedback loop helps developers to stay in focus and work more efficiently.

Chances are high, that you or your company is saving a lot of money with recent releases.
[Please consider supporting my work](https://github.com/sponsors/staabm), so I can make sure PHPStan keeps as fast as possible and evolves to the next level.

All this performance work have been developed while holiday of my primary job.

