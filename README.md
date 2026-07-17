# Date/Time Utilities

A work-in-progress collection of dependency-free JavaScript helpers for parsing, converting, and displaying dates and time values.

This repository is a portfolio snapshot of code written for personal projects. The original utility file is intentionally preserved as authored.

## Included utilities

- `findUnit(unit)` — resolves abbreviated and long-form time units to millisecond values.
- `parseMS(value, unit)` — parses time strings, converts milliseconds to another unit, or returns a time-parts object.
- `getWeekDay(date)` — returns the weekday for a `Date` or `MM/DD`-style string.
- `getMonthName(date)` — returns a month name from a `Date` or month number.
- `toDate(input)` — normalizes supported values and date-component objects to `Date` instances.
- `convertTime(value, source, target, rounding)` — converts between supported units with optional `Math` rounding.

## Examples

```js
parseMS('2d 8h 45m');
// 204300000

convertTime(1, 'day', 'second');
// 86400

getWeekDay('09/26');
// Weekday for September 26 of the current year

getMonthName('9');
// September

toDate({ year: 2026, month: 7, day: 17 });
// Date instance
```

## Status

This is an in-progress source snapshot, not a published npm package. It has no runtime dependencies, build step, or formal public API. Functions currently remain file-local and are not exported as a module.

See the JSDoc comments in [`datetime-utilities.js`](./datetime-utilities.js) for additional usage details.
