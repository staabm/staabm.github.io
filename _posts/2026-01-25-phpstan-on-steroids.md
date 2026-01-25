---
tags:
    - PHPStan
    - Performance

image: "images/og-images/phpstan-on-steroids.jpg"

ogImage:
    title: "PHPStan on steroids"
    subtitle: "performance on a new level"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "phpstan-on-steroids"
---

## PHPStan on steroids

[Similar to last year](https://staabm.github.io/2022/12/23/phpstan-speedzember.html), while on vacation of my primary job I focused my open source efforts on improving PHPStan performance.

_You might also be interested in other articles of this [PHP performance series](https://staabm.github.io/archive.html#performance)._

I teamed up with [Ondřej Mirtes](https://github.com/ondrejmirtes) - the creator of PHPStan - in deep analyzing several PHPStan use-cases.
We identified and discussed several potential performance opportunities which resulted in lots of performance oriented changes.

We turned around every stone in the codebase and looked through all PHPStan components to make it as efficient as it can get.
It took us ~6 weeks of collaboration which lead us to [PHPStan 2.1.34](https://github.com/phpstan/phpstan/releases/tag/2.1.34) - a release loaded with patches aimed for speeding it up.
I was able to contribute ~100 pull requests alone - not counting the changes Ondřej worked on at the same time.

Our internal "reference benchmark" improved by ~50% in runtime. Running this version pre-release on a few codebases suggested real world projects should see 25 % to 40 % faster analysis times.
In the related [release discussion](https://github.com/phpstan/phpstan/discussions/13976) we asked our users how they experience the new version.
We are happy to see our end-users can reproduce the improvements on real world projects. People report improvements of 8% - 40%.

We would love to see your raw performance numbers - [please share them with us](https://github.com/phpstan/phpstan/discussions/13976#new_comment_form).


## PHPStan loves InfectionPHP

Another focus of this work was reducing bootstrap overhead so running the PHPStan integration while [mutating testing with InfectionPHP](https://staabm.github.io/2025/08/01/infection-php-mutation-testing.html) gets faster.
This area was mostly IO oriented, because when analyzing only few files of a mutation the overall time was dominated by reading and ast-parsing files, and loading the configuration.

In our reference mutation testing example, we measured 70% less files being read/analyzed and the PHPStan invocation got ~40 % faster.


## Known problems

We are aware that after the 2.1.34 release analyzing files require more memory.
After a few experiments we already got ideas on how we can improve on it.
This will be explored in upcoming releases. Stay tuned.


## Saving resource all over the world

We expect this changes to considerably reduce the amount of energy used in CI pipelines.

If you are using PHPStan in projects this will also [considerably reduce the wait time](https://twitter.com/OndrejMirtes/status/1601514447159578624) for the engineers.
A shorter feedback loop helps developers to stay in focus and work more efficiently.

Nowadays, this can be especially important when paired with AI tooling workflows,
which can be particular slow and/or produce big amounts source code changes containing bugs which are hard to catch by the human eye.

Chances are high, that you or your company is saving a lot of money with recent releases.
[Please consider supporting my work](https://github.com/sponsors/staabm), so I can make sure PHPStan keeps as fast as possible and evolves to the next level.

All this performance work have been developed while holiday of my primary job.
