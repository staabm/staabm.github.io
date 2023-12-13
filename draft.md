---
tags:
    - Activities

image: "images/og-images/oss-contribs-published.jpg"

ogImage:
    title: "Open source contributions statistics generator"
    subtitle: "Analyse your personal contributions to open source projects"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "oss-contribs-published"
---

In a recent blog post, we had a [look back at 2023](https://staabm.github.io/2023/12/07/contribution-summary-2023.html) and my personal highlights of these open source contributions.

To back up the message of the post, I used some contribution statistics similar to the ones shown below (excerpt):

```
| project                                      | merged pull requests  | addressed issues   |
|----------------------------------------------|-----------------------|--------------------|
| phpstan/phpstan*                             | ~106   (~188 in 2022) | 29    (83 in 2022) |
| rector/rector*                               | ~168                  | 13                 |
| FriendsOfREDAXO/rexstan                      | 86                    | 24                 |
| FriendsOfREDAXO/rexfactor                    | 55                    | 6                  |
| staabm/phpstandba                            | 44  (~300 in 2022)    | 8                  |
| redaxo/redaxo                                | 27   (70 in 2022)     | 4                  |
| TomasVotruba/unused-public                   | 25                    | 1                  |
…
```

These numbers were crunched with a small tool: [staabm/oss-contribs](https://github.com/staabm/oss-contribs)

I just decided to make this tool **available for anyone**, so you can generate your own statistics.

## simple contributions statistics generator

- generates a list of **merged** pull requests in **public** repositories
- generates a list of issues, these pull requests addressed
- generates a count of user reactions on these pull requests and issues

the result is grouped by repository.

Find all the details in the [tools repository README](https://github.com/staabm/oss-contribs/blob/main/README.md).

enjoy.

## Give back

In case you find [my PHPStan contributions](https://github.com/phpstan/phpstan-src/pulls?q=is%3Apr+sort%3Aupdated-desc+author%3Astaabm+is%3Amerged) and/or this tool useful, [please consider supporting my open source work](https://github.com/sponsors/staabm).
