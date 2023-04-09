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

After bringing [static code analysis to REDAXO CMS with rexstan](https://staabm.github.io/2022/06/18/rexstan-REDAXO-AddOn.html) lets take a look at the next step:

## Automated code migrations with rexfactor REDAXO AddOn

As usual, `rexfactor` is a REDAXO CMS AddOn available thru the REDAXO Installer and can be installed in a few clicks.

The AddOn integrates [rector](https://github.com/rectorphp/rector) with the developer in mind, meaning it eases use for often used migration/upgrade use-cases.
Primary purpose is to allow people less experienced with developer tooling to automate migration tasks.

Using a simple 4 step wizzard you can automate tedious manual tasks to upgrade your own AddOns source code.
1) select the AddOn you want to upgrade
2) select the migration use-case
3) get a rich inline preview diff of suggested changes for you to review and confirm
4) done

In case you are working with the `project` or `theme` AddOn to manage your projects' sources in files, you might even use this workflow to upgrade your project itself.

## Migration use-cases

Starting with the first version published version a bunch of use-cases are already available:

- `PHP Version Migrations`: helps updating the PHP version according to the official php.net migration guide
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




