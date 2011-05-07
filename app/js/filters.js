/**
 * Simple wrapper filter for angular.filter.date
 * Converts datetime format into ISO 8601 extended
 * @see angular.filter.date
 * 
 * @param {string} str
 * @param {string} format
 */
angular.filter('mydate', function(str, format) {
  return angular.filter.date(str.replace(str.substr(-5), '.000Z'), format);
});