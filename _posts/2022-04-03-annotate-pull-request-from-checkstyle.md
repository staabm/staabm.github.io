---
tags:
- cs2pr


image: "images/og-images/phpstan-dba-static-analysis.jpg"

ogImage:
  title: "Annotate a GitHub Pull Request based on a Checkstyle XML-report within your GitHub Action"
  imageUrl: "https://staabm.github.io/staabm.svg"
---

## cs2pr - GitHub Pull Request annotation

[`cs2pr`](https://github.com/staabm/annotate-pull-request-from-checkstyle) - Annotate a GitHub Pull Request based on a Checkstyle XML-report within your GitHub Action

---

[`cs2pr`](https://github.com/staabm/annotate-pull-request-from-checkstyle) turns checkstyle based XML-Reports into GitHub Pull Request Annotations via the Checks API. This script is meant for use within your GitHub Action.

That means you no longer search thru your GitHub Action logfiles. No need to interpret messages which are formatted differently with every tool. Instead you can focus on your Pull Request, and you don't need to leave the Pull Request area.

![Logs Example](https://github.com/mheap/phpunit-github-actions-printer/blob/master/phpunit-printer-logs.png?raw=true)

![Context Example](https://github.com/mheap/phpunit-github-actions-printer/blob/master/phpunit-printer-context.png?raw=true)
_Images from https://github.com/mheap/phpunit-github-actions-printer_

[DEMO - See how Pull Request warnings/errors are rendered in action](https://github.com/staabm/gh-annotation-example/pull/1/files)


## Usage

see the [GitHub Readme for a in-detail description](https://github.com/staabm/annotate-pull-request-from-checkstyle)
