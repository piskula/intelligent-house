## Backend part of [Intelligent house](https://github.com/piskula/intelligent-house-android) application

This repository contains back-end parts for my Intelligent house Android app. It consists of two main parts:

- Raspberry [scripts](/raspberry_scripts): these scripts run automatically on [Raspberry Pi](https://www.raspberrypi.org/) and send data periodically to [Firebase DB](https://firebase.google.com)
- Firebase [functions](/functions): these triggered functions handle:
  1. adding timestamps to data, which come to DB
  2. removes old data, if necessary
  3. send notifications to devices in special cases
