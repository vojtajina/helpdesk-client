/**
 * MainCtrl
 *
 * Exposes $auth service so that we can display current user
 *
 * @param {object} $auth AUTH service
 */
function MainCtrl($route, $auth, $location) {
  var scope = this;
  scope.$auth = $auth;

  $route.parent(scope);
  $route.when('!/intro',    {controller: IntroCtrl, template: 'partials/intro.html', title: 'Intro'});
  $route.when('!/tickets',  {controller: TicketListCtrl, template: 'partials/tickets.html', title: 'Tickets'});
  $route.when('!/projects', {controller: ProjectListCtrl, template: 'partials/projects.html', title: 'Projects'});
  $route.otherwise({redirectTo: '!/intro'});

  $route.onChange(function(a, b) {
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

MainCtrl.$inject = ['$route', '$auth', '$location'];

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
 // TODO(vojta): remove temporary hack when implemented on service
    // Content-Type should be application/vnd.helpdesk.ticket+json
    self.tickets = $resource(ticketsUrl, 'application/json', {author: ResourceCollection.RELATION.ONE});
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
    // TODO(vojta): remove temporary hack when implemented on service
    // Content-Type should be application/vnd.helpdesk.project+json
    self.projects = $resource(projectsUrl, 'application/json');
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

function IntroCtrl() {}
