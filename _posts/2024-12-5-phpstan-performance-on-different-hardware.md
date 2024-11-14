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
We are running `time make` from within the terminal/console and the project root 5 times. We do so after a fresh bootup and without any other applications running.

#### Running macOS

```
$ php -v
PHP 8.3.13 (cli) (built: Oct 22 2024 18:39:14) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.3.13, Copyright (c) Zend Technologies
```

Apple MacBook M1 Pro (2021), 10‑Core CPU, 1 TB SSD, 32 GB RAM (on full battery)
- 77-85 seconds

Apple MacBook M4 Pro (2024), 14‑Core CPU, 1 TB SSD, 48 GB RAM (on full battery)
- 57-59 seconds

-> In my experience the performance of "on battery" vs. "plugged in" is not that different on a MacBook.

#### Running windows11x64 23H2

```
php -v

```

Lenovo Thinkpad P1 Gen 5, Intel Core i9-12900H, 1 TB SSD, 32 GB RAM (on full battery)
- 115-120 seconds

Lenovo Thinkpad P1 Gen 5, Intel Core i9-12900H, 1 TB SSD, 32 GB RAM (plugged in)
- 110-120 seconds

-> In my experience the performance of "on battery" vs. "plugged in" is not that different on this Thinkpad.

### Support my open source work

In case this article was useful, or you want to honor the effort I put into one of the hundreds of pull-requests to PHPStan, please [considering sponsoring my open-source efforts 💕](https://github.com/sponsors/staabm).
