/**
 * Entry points of REST service
 */
var SERVICE_URL = '/api/v1',
    SERVICE_AUTH = '/_ah/authorization/';

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
}, {$inject: ['$authXhr']});

/**
 * RESOURCE factory service
 *
 * Creates resource collection for given url
 * @see ResourceCollection
 *
 * @param {string} url Url for the collection
 * @param {string} contentType Content-Type of this resource (for POST/PUT requests)
 * @param {Object=} relations Relations of this resource (1-1, 1-N)
 */
angular.service('$resource', function($xhr) {
  return function(url, contentType, relations) {
    return new ResourceCollection($xhr, url, true, relations, contentType);
  };
}, {$inject: ['$authXhr']});

/**
 * ResourceCollection represents a collection of resources
 *
 * TODO(vojta) pagination
 *
 * TODO(vojta) allow different url for post ? or special ResourceCollection for only creating,
 * multiple ResourceCollections would use this one ResourceCollection just for creating ?
 * This ResourceCollection would not load any data (even no index) ???
 *
 * @param {Object} $xhr Angular's $xhr service
 * @param {string} url Url of the collection
 * @param {boolean=} autoload Should auto load details of all resources ?
 * @param {Object=} relations Configuration of relations
 * @param {string=} contentType
 * @returns {ResourceCollection}
 */
function ResourceCollection($xhr, url, autoload, relations, contentType) {
  this.$xhr = $xhr;
  this.url = url;
  this.relations_ = relations || {};
  this.contentType = contentType || 'application/json';
  this.items = this.items_ = [];
  this.loadIndex(autoload);
}

ResourceCollection.prototype = {

  /**
   * Load index (array of urls)
   * @param {boolean} autoload Should load all details when index loaded ?
   */
  loadIndex: function(autoload) {
    var self = this;
    this.$xhr('GET', this.url, function(code, response) {
      self.items_ = response.items;
      if (autoload) self.loadDetails();
    });
  },

  /**
   * Load details of all resources
   * Fires xhr for every resource in index list
   */
  loadDetails: function() {
    var self = this;
    angular.forEach(this.items_, function(url, i) {
      self.$xhr('GET', url, function(code, resource) {
        resource.url = url;
        self.loadRelations(resource);
        self.items[i] = resource;
      });
    });
  },

  /**
   * Load relations for given resource
   * @param {Object} resource
   */
  loadRelations: function(resource) {
    var self = this;
    angular.forEach(this.relations_, function(type, name) {
      var relationUrl = resource[name];

      if (!relationUrl) return;
      if (type == ResourceCollection.RELATION.ONE) {
        self.$xhr('GET', relationUrl, function(code, relation) {
          relation.url = relationUrl;
          resource[ucfirst(name)] = relation;
        });
      } else if (type == ResourceCollection.RELATION.MANY) {
        // TODO(vojta): this relation could have relations as well...
        resource[ucfirst(name)] = new ResourceCollection(self.$xhr, relationUrl, false);
      }
    });
  },

  /**
   * Number of resources in the collection
   *
   * @returns {Number}
   */
  countTotal: function() {
    return this.items_.length;
  },

  /**
   * Create new resource
   * Sends POST request to server and adds response into collection
   *
   * @param {Object} resource
   */
  create: function(resource) {
    var self = this;
    this.$xhr('POST', this.url, resource, function(code, resourceFromServer, headers) {
      var url = pathFromUrl(headers('Location')),
          i = self.items_.push(url) - 1;

      resourceFromServer.url = url;
      self.loadRelations(resourceFromServer);
      self.items[i] = resourceFromServer;
    }, {'Content-Type': this.contentType});
  },

  /**
   * Delete given resource
   * Sends DELETE request to server and remove from local collection
   *
   * @param {Object} resource
   */
  destroy: function(resource) {
    var self = this;

    this.$xhr('DELETE', resource.url, function(code, response, headers) {
      var i = self.countTotal();

      while (i--) {
        if (self.items_[i] == resource.url) break;
      }

      self.items.splice(i, 1);
      self.items_.splice(i, 1);
    });
  }
};

/**
 * Possible relations
 * @const
 */
ResourceCollection.RELATION = {
  ONE: 1,
  MANY: 2
};

/**
 * AUTH service
 * Exposes information about currently authenticated user
 *
 * @property {string} token Auth token
 * @property {string} user Url of the user
 * @property {object} User User details
 * @property {string} signout Url for signing out
 */
angular.service('$auth', function($xhr) {
  var $auth = {};

  $xhr('GET', SERVICE_AUTH, function(code, response) {
    angular.extend($auth, response);

    // load user details
    $xhr('GET', response.user, function(code, user) {
      $auth.User = user;
    }, {Authorization: response.token});
  });

  return $auth;
}, {$inject: ['$xhr']});

/**
 * AUTH XHR service [async]
 *
 * Wrapper for $xhr service, provides same API as $xhr.
 * Adds Authorization header for every request.
 * If Authorization token not available yet, this service will delay the request.
 *
 * @param {string} method
 * @param {string} url
 * @param {object=|string=|function(Number, string)} data Optional data (or callback)
 * @param {function(Number, string)|object=} callback Function that will be called with response
 * @param {object=} headers Optional headers
 */
angular.service('$authXhr', function($auth, $xhr) {
  var delayedRequests = [];

  // watch when new token arrives and flush all delayed xhr requests
  this.$watch(function() {
    return $auth.token;
  }, function(newToken) {
    if (newToken) {
      angular.forEach(delayedRequests, function(args) {
        args[4].Authorization = newToken;
        $xhr.apply(null, args);
      });
    }
  });

  return function(method, url, data, callback, headers) {
    if (angular.isFunction(data)) {
      headers = callback;
      callback = data;
      data = null;
    }

    headers = headers || {};

    // token is ready
    if ($auth.token) {
      headers.Authorization = $auth.token;
      $xhr(method, url, data, callback, headers);
    // delay request (wait for auth token)
    } else {
      delayedRequests.push([method, url, data, callback, headers]);
    }
  };
}, {$inject: ['$auth', '$xhr']});
