/**
 * MainCtrl
 *
 * Exposes $auth service so that we can display current user
 *
 * @param {object} $auth AUTH service
 */
function MainCtrl($route, $auth, $location, $status) {
  var scope = this;
  scope.$auth = $auth;
  scope.showForm = true;
  scope.$status = $status;
  
  $status.loading();

  $route.parent(scope);
  $route.when('!/intro',    {controller: IntroCtrl, template: 'partials/intro.html', title: 'Intro'});
  $route.when('!/tickets',  {controller: TicketsCtrl, template: 'partials/tickets.html', title: 'Tickets'});
  $route.when('!/projects', {controller: ProjectsCtrl, template: 'partials/projects.html', title: 'Projects'});
  $route.otherwise({redirectTo: '!/intro'});

  $route.onChange(function(a, b) {
  	$status.loading();
    scope.title = $route.current.title;
  });

  /**
   * Is given link active ?
   *
   * @param {string} link
   * @returns {string} CSS class
   */
  this.activeCls = function(link) {
    return $location.hashPath.substr(2) == link ? 'active' : '';
  };
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

MainCtrl.$inject = ['$route', '$auth', '$location', '$status'];

/**
 * TicketsCtrl
 *
 * Just loads all tickets immediately...
 *
 * @param {Object} $api API service
 * @param {Object} $resource RESOURCE service
 */
function TicketsCtrl($auth, $api, $resource) {
  var self = this;

  this.STATES = 'new,assigned,pending,resolved,explain,closed'.toUpperCase().split(',');

  $api('tickets', function(ticketsUrl) {
 // TODO(vojta): remove temporary hack when implemented on service
    // Content-Type should be application/vnd.helpdesk.ticket+json
    self.tickets = $resource(ticketsUrl, 'application/json', {
      author: ResourceCollection.RELATION.ONE,
      revisions: ResourceCollection.RELATION.MANY});
  });

  $api('ticket-revisions', function(revisionsUrl) {
    self.revUrl = revisionsUrl;
  });

  this.$auth = $auth;
  this.resetNewTicket();
}

TicketsCtrl.prototype = {
  createTicket: function() {
	  this.$status.saving();
    this.newTicket.author = this.$auth.user;
    this.tickets.create(this.newTicket);
    this.resetNewTicket();
  },
  
  deleteTicket: function(ticket) {
  	this.$status.deleting();
  	this.tickets.destroy(ticket);
  },
  
  loadDetails: function(ticket) {
  	this.$status.loading();
  	ticket.Revisions.loadDetails();
  },

  resetNewTicket: function() {
    this.newTicket = {
      description: '',
      project: '/api/v1/project/93001'
    };
  },

  createRevision: function(revision, ticket) {
  	this.$status.saving();
  	
    revision.author = this.$auth.user;
    revision.ticket = ticket.url;

    // TODO(vojta): remove this ugly hack when better way available
    ticket.Revisions.url = this.revUrl;

    var tickets = this.tickets;
    ticket.Revisions.create(revision, function() {
      tickets.reload(ticket.url);
    });

    // reset
    revision.comment = '';
  }
};

TicketsCtrl.$inject = ['$auth', '$api', '$resource'];

/**
 * ProjectsCtrl
 *
 * Loads all projects immediately
 *
 * @param {Object} $api API service
 * @param {Object} $resource RESOURCE service
 */
function ProjectsCtrl($api, $resource) {
  var self = this;

  $api('projects', function(projectsUrl) {
    // TODO(vojta): remove temporary hack when implemented on service
    // Content-Type should be application/vnd.helpdesk.project+json
    self.projects = $resource(projectsUrl, 'application/json');
  });

  this.resetNewProject();
}

ProjectsCtrl.prototype = {
  createProject: function() {
  	this.$status.saving();
    this.projects.create(this.newProject);
    this.resetNewProject();
  },
  
  deleteProject: function(project) {
  	this.$status.deleting();
  	this.projects.destroy(project);
  },

  resetNewProject: function() {
    this.newProject = {
      name: '',
      description: ''
    };
  }
};

ProjectsCtrl.$inject = ['$api', '$resource'];

function IntroCtrl() {}
