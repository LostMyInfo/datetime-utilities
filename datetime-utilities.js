// WIP

const timeRegexShort = /(\d+)\s*(ms|milli(second)?s?|s(ec(ond)?s?)?|m(in(ute)?s?)?|h((ou)?rs?)?|d(ays?)?|w((ee)?ks?)?|mo(nths?)?|y((ea)?rs?)?)/gmi;
const dateRegex = /(?:\b|^)(0?[1-9]|1[0-2])[ -/](0?[1-9]|[12][0-9]|3[01])\b/;

/** @type {Map<RegExp, number>} */
const timeRegexMap = new Map([
  [/^ns$|^nano(?:second)?s?$/i,  -1000000],
  [/^mi(?:cro(?:second)?s?)?$/i,    -1000],
  [/^ms$|^milli(?:second)?s?$/i,        1],
  [/^s(?:ec(?:ond)?s?)?$/i,          1000],
  [/^m(?:in(?:ute)?s?)?$/i,         60000],
  [/^h(?:(?:ou)?rs?)?$/i,         3600000],
  [/^d(?:ays?)?$/i,              86400000],
  [/^w(?:(?:ee)?ks?)?$/i,       604800000],
  [/^mo(?:nths?)?$/i,          2592000000],
  [/^y(?:(?:ea)?rs?)?$/i,     31540000000]
]);


/** @type {Record<'years'|'months'|'weeks'|'days'|'hours'|'minutes'|'seconds'|'milliseconds', TimeUnit>} */
const timeUnits = {
  years:        [31540000000, 1,    'y'],
  months:       [2592000000,  12,   'mo'],
  weeks:        [604800000,   4,    'w'],
  days:         [86400000,    7,    'd'],
  hours:        [3600000,     24,   'h'],
  minutes:      [60000,       60,   'm'],
  seconds:      [1000,        60,   's'],
  milliseconds: [1,          1000,  'ms']
};

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

/* --------- functions --------- */

/**
 * @example
 * findUnit('d');
 * {
 *   regex: /^d(ays?)?$/i,
 *   value: 86400000
 * }
 * @param {string} unit
 * @returns {{regex: RegExp, value: number}}
 */
function findUnit(unit) {
  for (const [regex, value] of timeRegexMap)
    if (regex.test(unit) || regex === unit)
      return { regex, value };

  throw new Error(`"${unit}" is not a valid unit`);
}


/**
 * Convert milliseconds to a time object, or parse a time string to milliseconds.
 *
 * @example
 * parseMS(123123123);        // { timeobject }
 * parseMS(123123123, 'days') // 1.43
 * parseMS('2d 8h 45m')       // 204300000
 *
 * @param {string|number} ms
 * @param {string} [unit]
 * @returns {number|TimeObject}
 * @throws {TypeError} If the input is not a number or timestring.
 */
function parseMS(ms, unit) {
  if (typeof ms === "string") {
    const matches = ms.match(timeRegexShort);

    if (matches) {
      return matches.reduce((total, token) => {
        const value = parseFloat(token);
        const unitMatch = token.match(/[a-zA-Z]+/);

        return unitMatch ? total + value * findUnit(unitMatch[0].toLowerCase()).value : total;
      }, 0);
    }

    ms = parseInt(ms, 10);
  }

  if (!ms) {
    throw new TypeError("Expected a number or timestring");
  }

  if (unit) {
    return parseInt((ms / findUnit(unit).value).toFixed(2), 10);
  }

  return Object.fromEntries(
    Object.entries(timeUnits).map(([key, [value, mod]]) => [
      key,
      Math.trunc(ms / value) % mod,
    ]),
  );
}


/**
 * @example
 * getWeekDay('09/26');
 * getWeekDay(new Date());
 * @param {string | Date} date
 * @returns {string}
 * @throws {TypeError} If the input is not a valid date format.
 */
function getWeekDay(date) {
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return daysOfWeek[date.getDay()];
  }

  if (typeof date !== 'string') {
    throw new TypeError(`Invalid date format: "${date}"`);
  }

  const match = dateRegex.exec(date);
  if (!match) {
    throw new TypeError(`Invalid date format: "${date}"`);
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  const parsedDate = new Date(new Date().getFullYear(), month - 1, day);

  if (parsedDate.getMonth() !== month - 1 || parsedDate.getDate() !== day) {
    throw new TypeError(`Invalid date format: "${date}"`);
  }

  return daysOfWeek[parsedDate.getDay()];
}


/**
 * @example
 * getMonthName(09);
 * getMonthName('9');
 * getMonthName(new Date());
 * @param {string | Date} date
 * @returns {MonthName}
 */
function getMonthName(date) {
  return monthNames[(date instanceof Date
    ? date.getMonth()
    : parseInt(date) - 1
  ) % 12];
}


/**
 * Parses a date input into a JavaScript Date object.
 *
 * @param {Date|string|number|DateComponents} input - The date input.
 * @returns {Date} Parsed Date object.
 * @throws {Error} If the input cannot be parsed.
 */
function toDate(input) {
  if (input instanceof Date) {
    return input;
  }

  if (typeof input === 'string' || typeof input === 'number') {
    const date = new Date(input);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }

    throw new Error('Invalid date format');
  }

  if (input !== null && typeof input === 'object') {
    const { year, month, day, hour = 0, minute = 0, second = 0 } = input;
    const date = new Date(year, month - 1, day, hour, minute, second);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  throw new Error('Invalid date format');
}


/**
 * @example
 * convertTime(1, 'day', 'second')   // 86400
 * convertTime(1, 'd', 's')          // 86400
 * convertTime(1, 'y', 'd')          // 365.046
 * convertTime(1, 'y', 'd', 'floor') // 365
 * convertTime(5, 'm', 's')          // 300
 * @param {number} val
 * @param {string} source
 * @param {...string} options target unit and/or a `Math` method name (e.g. 'floor')
 * @returns {number}
 */
function convertTime(val, source, ...options) {
  let math, targetValue;

  for (const option of options) {
    const mathCandidate = Math[option];
    if (mathCandidate) {
      math = mathCandidate;
      break;
    }
    targetValue = findUnit(option).value;
  }

  const result = (val * findUnit(source).value) / (targetValue ?? findUnit('ms').value);
  return typeof math === 'function' ? math(result) : result;
}



/**
 * @typedef {Object} TimeObject
 * @property {number} years
 * @property {number} months
 * @property {number} weeks
 * @property {number} days
 * @property {number} hours
 * @property {number} minutes
 * @property {number} seconds
 * @property {number} milliseconds
 * @property {number} microseconds
 * @property {number} nanoseconds
 */
 
/**
 * @typedef {Object} DateComponents
 * @property {number} year
 * @property {number} month
 * @property {number} day
 * @property {number} [hour=0]
 * @property {number} [minute=0]
 * @property {number} [second=0]
 */
 
/**
 * @typedef {[number, number, string]} TimeUnit
 */