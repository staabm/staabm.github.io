---
tags:
- rexstan
- REDAXO
- PHPStan

image: "images/og-images/75th-pull-request-to-php-stan.jpg"

ogImage:
  title: "new project: rexstan"
  subtitle: "rexstan adds PHPStan based code analysis to the REDAXO CMS"
  imageUrl: "https://staabm.github.io/staabm.svg"
---

## [rexstan](https://github.com/FriendsOfREDAXO/rexstan) - PHPStan [REDAXO CMS](https://redaxo.org/) AddOn

`rexstan` adds [PHPStan](https://phpstan.org) based code analysis to the REDAXO CMS improving developer productivity and code quality.

First things first: PHPStan?

> PHPStan focuses on finding errors in your code without actually running it. It catches whole classes of bugs even before you write tests for the code. It moves PHP closer to compiled languages in the sense that the correctness of each line of the code can be checked before you run the actual line.

[Read more about PHPStan in an introductory article »](https://phpstan.org/blog/find-bugs-in-your-code-without-writing-tests)


---

### About REDAXO 

<img width="216" alt="REDAXO CMS Logo" src="https://user-images.githubusercontent.com/120441/174436564-500d7c16-d97b-4ebb-acd2-5b9ea08d1d75.png"> 

The [REDAXO CMS](https://redaxo.org/) is a open source content managment system mainly used from developers in germany.

Its main advantage over other systems in the field is the different approach on building websites.
In contrast to most other systems REDAXO is a kind of microframework which brings a few loosely coupled building blocks.

It is a very minimal system by default but can easily be extended by installing AddOns, depending on your needs.
Because of this bottom-up approach you get a very slim and fast system, which can be customized in nearly every aspect.

The system is usually used by web developers to built a website or web-based tool for the actual customer and their endusers.

### About rexstan

[`rexstan`](https://github.com/FriendsOfREDAXO/rexstan) integrates the well known PHPStan static code analysis engine into REDAXO. Therefore you get static analysis for development of your REDAXO based website and/or AddOns with a single click. `rexstan` is distributed via the REDAXO installer and therefore can be consumed by anyone with a REDAXO 5.x website.

![Screenshots](https://github.com/FriendsOfREDAXO/rexstan/blob/assets/stanscreen.png?raw=true)

[`rexstan`](https://github.com/FriendsOfREDAXO/rexstan) integrates with the [REDAXO Console](Adds code analysis to REDAXO improving developer productivity and code quality.
), the REDAXO WebUI but also describes the [setup with PHPStorm](https://github.com/FriendsOfREDAXO/rexstan/blob/main/README.md#phpstorm) natively.

Additionally `rexstan` provides answers to [frequently asked questions](https://github.com/FriendsOfREDAXO/rexstan/blob/main/FAQ.md) to make it as easy as possible to get started with PHPStan for newcomers.
