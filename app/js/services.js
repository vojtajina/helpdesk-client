/**
 * Entry point of REST service
 */
var SERVICE_URL = '/api/v1';

/**
 * API service [async]
 * Loads API from the REST service
 * Do simple caching as well
 * 
 * TODO use local storage as cache ?
 * TODO don't cache, rely on $xhr instead ?
 * 
 * @param {string} name Name of the api
 * @param {Function} done Will be called when api loaded, with given api as param
 */
angular.service('$api', function($xhr) {
  var api, sent = false, outstandings = [];

  return function(name, done) {
    if (api) {
      done(api[name]);
    } else if (sent) {
      outstandings.push([name, done]);
    } else {
      sent = true;
      $xhr('GET', SERVICE_URL, function(code, response) {
        api = response;
        angular.forEach(outstandings, function(fn) {
          fn[1](api[fn[0]]);
        });
        done(response[name]);
      });      
    }
  };
});

/**
 * TICKETS service [async]
 * Loads all tickets along with details and user details
 * 
 * @returns {Array<Object>} Empty array, will be filled with tickets when response is back
 */
angular.service('$tickets', function($xhr) {
  var tickets = [];

  return function(url) {
    $xhr('GET', url, function(code, response) {
      angular.forEach(response.items, function(url, i) {
        $xhr('GET', url, function(code, ticket) {
          tickets[i] = ticket;
          $xhr('GET', ticket.author, function(code, user) {
            tickets[i].Author = user;
          });
        });
      });
    });

    return tickets;
  };
});