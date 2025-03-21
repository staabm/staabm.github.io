---
tags:
    - PHPStan

image: "images/og-images/phpstan-performance-on-different-hardware.jpg"

ogImage:
    title: "How much impact has hardware on PHPStan performance?"
    imageUrl: "https://staabm.github.io/staabm.svg"
    fileName: "phpstan-performance-on-different-hardware"
---

### PHPStan performance on different hardware

I recently updated my macbook to the newly released model.
The idea was to get a faster feedback loop when working on complex stuff like PHPStan core itself.

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

MacBook Air M1 (2020), 8‑Core CPU, 16Gb RAM
- 128-140 seconds

Apple MacBook M2 Pro (2023), 12‑Core CPU, 1 TB SSD, 16 GB RAM (plugged in)
- 76-82 seconds

Apple MacBook M2 Pro (2023), 12‑Core CPU, 1 TB SSD, 16 GB RAM (on full battery)
- 75-85 seconds

Apple MacBook M4 Max (2024), 16‑Core CPU, 1 TB SSD, 64 GB RAM (plugged in)
- 59-62 seconds

-> opcache on the CLI does not affect the app, as long as you don't use filebased caching.

#### Running windows11x64 23H2

```
$ php -v
PHP 8.2.12 (cli) (built: Oct 24 2023 21:15:35) (NTS Visual C++ 2019 x64)
Copyright (c) The PHP Group
Zend Engine v4.2.12, Copyright (c) Zend Technologie
```

Lenovo Thinkpad P1 Gen 5, Intel Core i9-12900H, 1 TB SSD, 32 GB RAM (on full battery)
_Microsoft defender XDR hardened_
- 115-120 seconds

Lenovo Thinkpad P1 Gen 5, Intel Core i9-12900H, 1 TB SSD, 32 GB RAM (plugged in)
_Microsoft defender XDR hardened_
- 110-120 seconds

-> In my experience the performance of "on battery" vs. "plugged in" is marginal different on a Thinkpad.

### Closer look at Apple MacBook M4 Pro (2024), 14‑Core CPU, 1 TB SSD, 48 GB RAM

```
$ php -v
PHP 8.3.13 (cli) (built: Oct 22 2024 18:39:14) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.3.13, Copyright (c) Zend Technologies
```

Still on PHPStan@cc4eb92 but looking at the separate `make` targets:

`time make tests`

- 37-45 seconds

`time make phpstan`

- 18-19 seconds

#### M4 Pro (2024), 14‑Core CPU, 1 TB SSD, 48 GB RAM with Microsoft Defender enabled

`time make tests`

- 41-49 seconds

`time make phpstan`

- 19-21 seconds
