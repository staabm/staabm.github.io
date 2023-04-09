---
tags:
    - rexfactor
    - REDAXO
    - PHPStan
    - Rector


image: "images/og-images/rexfactor-introduction.jpg"

ogImage:
  title: "Automated code migrations of your REDAXO AddOns using rexfactor"
  imageUrl: "https://staabm.github.io/staabm.svg"
  fileName: "rexfactor-introduction"
---

After bringing [static code analysis to REDAXO CMS with rexstan](https://staabm.github.io/2022/06/18/rexstan-REDAXO-AddOn.html) lets take a look at the next logical step

## Automated code migrations with rexfactor

The `rexfactor` AddOn integrates [rector](https://github.com/rectorphp/rector) with the developer UX in mind, meaning it eases use for often needed use-cases.
Primary purpose is to allow people less experienced with developer tooling to automate manual and error-prone code migration tasks.

As usual the REDAXO CMS AddOn is available thru [the REDAXO Installer and can be installed in a few clicks](https://redaxo.org/doku/main/installer).
The idea is to use `rexfactor` in your local development environment.

Using a simple 4 step wizzard right from your REDAXO web UI its just a matter of a few clicks.

1. select the AddOn you want to upgrade

    <img width="910" alt="Step 1: AddOn selector in the REDAXO Backend" src="https://user-images.githubusercontent.com/120441/230765277-846af6a0-5f4d-4fe2-be7d-780c3fb71758.png">
2. select the migration use-case

    <img width="910" alt="Step 2: Migration use-case selector in the REDAXO Backend" src="https://user-images.githubusercontent.com/120441/230765344-7be5546d-725c-4dd6-8178-89627dfb76b3.png">
3. get a rich inline preview diff of suggested changes for you to review and confirm

    <img width="910" alt="Step 3: Preview Diff" src="https://user-images.githubusercontent.com/120441/230765378-e0113cef-08dc-4ff2-b41d-857929986593.png">
4. done

In case you are working with the `project` or `theme` AddOn to manage your projects' sources in files, you might even use this workflow to upgrade your project itself.

## Migration use-cases

Starting with the first version published version a bunch of use-cases are already available:

- `PHP Version Migrations`: helps migrate your source according to the official php.net migration guides
- `Unify Code Quality:` ensures code in your project adheres to the coding standards and best practices
- `Remove Dead Code:` identifying and removing code that is no longer used
- `Infer Type Declarations:` infer native return-types or parameter-types of methods&functions to improve type coverage
- `Reduce Symbol Visibility (Privatization):` reduce the visibility of symbols in the codebase to ease future refactoring and reduce the chance of unintended use
- `Use Early Returns:` reduce complexity by using early returns

### PHPUnit Version Migrations:

This use cases involve updating the version of PHPUnit used in a project to a newer one. This can involve migrating test code to be compatible with the new version and updating any deprecated features to the recommended replacements.

### Improve Test-Code Quality:

This use cases involve improving the quality of test code by making it more maintainable, readable, and efficient. This can include refactoring existing test code to follow best practices, removing duplication, and improving the structure of test suites.

### Misc

- `REDAXO Specific Code Style:` ensures that code follows the [REDAXO code style guidelines](https://github.com/redaxo/php-cs-fixer-config)
- `More Explicit Coding Style:` ensures that code is expressed in a more explicit and clear manner


## Support rexfactor development

Chances are high, that you or your company is saving a lot of time and money with help of rexfactor.
[Please consider supporting my work](https://github.com/sponsors/staabm), so I can make sure rexfactor can help you automate as much manual and error-prone tasks as possible.

The AddOn was [created as a surprise for the REDAXO Tag in Bozen](https://redaxo.org/cms/news/redaxo-community-trifft-sich-in-bozen-austausch%2C-workshops-und-neue-tools-zur-verbesserung-von-code-qualitaet/) and is maintained in my free time for the lovely REDAXO community.
