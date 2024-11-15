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

Let's find out what we can expect when running different hardware.

For the sake of this article we compare running [PHPStan@cc4eb92](https://github.com/phpstan/phpstan-src/commit/cc4eb92285fd8c96e595437cb9c593553bb5e957).
We are running `time make` from within the terminal/console and the project root 5 times. We do so after a fresh boot-up and without any other applications running.
These numbers are not scientific, but give us a rough idea.

#### Running macOS

##### no opcache

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

##### with opcache

```
$ php -v
PHP 8.3.13 (cli) (built: Oct 22 2024 18:39:14) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.3.13, Copyright (c) Zend Technologies
    with Zend OPcache v8.3.13, Copyright (c), by Zend Technologies
```

Apple MacBook M2 Pro (2023), 12‑Core CPU, 1 TB SSD, 16 GB RAM (plugged in)
- 76-82 seconds

Apple MacBook M2 Pro (2023), 12‑Core CPU, 1 TB SSD, 16 GB RAM (on full battery)
- 75-85 seconds

#### Running windows11x64 23H2

```
$ php -v
PHP 8.2.12 (cli) (built: Oct 24 2023 21:15:35) (NTS Visual C++ 2019 x64)
Copyright (c) The PHP Group
Zend Engine v4.2.12, Copyright (c) Zend Technologie
```

Lenovo Thinkpad P1 Gen 5, Intel Core i9-12900H, 1 TB SSD, 32 GB RAM (on full battery)
- 115-120 seconds

Lenovo Thinkpad P1 Gen 5, Intel Core i9-12900H, 1 TB SSD, 32 GB RAM (plugged in)
- 110-120 seconds

-> In my experience the performance of "on battery" vs. "plugged in" is marginal different on a Thinkpad.
