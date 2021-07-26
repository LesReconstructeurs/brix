const _ = require('../../infrastructure/utils/lodash-utils');

function isNumeric(string) {
  if (typeof string != 'string') {
    return false;
  }
  const stringWithoutComma = string.replace(',', '.').trim();
  const stringWithoutCommaAndSpace = stringWithoutComma.replace(' ', '');
  return !isNaN(stringWithoutCommaAndSpace) && !isNaN(parseFloat(stringWithoutCommaAndSpace));
}

function cleanStringAndParseFloat(string) {
  const stringWithoutSpace = string.replace(' ', '');
  return parseFloat(stringWithoutSpace.replace(',', '.'));
}

function splitIntoWordsAndRemoveBackspaces(string) {
  return _.chain(string)
    .split('\n')
    .reject(_.isEmpty)
    .value();
}

/**
 * Normalize and uppercase a string, remove non canonical characters, zero-width characters and sort the remaining characters alphabetically
 * @param {string} str
 * @returns {string}
 */
function normalizeAndSortChars(str) {
  const normalizedName = normalize(str);
  return [...normalizedName].sort().join('');
}

/**
 * Normalize and uppercase a string, remove non canonical characters and zero-width characters
 * @param {string} str
 * @returns {string}
 */
function normalize(str) {
  const strCanonical = _removeNonCanonicalChars(str);
  const strUpper = strCanonical.toUpperCase();
  return [...strUpper].filter((char) => Boolean(char.match(/[A-Z]/))).join('');
}

function _removeNonCanonicalChars(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

module.exports = {
  isNumeric,
  splitIntoWordsAndRemoveBackspaces,
  cleanStringAndParseFloat,
  normalizeAndSortChars,
  normalize,
};
