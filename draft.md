---
tags:
    - PHPStan

image: "images/og-images/oss-contributions-summary-2023.jpg"

ogImage:
    title: "Open source contributions"
    subtitle: "Highlights and summary of 2023"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "oss-contributions-summary-2023"
---

The year 2023 comes to an end and I want to have a look back at my open source contributions.

To be honest: The main motivation for this post is getting awareness for all the open source work I am doing in my freetime.
I am spending 20-40 hours per month and I would love 💕 to even reduce hours on my primary job to support the open source community even more.

This will only be possible when more people [support my open source work by becoming a sponsor](https://github.com/sponsors/staabm).

## Intro

At first, lets have a look back at 2022 in which I was able create 967 pull requests, of which 831 got merged.
In comparison, at the time of writing I created 830 pull requests in 2023, of which 686 got merged.

As you can see the numbers in 2022, are a bit lower than in 2023. I think this is due to the fact that last year I was focused on working thru low hanging fruits in PHPStan and Rector.
With the experience and knowledge I gained while working on these projects, I was able to contribute more advanced features and fixes this year.

Lets have a closer look at my personal highlight of 2023.

### phpstan-dba Highlight

[phpstan-dba is one PHPStan extensions](https://github.com/staabm/phpstan-dba) which got a bit of traction in 2023.
Its a PHPStan based SQL static analysis and type inference for the database access layer.

I was even keen enough to talk about it at the PHPUGFFM usergroup and the unKonf Barcamp.
See the [slides of said talk](https://staabm.github.io/talks/phpstan-dba@phpugffm) if you are curious.


### Rector Highlight: "Implement a max jobs per worker budget"

Running Rector on huge projects in a single run was not possible in the past. After [implementing process and memory managment](https://github.com/rectorphp/rector-src/pull/4965) this is a problem of the past.
Even huge projects like [the Mautic codebase can be refactored with Rector now](https://twitter.com/markusstaab/status/1700507324639588597).


### Highlight: Performance improvements

As a regular reader of my blog you already know, that I have spent a few months across different well known projects to improve their performance.
This includes PHPStan, PHPUnit, Rector and more. All the details can be found in separate [Blog posts of my performance series](https://staabm.github.io/archive.html#performance).

As a result of this work, a [summary of these performance work and my vita](https://blog.blackfire.io/meeting-markus-staab-crafting-a-more-performant-open-source-landscape-with-blackfire.html) was published on the blackfire.io Blog.


### PHPStan Highlight: Improved developer experience for the result cache

The PHPStan result cache is a key piece for fast feedback loops. Why, how it works and how to debug problems with it was described in [this blog post](https://staabm.github.io/2023/10/21/phpstan-result-cache-gotchas.html).
I have dumbed everything I know about it into this article.


### PHPStan Highlight: Support for array shape covariance

One of the craziest contributions this year. After days of in-depth analysis finally [a one line fix](https://github.com/phpstan/phpstan-src/pull/2655) resulted in fixing 5 bugs.

![grafik](https://github.com/phpstan/phpstan-src/assets/120441/620c4c70-5ba0-4d6b-9090-40c5cc9f59aa)


### PHPStan Highlight: "Fix !isset() with Variable"

As highlighted in [various](https://twitter.com/markusstaab/status/1729523854383497533) [tweets](https://twitter.com/markusstaab/status/1730509736108282344) working on falsey-context type inference improvements in PHPStan.
This was my most time consuming and most rewarding contribution this year.
It took me several tries to finally get it into a mergable state - this [very first iteration](https://github.com/phpstan/phpstan-src/pull/2710) closed 7 bugs, the oldest of them dating back to Jul 2020.

The main problem this contributions solves is, that PHPStan gets aware when/if variables are defined after a `!isset($variable)` check.
To get this right, one needs to check whether the involved variables can get `null` and whether they are defined in the current scope.
Most interessting is the case where we figured out that a variable which can never be `null`, also means that [it can never be defined in the falsey-context](https://phpstan.org/r/44fbea2a-6f3c-4231-a985-bc5994664937).

Getting this right addtionally means that PHPStan gets smarter for the `!empty($variable)`-case and the null coallescing operator `??`.



### 2024 here we come

I wish you all the best for the upcoming year. I am looking forward to continue my open source work and I hope you will support me in doing so.

If one of those open source projects is critical for your business, please [consider supporting my work with your sponsoring 💕](https://github.com/sponsors/staabm)
