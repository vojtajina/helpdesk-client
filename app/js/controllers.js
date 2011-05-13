/**
 * TicketListCtrl
 * 
 * Just loads all tickets immediately...
 * 
 * @param $api $api service
 * @param $tickets $tickets service
 */
function TicketListCtrl($api, $tickets) {
  var self = this;
  this.loadComments = $tickets.loadComments;

  $api('tickets', function(ticketsUrl) {
    self.tickets = $tickets.get(ticketsUrl);
  });
}

/**
 * ProjectListCtrl
 * 
 * Loads all projects immediately
 * 
 * @param {Object} $api API service
 */
function ProjectListCtrl($api, $projects) {
  var self = this;
  $api('project', function(projectsUrl) {
    self.projects = $projects(projectsUrl);
  });
}
