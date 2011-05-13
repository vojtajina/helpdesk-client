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
 * RESOURCE factory service
 * 
 * Creates resource collection for given url
 * @see ResourceCollection
 * 
 * @param {string} url Url for the collection
 * @param {Object=} relations Relations of this resource (1-1, 1-N)
 */
angular.service('$resource', function($xhr) {
  return function(url, relations) {
    return new ResourceCollection($xhr, url, true, relations);
  };
});

/**
 * ResourceCollection represents a collection of resources
 * 
 * TODO(vojta) pagination
 * 
 * @param {Object} $xhr Angular's $xhr service 
 * @param {string} url Url of the collection
 * @param {boolean=} autoload Should auto load details of all resources ?
 * @param {Object=} relations Configuration of relations
 * @returns {ResourceCollection}
 */
function ResourceCollection($xhr, url, autoload, relations) {
  this.$xhr = $xhr;
  this.relations_ = relations;
  this.items = [];
  this.loadIndex(url, autoload);
}

ResourceCollection.prototype = {

  /**
   * Load index (array of urls)
   * @param {string} url
   * @param {boolean} autoload Should load all details when index loaded ?
   */
  loadIndex: function(url, autoload) {
    var self = this;
    this.$xhr('GET', url, function(code, response) {
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
      if (type == ResourceCollection.RELATION.ONE) {
        self.$xhr('GET', resource[name], function(code, relation) {
          resource[ucfirst(name)] = relation;
        });
      } else if (type == ResourceCollection.RELATION.MANY) {
        resource[ucfirst(name)] = new ResourceCollection(self.$xhr, resource[name]);
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