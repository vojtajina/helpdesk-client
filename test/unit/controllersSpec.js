describe('MainCtrl', function() {
  var $auth, ctrl, scope;

  beforeEach(function() {
    scope = createScopeWithMockAuth();
    $auth = scope.$service('$auth');
    ctrl = scope.$new(MainCtrl);
  });

  describe('isAuth', function() {
    it('should return true when active token', function() {
      $auth.token = '';
      expect(ctrl.isAuth()).toBe(false);
      delete $auth.token;
      expect(ctrl.isAuth()).toBe(false);
    });

    it('should return false when no active token', function() {
      $auth.token = 'token';
      expect(ctrl.isAuth()).toBe(true);
    });
  });

  describe('activeCls', function() {
    var $location;

    beforeEach(function() {
      $location = scope.$service('$location');
    });

    it('should return "active"', function() {
      $location.hashPath = '!/link1';
      expect(ctrl.activeCls('link1')).toEqual('active');
    });

    it('should retunr "" when not active', function() {
      $location.hashPath = '!/link1';
      expect(ctrl.activeCls('link2')).toEqual('');
    });
  });
});

/**
 * TODO(vojta) Extract all service interface related code (urls, response structures, etc)
 * into one place, so that we can easily maintain it.
 *
 * ? Script for fetching / updating latest API from real service, so we can do integration test
 * with the REST service whenever it changes
 */
describe('TicketListCtrl', function() {
  var ctrl, ticket1, ticket2, author1, author2;

  beforeEach(function() {
    var scope = createScopeWithMockAuth();

    ticket1 = {id: 't1', author: '/url-auth1'};
    ticket2 = {id: 't2', author: '/url-auth2'};
    author1 = {};
    author2 = {};

    var xhr = scope.$service('$browser').xhr;
    xhr.expectGET(SERVICE_URL).respond({tickets: '/ticket-url'});
    xhr.expectGET('/ticket-url').respond({items: ['/url1', '/url2']});
    xhr.expectGET('/url1').respond(ticket1);
    xhr.expectGET('/url2').respond(ticket2);
    xhr.expectGET('/url-auth1').respond(author1);
    xhr.expectGET('/url-auth2').respond(author2);

    ctrl = scope.$new(TicketListCtrl);
    xhr.flush();
  });

  it('should load all tickets', function() {
    expect(ctrl.tickets).toBeDefined();
    expect(ctrl.tickets.items.length).toBe(2);
  });

  it('should load ticket details', function() {
    expect(ctrl.tickets.items[0].id).toEqual(ticket1.id);
    expect(ctrl.tickets.items[0].author).toEqual(ticket1.author);
    expect(ctrl.tickets.items[1].id).toEqual(ticket2.id);
    expect(ctrl.tickets.items[1].author).toEqual(ticket2.author);
  });

  it('should load author details', function() {
    expect(ctrl.tickets.items[0].Author).toBe(author1);
    expect(ctrl.tickets.items[1].Author).toBe(author2);
  });

  it('should set author of new ticket', function() {
    spyOn(ctrl.tickets, 'create');
    ctrl.$service('$auth').user = '/new-user/url';
    ctrl.$eval();
    ctrl.createTicket();

    expect(ctrl.tickets.create).toHaveBeenCalled();
    expect(ctrl.tickets.create.argsForCall[0][0].author).toEqual('/new-user/url');
  });

  it('should reset ticket after creating', function() {
    spyOn(ctrl.tickets, 'create');
    ctrl.newTicket.description = 'whatever';
    ctrl.createTicket();

    expect(ctrl.newTicket.description).toEqual('');
  });
});

describe('ProjectListCtrl', function() {
  var ctrl, ticket1, ticket2, author1, author2;

  beforeEach(function() {
    var scope = createScopeWithMockAuth();

    project1 = {name: 'p1', description: '....'};
    project2 = {name: 'p2', description: '...'};

    var xhr = scope.$service('$browser').xhr;
    xhr.expectGET(SERVICE_URL).respond({projects: '/projects-url'});
    xhr.expectGET('/projects-url').respond({items: ['/prj1', '/prj2']});
    xhr.expectGET('/prj1').respond(project1);
    xhr.expectGET('/prj2').respond(project2);

    ctrl = scope.$new(ProjectListCtrl);
    xhr.flush();
  });

  it('should load all projects', function() {
    expect(ctrl.projects).toBeDefined();
    expect(ctrl.projects.items.length).toBe(2);
  });

  it('should load project details', function() {
    expect(ctrl.projects.items[0].name).toEqual(project1.name);
    expect(ctrl.projects.items[0].description).toEqual(project1.description);
    expect(ctrl.projects.items[1].name).toEqual(project2.name);
    expect(ctrl.projects.items[1].description).toEqual(project2.description);
  });

  it('should reset project after creating', function() {
    spyOn(ctrl.projects, 'create');
    ctrl.newProject.description = 'whatever';
    ctrl.newProject.name = 'fake';
    ctrl.createProject();

    expect(ctrl.newProject.name).toEqual('');
    expect(ctrl.newProject.description).toEqual('');
  });
});
