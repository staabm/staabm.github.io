---
tags:
    - PHPStan

image: "images/og-images/phpstan-performance-on-different-hardware.jpg"

ogImage:
    title: "How much impact has hardware on PHPStan performance?"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "phpstan-performance-on-different-hardware"
---


I recently updated my macbook to the newly released model.
The idea was to get a faster feedback loop when working on complex stuff like PHPStan itself.

### How much impact has hardware on PHPStan performance?

To get an idea what to expect when running different hardware, lets collect some data-points to see how much impact the hardware has on PHPStan performance.

For the sake of this article we compare running [PHPStan@cc4eb92](https://github.com/phpstan/phpstan-src/commit/cc4eb92285fd8c96e595437cb9c593553bb5e957).
We are running `time make` from within the terminal/console and the project root 5 times.

#### Running macOS

```
$ php -v
PHP 8.3.13 (cli) (built: Oct 22 2024 18:39:14) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.3.13, Copyright (c) Zend Technologies
```

Apple MacBook M1 Pro, 10‑Core CPU, 1 TB SSD, 32 GB RAM
- 77-85 seconds

Apple MacBook M4 Pro, 14‑Core CPU, 1 TB SSD, 48 GB RAM
- 57-59 seconds

### Support my open source work

In case this article was useful, or you want to honor the effort I put into one of the hundreds of pull-requests to PHPStan, please [considering sponsoring my open-source efforts 💕](https://github.com/sponsors/staabm).
