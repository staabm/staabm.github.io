---
tags:
    - Activities

image: "images/og-images/oss-contributions-summary-2024.jpg"

ogImage:
    title: "Open source contributions 2024"
    subtitle: "Highlights and summary of 547 pull requests across 80 open-source projects"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "oss-contributions-summary-2024"
---

The year 2024 comes to an end and I want to have a look back at my open source contributions.

Let's have a look at my personal highlights of 547 merged pull requests across 80 open-source projects:
- [A `mixed` type PHPStan journey](https://staabm.github.io/2024/11/26/phpstan-mixed-types.html)
- [`@param-out` implementation](https://phpstan.org/blog/phpstan-1-9-0-with-phpdoc-asserts-list-type#parameter-type-assigned-by-reference) in PHPStan
- [type inference for regular expressions](https://phpstan.org/blog/phpstan-1-12-road-to-phpstan-2-0#general-availability-of-precise-type-inference-for-regular-expressions) in PHPStan, see also [my blog post](https://staabm.github.io/2024/07/05/array-shapes-for-preg-match-matches.html)
- [`@require-extends` and `@require-implements`](https://phpstan.org/writing-php-code/phpdocs-basics#enforcing-class-inheritance-for-interfaces-and-traits) in PHPStan, see also [my blog post](https://staabm.github.io/2024/01/15/phpstan-require-extends-implements.html)
- `non-falsy-string` type in PHPStan, see also [my blog post](https://staabm.github.io/2022/08/11/phpstan-non-falsy-string.html)
- PHPStan `sprintf()`/`sscanf()` type inference, see also [my blog post](https://staabm.github.io/2022/06/23/phpstan-sprintf-sscanf-inference.html)
- Endless pull requests to improve performance and efficiency in PHPStan and Rector
- Hundreds of bug fixes in PHPStan, Rector, PHPUnit, Composer…

In a recent blog post you can in addition find my [current plan for the upcoming months](https://staabm.github.io/2024/11/28/phpstan-php-version-in-scope.html).

The following table shows the distribution of contributions across the different projects I am working on.

| project                                   | merged pull requests  | addressed issues   |
|-------------------------------------------|-----------------------|--------------------|
| phpstan/phpstan*                          | ~234   (~116 in 2022) | 69    (33 in 2023) |
| rector/rector*                            | ~31   (~178 in 2023)  | 2                  |
| FriendsOfREDAXO/rexstan                   | 11                    | -                  |
| staabm/phpstandba                         | 38  (~44 in 2023)     | 8                  |
| staabm/phpstan-todo-by                    | 35  (~33 in 2023)     | 7                  |
| TomasVotruba/unused-public                | 28                    | 1                  |
| staabm/phpstan-baseline-analysis          | 22                    | -                  |
| Roave/BetterReflection                    | 12                    | -                  |
| composer/*                                | 12   (2 in 2023)      | -                  |
| sebastianbergmann/phpunit                 | 37                    | -                  |
| easy-coding-standard/easy-coding-standard | 9                     | 1                  |
| php/doc-en                                | 7                     | -                  |
| thecodingmachine/safe                     | 8                     | -                  |
| sebastianbergmann/exporter                | 5                     | -                  |
| nikic/PHP-Parser                          | 5                     | -                  |
| PHP-CS-Fixer/PHP-CS-Fixer                 | 4                     | -                  |
| easy-coding-standard/easy-coding-standard | 4                     | -                  |
| symfony/symfony                           | 3                     | -                  |
| TomasVotruba/class-leak                   | 3                     | -                  |
| TomasVotruba/type-coverage                | 2                     | -                  |
| infection/infection                       | 2                     | -                  |
| shipmonk-rnd/dead-code-detector           | 2                     | -                  |
| TomasVotruba/cognitive-complexity         | 1                     | -                  |
| vimeo/psalm                               | 1 (1 in 2023)         | 1                  |
| symfony/symfony                           | 1                     | -                  |
| larastan/larastan                         | 1                     | -                  |
| … a lot more                              | -                     | -                  |

_numbers crunched with [staabm/oss-contribs](https://github.com/staabm/oss-contribs)_


### 2025 is just arround the corner

I wish you all the best for the upcoming year. I am looking forward to continue my open source work and I hope you will support me in doing so.

If one of those open source projects is critical for your business, please [consider supporting my work with your sponsoring 💕](https://github.com/sponsors/staabm)
