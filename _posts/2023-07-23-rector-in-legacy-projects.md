---
tags:
    - Rector

image: "images/og-images/rector-in-legacy-projects.jpg"

ogImage:
  title: "Rector in legacy projects"
  subtitle: "level up type coverage to ease maintenance and find bugs"
  imageUrl: "https://staabm.github.io/staabm.svg"
  fileName: "rector-in-legacy-projects"
---

## Rector in legacy projects

After collecting some experience with introducing Rector to legacy projects,
I want to write down what I have learned along the way.

## Goal

The article describes how to utilize Rector to maximize type coverage of a legacy project.
The more types are defined in the codebase the better the results of your IDE or static analysis tools will be.

This is usually the first thing you should do, before applying more advanced rector code transformations.
Rector can be used in a similar way to apply other [Rules](https://github.com/rectorphp/rector/blob/main/docs/rector_rules_overview.md) or [Rulesets](https://getrector.com/documentation/set-lists).

Additionally more type coverage is a great first step after a PHPStan/Psalm setup, to make sure static analysis can find relevant bugs efficiently.
Otherwise adding types to a old codebase can take a lot of time. Doing it manually is also prone to errors.

## Overall plan

These are the top level steps I try to follow:

1. Setup
   1. make sure you have [PHPStan configured for your project](https://phpstan.org/user-guide/getting-started), at least at level 5.
   2. add [TomasVotruba/type-coverage](https://tomasvotruba.com/blog/how-to-measure-your-type-coverage/) to create type coverage information
   3. create a [PHPStan baseline](https://phpstan.org/blog/phpstans-baseline-feature-lets-you-hold-new-code-to-a-higher-standard) with all existing errors
   4. [analyze your baseline](https://staabm.github.io/2022/07/04/phpstan-baseline-analysis.html), to get an idea of the overall type coverage of the project
2. Preparation
   1. Fix all "Implicit array creation is not allowed - variable ... does not exist" PHPStan errors
   2. Fix all "Variable ... might not be defined" PHPStan errors
2. Adding Types - order is important!
   1. Add return types
   2. Add property types
   3. Add parameter types
3. re-generate and re-analyze your baseline to see the improvements / you might create a [PHPStan baseline trend report](https://github.com/staabm/phpstan-baseline-analysis#example-trend-analysis)

Analysing the baseline is technically not required. Crunching the numbers can help keep a dev team motivated or these can be used to convince management people about your current state and potential goals.

## Setup

The preparation steps and the linked articles in the "overall plan"-chapter should contain all you need.

## Preparation

Fixing the mentioned PHPStan errors to make sure Rector can trust your variables.

## Adding Types with Rector

Start with [Rector as described in the introduction](https://getrector.com/documentation).
Make sure you have all relevant source paths configured and the setup works as expected.

We will run Rector in the command line on your workstation.
Later on you may configure Rector as part of your CI pipeline, but that's a topic for another article.

Working with Rector usually means you start by adding one Rector rule at a time.
Let the tool do its magic and review the generated changes. Make sure you feel confident with them.
If you get overwhelmed by the amount of changes,
revert the working state and run your current Rector rule only against a few paths instead of the whole project.

Repeat using smaller steps as long as you feel the result is not reviewable.
How often you need to divide the steps into smaller ones depends on the rule being applied and your codebase.

Between these steps you should commit the intermediate states. This also eases seeing the actual differences between the steps.

**NOTE:**
Especially in legacy projects its important to make sure rector is not relying on PHPDoc types. This is what `*Strict*` rector rules are for. If you apply non-Strict rector rules, take special care your PHPDoc is precise.

### Add return types

It's important to add return types first, as it's the least risky change and should be backwards compatible most of the time.

- If your codebase is pretty large, you may start with `final` classes first.
- As long as you [don't add new return types to methods which gets overridden in a subclass](https://3v4l.org/I5bh6), you should be fine.
- Give classes some extra attention which somehow integrate with libraries you use, like e.g. Doctrine-Collections.
- If classes implement magic methods (e.g. `__get`), review related changes properly.

If rector changes things you don't like, you may [ignore source files for single rules or even skip the source file completely](https://getrector.com/documentation/ignoring-rules-or-paths).
You can re-visit the skipped cases later again. You may feel more confident after the codebase got enriched with types and PHPStan can better understand the code in question.

I had the most success using the [`ReturnTypeFromStrict*` Rector rules](https://github.com/rectorphp/rector/blob/main/docs/rector_rules_overview.md) first.
Do so one rule at a time, like described above.


### Add property types

In the next step in my experience it's best to add property types.

Start with `private` properties and later move on to `protected` ones of `final` classes.
If you are not sure about nullability, keep using nullable types for now.

Last add types to `protected` properties of non-final classes and `public` properties.

Keep in mind that adding types to public/protected properties to classes which use inheritance can be BC break.
- [https://3v4l.org/IonFf](https://3v4l.org/IonFf)
- [https://3v4l.org/kTQ7q](https://3v4l.org/kTQ7q)

I had the most success using the [`PropertyTypeFromStrict*` Rector rules](https://github.com/rectorphp/rector/blob/main/docs/rector_rules_overview.md) first.
After that try the `TypedPropertyFrom*` rules.


### Add parameter types

Last but not least add parameter types. Be careful, as adding parameter usually breaks backwards compatibility.
That's especially important in case you work on library code, as it might force you to create a new major version.

I had the most success using the [`*ParamType*` Rector rules](https://github.com/rectorphp/rector/blob/main/docs/rector_rules_overview.md).

## Give back

In case you find this content useful, [please consider supporting my open source work](https://github.com/sponsors/staabm).
