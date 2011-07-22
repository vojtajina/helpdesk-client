/**
 * Simple wrapper filter for angular.filter.date
 * Converts gmt datetime format into ISO 8601 extended
 * @see angular.filter.date
 *
 * @param {string} str
 * @param {string} format
 */
angular.filter('gmtdate', function(str, format) {
  return angular.filter.date(str.replace(str.substr(-5), '.000Z'), format);
});

/**
 * Simple filter for displaying user
 * If the user has defined name, it's used, e-mail otherwise...
 *
 * @param {object} user User object
 * @returns {string} Name or email
 */
angular.filter('userInfo', function(user) {
  if (user) {
    if (user.givenName && user.familyName)
      return user.givenName + ' ' + user.familyName;
    if (user.givenName)
      return user.givenName;
    if (user.familyName)
      return user.familyName;

    return user.email;
  }

  return '';
});

/**
 * Simple text formatter
 * Supporting this syntax:
 *  - * something bold * -> <b>something bold</b>
 *  - first \n second line -> first <br /> second line
 *
 * @param {string} text Text that should be formatted
 * @returns {string} text Formatted string
 */
angular.filter('textFormat', function(text) {
	return text.replace(/\n/mg, '<br />').replace(/\*([^\*]*)\*/g, '<b>\$1</b>');
});
