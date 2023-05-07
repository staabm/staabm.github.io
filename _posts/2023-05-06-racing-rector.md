---
tags:
    - Rector
    - performance

image: "images/og-images/racing-rector.jpg"

ogImage:
  title: "The road to the fastest Rector version ever"
  imageUrl: "https://staabm.github.io/staabm.svg"
  fileName: "racing-rector"
---

The next episode of the [PHP performance series](https://staabm.github.io/archive.html#performance):

After bringing a performance boost to PHPStan in [Speedzember](https://staabm.github.io/2022/12/23/phpstan-speedzember.html)
and a side step in [Diff Speeding](https://staabm.github.io/2023/05/01/diff-speeding.html) lets have a look how the fastest Rector version ever was created.

## Kick start

If you are interested in how I start a performance investigation, please read the previous mentioned articles beforehand.
They will give you a idea on how I approach such a task.

### symfony GlobResource

Looking at the profiles of my workload I noticed that Rector had a bottleneck at file IO operations.

_IO means input/output and is a term for operations which read or write data from/to a file, network, database, …_

With this finding in mind I had a closer look at the file-finding stage and saw considerable time was spent there.

The file traversal utilizes [symfony GlobResource class](https://github.com/symfony/symfony/blob/ba94e953df22d7e24915cfbd5479ed415214144f/src/Symfony/Component/Config/Resource/GlobResource.php), and looking into it made me realize that we could re-order some operations.
This means - where possible - I changed the code so file IO was only triggered after all other operations succeeded.

The result is a [~18% performance improvement](https://github.com/symfony/symfony/pull/50087) in symfony GlobResource
which in turn will make a lot of code faster relying on the symfony-config component - obviously even outside of Rector.

<img width="1144" alt="grafik" src="https://user-images.githubusercontent.com/120441/233592449-2844bad8-6217-4ec9-a387-a83bd18a6269.png">

Later on this optimization was mentioned on the symfony blog: [New in Symfony 6.3: Performance Improvements](https://symfony.com/blog/new-in-symfony-6-3-performance-improvements)

### Defer IO

The initial profile revealed a few more small costs, which I worked through with some small pull requests:

- [https://github.com/rectorphp/rector-src/pull/3664](https://github.com/rectorphp/rector-src/pull/3664)
- [https://github.com/rectorphp/rector-src/pull/3649](https://github.com/rectorphp/rector-src/pull/3649)
- [https://github.com/rectorphp/rector-src/pull/3650](https://github.com/rectorphp/rector-src/pull/3650)

Bottom line of these changes is:
- Don't do IO when not necessary
- Try to defer IO when possible
- Do non-IO related stuff before IO related stuff - cheap checks first

File IO is not only expensive but also very unpredictable. Executing the same workload over and over on the same machine can vary a lot.

### Defer type resolving and AST traversal

In a similar fashion as in the paragraph before, there is another class of operations which can be slow in static analysis context.
We are talking about type resolving - e.g. `$scope->getType()` and friends - or AST traversal - e.g. `$nodeFinder->find(…)` or `$nodeTraverser->traverse(…)`.

Examples for this approach can be found in
- [https://github.com/rectorphp/rector-src/pull/3652](https://github.com/rectorphp/rector-src/pull/3652)
- [https://github.com/rectorphp/rector-src/pull/3651](https://github.com/rectorphp/rector-src/pull/3651)
- [https://github.com/rectorphp/rector-src/pull/3654](https://github.com/rectorphp/rector-src/pull/3654)

and some of them were really fruitful:

<img width="724" alt="grafik" src="https://user-images.githubusercontent.com/120441/233792138-5927fd77-916f-4939-9efa-8302647a2cda.png">


## Summary

In the above I described just a few things I had a look at. The sum of all these - and a lot more not mentioned here at all - lead to a really awesome Rector 0.16 release:

[<img width="582" alt="grafik" src="https://user-images.githubusercontent.com/120441/236643238-75083d73-4685-4c1e-a317-3bf7e540cc05.png">](https://twitter.com/VotrubaT/status/1654486734250311680)

Also be aware that not all my changes improve things and some ideas will just be put into the trash-bin after a few hours.
Feel free to [look through the full list](https://github.com/rectorphp/rector-src/pulls?q=is%3Apr+author%3Astaabm+sort%3Aupdated-desc)… not all things I try are successful or land in the project in the end.

💡Tip: Don't apply the above concepts blindly to your code.
Make sure you have evidence with some sort of timing tool (e.g. a profiler) before diving deep into the performance optimizing process.
As you can see in most PRs: oftentimes only a few lines of code need to be tweaked.
The actual challenge is to find those in between a few hundred thousand/million lines of code.

Chances are high, that you or your company is saving a lot of money with recent releases.
[Please consider supporting my work](https://github.com/sponsors/staabm), so I can make sure open source tools keeps as fast as possible and evolves to the next level.
