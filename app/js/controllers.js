/**
 * MainCtrl
 *
 * Exposes $auth service so that we can display current user
 *
 * @param {object} $auth AUTH service
 */
function MainCtrl($auth) {
  this.$auth = $auth;
}

MainCtrl.prototype = {

  /**
   * Is current user authenticated ?
   * @returns {boolean}
   */
  isAuth: function() {
    return !!this.$auth.token;
  }
};

MainCtrl.$inject = ['$auth'];

/**
 * TicketListCtrl
 *
 * Just loads all tickets immediately...
 *
 * @param {Object} $api API service
 * @param {Object} $resource RESOURCE service
 */
function TicketListCtrl($auth, $api, $resource) {
  var self = this;

  $api('tickets', function(ticketsUrl) {
    self.tickets = $resource(ticketsUrl, 'application/vnd.helpdesk.ticket+json', {author: ResourceCollection.RELATION.ONE});
  });

  this.$auth = $auth;
  this.resetNewTicket();
}

TicketListCtrl.prototype = {
  createTicket: function() {
    this.newTicket.author = this.$auth.user;
    this.tickets.create(this.newTicket);
    this.resetNewTicket();
  },

  resetNewTicket: function() {
    this.newTicket = {
      description: '',
      project: '/api/v1/project/93001'
    };
  }
};

TicketListCtrl.$inject = ['$auth', '$api', '$resource'];

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

  this.resetNewProject();
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

ProjectListCtrl.$inject = ['$api', '$resource'];
