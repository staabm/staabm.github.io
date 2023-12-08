---
tags:
    - Activities

image: "images/og-images/oss-contributions-summary-2023.jpg"

ogImage:
    title: "Open source contributions 2023"
    subtitle: "Highlights and summary of 830 OSS pull requests"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "oss-contributions-summary-2023"
---

The year 2023 comes to an end and I want to have a look back at my open source contributions.

To be honest: The main motivation for this post is getting awareness for all the open source work happening in my free time.
I am spending 20-40 hours per month and would love 💕 to even reduce hours on my primary job to support the open source community even more.

This will only be possible when more people [support my open source work by becoming a sponsor](https://github.com/sponsors/staabm).

## Intro

At first, lets have a [look back at 2022](https://staabm.github.io/2022/12/20/2022-wrap-up.html): I was able create 967 pull requests, of which 831 got merged.
In comparison, at the time of writing I created [830 pull requests to 65 open-source repositories in 2023](github.com/pulls?q=is%3Apr+author%3Astaabm+created%3A2023), of which 686 got merged.

As you can see the numbers in 2022, are a bit lower than in 2023. I think this is due to the fact that last year the focus was on working through low-hanging fruits in PHPStan and Rector.
With the experience and knowledge gained while working on these projects, I was able to contribute more advanced features and fixes this year.

The following table shows the distribution of contributions across the different projects I am working on.

| Project                                      | merged Pull Requests  | Addressed issues   |
|----------------------------------------------|-----------------------|--------------------|
| phpstan/phpstan*                             | ~106   (~188 in 2022) | 29    (83 in 2022) |
| rector/rector*                               | ~168                  | 13                 |
| FriendsOfREDAXO/rexstan                      | 86                    | 24                 |
| FriendsOfREDAXO/rexfactor                    | 55                    | 6                  |
| staabm/phpstandba                            | 44  (~300 in 2022)    | 8                  |
| redaxo/redaxo                                | 27   (70 in 2022)     | 4                  |
| TomasVotruba/unused-public                   | 25                    | 1                  |
| OskarStark/doctor-rst                        | 12                    | -                  |
| easy-coding-standard/easy-coding-standard    | 9                     | 1                  |
| staabm/annotate-pull-request-from-checkstyle | 8                     | -                  |
| PHP-CS-Fixer/PHP-CS-Fixer                    | 4                     | -                  |
| Roave/BetterReflection                       | 4                     | -                  |
| symfony/symfony                              | 3                     | -                  |
| qossmic/deptrac                              | 3                     | -                  |
| TomasVotruba/bladestan                       | 3                     | -                  |
| composer/composer                            | 2   (7 in 2022)       | -                  |
| sebastianbergmann/diff                       | 2                     | -                  |
| TomasVotruba/type-coverage                   | 2                     | -                  |
| vimeo/psalm                                  | 1 (4 in 2022)         | -                  |
| mautic/mautic                                | 1                     | -                  |
| TomasVotruba/cognitive-complexity            | 1                     | -                  |
| matomo-org/matomo                            | 1                     | -                  |
| nette/utils                                  | 1                     | -                  |
| nikic/PHP-Parser                             | 1                     | -                  |
| briannesbitt/Carbon                          | 1                     | -                  |
| doctrine/orm                                 | 1                     | -                  |
| … a lot more                                 | -                     | -                  |

_numbers crunched with [staabm/oss-contribs](https://github.com/staabm/oss-contribs)_

Additionally, to sourcecode contributions I also took the to time to blog about my work.
In these 8 posts, I try to explain what I did, how problems have been approached and what I have learned along the way.
That way I hope to inspire others to contribute to open source as well and share their journey.

If you don't want to miss my articles, consider subscribing to my [RSS feed](https://staabm.github.io/feed.xml), [follow me on Twitter](https://twitter.com/markusstaab) or [mastodon](https://phpc.social/@markusstaab).

### Highlights 2023

Lets have a closer look at my personal highlights of 2023.


#### PHPStan Highlight: Improved developer experience for the result cache

The PHPStan result cache is a key piece for a fast feedback loop. Why, how it works and how to debug problems with it was described in [this blog post](https://staabm.github.io/2023/10/21/phpstan-result-cache-gotchas.html).
I have dumbed everything I know about it into this article.


#### Highlight: rexstan & rexfactor

In june 2022 the first version of [rexstan](https://github.com/FriendsOfREDAXO/rexstan), a PHPStan backed [REDAXO CMS](https://redaxo.org/) Addon was released.
Its open source from day 1 and supports developers working with REDAXO every day.

Since then I was able to publish 147 releases - what a ride.


Similar to rexstan, [rexfactor](https://github.com/FriendsOfREDAXO/rexfactor) is a new [REDAXO CMS](https://redaxo.org/) Addon. It's backed by Rector and helps developers to migrate their codebase to newer REDAXO versions.
Its open source from day 1 and was first released in March 2023.

The Addon allows using Rector with a simple web UI. Pick your rule/rule-set, define the target source code and get a nice preview of the changes.
Push the "Apply" button and the changes are applied to your codebase.


#### Highlight Podcast: "Könnte kaputt sein – Statische Code-Analyse mit Markus Staab"

Got [interviewed by the Super Duper Developers Club](https://superdev.club/podcasts/statische-code-analyse-mit-markus-staab/) about my open source work (German).

<img src="https://github.com/FriendsOfREDAXO/rexfactor/assets/120441/ca21fb03-7d2e-4532-b34c-89887c6f13cf">


#### Rector Highlight: "Implement a max jobs per worker budget"

Running Rector on huge projects in a single run was not possible in the past. After [implementing process and memory managment](https://github.com/rectorphp/rector-src/pull/4965) this is a fixed problem.
Even huge projects like [the Mautic codebase can be refactored with Rector now](https://twitter.com/markusstaab/status/1700507324639588597) without out-of-memory issues.

<img width="853" alt="grafik" src="https://github.com/rectorphp/rector-src/assets/120441/0f7b2448-4565-41bf-8d1b-897abfcad954">


#### Highlight: phpstan-dba

[phpstan-dba is one of my PHPStan extensions](https://github.com/staabm/phpstan-dba) which got a bit of traction in 2023.
It's a PHPStan based SQL static analysis and type inference for the database access layer.

I was even keen enough to talk about it at the PHPUGFFM usergroup and the unKonf Barcamp.
See the [slides of said talk](https://staabm.github.io/talks/phpstan-dba@phpugffm) if you are curious.



#### Highlight: Performance improvements

As a regular reader of my blog you already know, that I have spent a few months across different well known projects to improve their performance.
This includes PHPStan, PHPUnit, Symfony, Rector and more. All the details can be found in separate [posts of my performance series](https://staabm.github.io/archive.html#performance).

##### blackfire.io Story

A [summary of these performance work and my vita](https://blog.blackfire.io/meeting-markus-staab-crafting-a-more-performant-open-source-landscape-with-blackfire.html) was published on the blackfire.io Blog.



#### PHPStan Highlight: Support for array shape covariance

One of the craziest contributions this year. After days of in-depth analysis finally [a one line fix](https://github.com/phpstan/phpstan-src/pull/2655) resulted in fixing 5 bugs.

<img src="https://github.com/phpstan/phpstan-src/assets/120441/620c4c70-5ba0-4d6b-9090-40c5cc9f59aa" >



#### PHPStan Highlight: "Fix !isset() with Variable"

As highlighted in [various](https://twitter.com/markusstaab/status/1729523854383497533) [tweets](https://twitter.com/markusstaab/status/1730509736108282344) working on falsey-context type inference improvements in PHPStan.
This was my most time-consuming and most rewarding contribution this year.
It took me several tries to finally get it into a mergable state - this [very first iteration](https://github.com/phpstan/phpstan-src/pull/2710) closed 7 bugs, the oldest of them dating back to Jul 2020.

The main problem this contribution solves is, that PHPStan gets aware when/if variables are defined after a `!isset($variable)` check.
To get this right, one needs to check whether the involved variables can get `null` and whether they are defined in the current scope.
Most interesting is the case where we figured out that a variable which can never be `null`, also means that [it can never be defined in the falsey-context](https://phpstan.org/r/44fbea2a-6f3c-4231-a985-bc5994664937).

```php
<?php declare(strict_types = 1);

class HelloWorld
{
	public function sayHello(): void
	{
		$x = 'hello';
		if (rand(0,1)) {
			$x = 'world';
		}

		if (isset($x)) {
			echo $x;
		} else {
			echo $x; // Undefined variable: $x
		}
	}
}
```

Getting this right additionally means that PHPStan gets smarter for the `!empty($variable)`-case and the null coallescing operator `??`.

I have plans to work on `!isset($array['offset'])` and `!isset($object->property)` improvements in 2024.

### 2024 here we come

I wish you all the best for the upcoming year. I am looking forward to continue my open source work and I hope you will support me in doing so.

If one of those open source projects is critical for your business, please [consider supporting my work with your sponsoring 💕](https://github.com/sponsors/staabm)
