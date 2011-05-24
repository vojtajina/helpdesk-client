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
    self.tickets = $resource(ticketsUrl, 'application/vnd.helpdesk.ticket+json', {author: ResourceCollection.RELATION.ONE});
  });

  this.resetNewTicket();
}

TicketListCtrl.prototype = {
  createTicket: function() {
    this.tickets.create(this.newTicket);
    this.resetNewTicket();
  },

  resetNewTicket: function() {
    this.newTicket = {
      author: '/api/v1/user/agdjY2MwMjExchILEgpVc2VyRW50aXR5GKm6BAw',
      project: '/api/v1/project/agdjY2MwMjExchULEg1Qcm9qZWN0RW50aXR5GMKyBAw',
      description: ''
    };
  }
};

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
    self.projects = $resource(projectsUrl, 'application/vnd.helpdesk.project+json');
  });
}

ProjectListCtrl.prototype = {
  createProject: function() {
    this.projects.create(this.newProject);
    this.resetNewProject();
  },

  resetNewProject: function() {
    this.newProject = {
      name: '',
      description: ''
    };
  }
};
