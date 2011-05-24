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
 * @param {string} contentType Content-Type of this resource (for POST/PUT requests)
 * @param {Object=} relations Relations of this resource (1-1, 1-N)
 */
angular.service('$resource', function($xhr) {
  return function(url, contentType, relations) {
    return new ResourceCollection($xhr, url, true, relations, contentType);
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
 * @param {string=} contentType
 * @returns {ResourceCollection}
 */
function ResourceCollection($xhr, url, autoload, relations, contentType) {
  this.$xhr = $xhr;
  this.url = url;
  this.relations_ = relations;
  this.contentType = contentType;
  this.items = [];
  this.loadIndex(url, autoload);
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
      // TODO(vojta) parse location (remove domain)
      self.items_.unshift(headers.Location || 'new-resource');
      self.items.unshift(resourceFromServer);
    }, {'Content-Type': this.contentType});
  },

  /**
   * Delete given resource
   * Sends DELETE request to server and remove from local collection
   *
   * @param {Object} resource
   */
  destroy: function(resource) {
    var self = this,
        url = resource.link;

    this.$xhr('DELETE', url, function(code, response, headers) {
      var i = self.countTotal();

      while (i--) {
        if (self.items_[i] == url) break;
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
