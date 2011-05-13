/**
 * TicketListCtrl
 * 
 * Just loads all tickets immediately...
 * 
 * @param {Object} $api API service
 * @param {Object} $resource RESOURCE service
 */
function TicketListCtrl($api, $resource) {
  var self = this;

  $api('tickets', function(ticketsUrl) {
    self.tickets = $resource(ticketsUrl, {author: ResourceCollection.RELATION.ONE});
  });
}

/**
 * ProjectListCtrl
 * 
 * Loads all projects immediately
 * 
 * @param {Object} $api API service
 * @param {Object} $resource RESOURCE service
 */
function ProjectListCtrl($api, $resource) {
  var self = this;

  $api('projects', function(projectsUrl) {
    self.projects = $resource(projectsUrl);
  });
}
