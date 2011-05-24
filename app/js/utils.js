/**
 * Upper case first letter of string
 * @param {string} str
 * @returns {string}
 */
function ucfirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Extracts path from full url
 * @param {string} url
 * @returns {string}
 */
function pathFromUrl(url) {
  return url.replace(/^https?:\/\/[^\/]*/, '');
}
