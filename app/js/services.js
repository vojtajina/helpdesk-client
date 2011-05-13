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
 */
angular.service('$tickets', function($xhr) {
  var tickets = [];

  return {

    /**
     * Load all tickets from service [async]
     * 
     * @param {string} url
     * @returns {Array<Object>} Empty array, will be filled with tickets when response is back
     */
    get: function(url) {
      $xhr('GET', url, function(code, response) {
        angular.forEach(response.items, function(url, i) {
          $xhr('GET', url, function(code, ticket) {
            tickets[i] = ticket;
            $xhr('GET', ticket.author, function(code, user) {
              tickets[i].Author = user;
            });

            // comments, extract into separate service ?
            var comments = ticket.Comments = [];
            if (ticket.comments) {
              $xhr('GET', ticket.comments, function(code, response) {
                ticket.Comments = response;
              });
            } else {
              ticket.Comments = {items: []};
            }
          });
        });
      });

      return tickets;
    },

    /**
     * Load comment details for given ticket [async]
     * 
     * @param {Object} ticket
     */
    loadComments: function(ticket) {
      angular.forEach(ticket.Comments.items, function(url, i) {
        ticket.Comments.data = [];
        $xhr('GET', url, function(code, response) {
          ticket.Comments.data[i] = response;
        });
      });
    }
  };
});

/**
 * PROJECTS service [async]
 * 
 * TODO(vojta) create general "collection" model
 */
angular.service('$projects', function($xhr) {
  var projects = [];
  return function(url) {
    $xhr('GET', url, function(code, response) {
      angular.forEach(response.items, function(url, i) {
        $xhr('GET', url, function(code, response) {
          projects[i] = response;
        });
      });
    });

    return projects;
  };
});
