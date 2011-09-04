describe('$status', function() {
  var $status, scope;

  beforeEach(function() {
    scope = createScopeWithMockAuth();
    $status = scope.$service('$status');
  });

  it('should set the status message', function() {
    $status.set('SOMETHING');
    expect($status.message).toBe('SOMETHING');
  });

  it('should clear the message when all requests finished', function() {
    var $browser = scope.$service('$browser');
    var $xhr = scope.$service('$xhr');

    $browser.xhr.expectGET('/url').respond('');
    $status.loading();
    $xhr('GET', '/url');
    $browser.defer.flush();

    expect($status.message).toBe('L o a d i n g . . .');
    $browser.xhr.flush();
    expect($status.message).toBe('');
  });

  it('should have loading method', function() {
    expect(angular.isFunction($status.loading)).toBe(true);
  });

  it('should have deleting method', function() {
    expect(angular.isFunction($status.deleting)).toBe(true);
  });

  it('should have saving method', function() {
    expect(angular.isFunction($status.saving)).toBe(true);
  });
});

describe('$api', function() {
  var API = {tickets: '/tickets', users: '/users'},
      $api, xhr, callback;

  beforeEach(function() {
    var scope = createScopeWithMockAuth();
    $api = scope.$service('$api');
    xhr = scope.$service('$browser').xhr;
    xhr.expectGET(SERVICE_URL).respond(API);
    callback = jasmine.createSpy('done');
  });

  it('should call callback with requested api', function() {
    $api('tickets', callback);
    xhr.flush();

    expect(callback).toHaveBeenCalledWith(API.tickets);
  });

  it('should call xhr only once', function() {
    $api('tickets', callback);
    xhr.flush();
    $api('users', callback);

    expect(callback).toHaveBeenCalled();
    expect(callback.callCount).toBe(2);
  });

  it('should call xhr only once even if second call arrives before xhr respond', function() {
    $api('tickets', callback);
    $api('users', callback);
    xhr.flush();

    expect(callback).toHaveBeenCalled();
    expect(callback.callCount).toBe(2);
  });
});

describe('$resource', function() {
  var scope, xhr;

  function expectItems(items) {
    xhr.expectGET('/url').respond({items: items});
  }

  beforeEach(function() {
    scope = createScopeWithMockAuth();
    xhr = scope.$service('$browser').xhr;
  });

  it('should auto load details by default', function() {
    expectItems(['/first', '/second', '/third']);
    xhr.expectGET('/first').respond({id: '1'});
    xhr.expectGET('/second').respond({id: '2'});
    xhr.expectGET('/third').respond({id: '3'});

    var rc = scope.$service('$resource')('/url');
    xhr.flush();

    expect(rc.items.length).toBe(3);
    expect(rc.items[0].id).toEqual('1');
    expect(rc.items[1].id).toEqual('2');
    expect(rc.items[2].id).toEqual('3');
  });

  it('should set url to each resource', function() {
    expectItems(['/one']);
    xhr.expectGET('/one').respond({id: '1'});

    var rc = scope.$service('$resource')('/url');
    xhr.flush();

    expect(rc.items[0].url).toEqual('/one');
  });

  it('countTotal() should return number of resources even before details are loaded', function() {
    expectItems(['/first', '/second', '/third']);

    var rc = new ResourceCollection(scope.$service('$xhr'), '/url');
    xhr.flush();

    expect(rc.items.length).toBe(0);
    expect(rc.countTotal()).toBe(3);
  });

  it('should load 1-1 relations', function() {
    expectItems(['/first']);
    xhr.expectGET('/first').respond({id: '1', relation: '/rel-url'});
    xhr.expectGET('/rel-url').respond({id: 'relation'});

    var rc = scope.$service('$resource')('/url', null, {relation: ResourceCollection.RELATION.ONE});
    xhr.flush();

    expect(rc.items[0].Relation.id).toEqual('relation');
  });

  it('should set url for 1-1 relations', function() {
    expectItems(['/first']);
    xhr.expectGET('/first').respond({id: '1', relation: '/rel-url'});
    xhr.expectGET('/rel-url').respond({id: 'relation'});

    var rc = scope.$service('$resource')('/url', null, {relation: ResourceCollection.RELATION.ONE});
    xhr.flush();

    expect(rc.items[0].Relation.url).toEqual('/rel-url');
  });

  it('should create collections for 1-n relations', function() {
    expectItems(['/first']);
    xhr.expectGET('/first').respond({id: '1', relation: '/rel-url'});
    xhr.expectGET('/rel-url').respond({items: ['/rel1', '/rel2']});

    var rc = scope.$service('$resource')('/url', null, {relation: ResourceCollection.RELATION.MANY});
    xhr.flush();

    expect(rc.items[0].Relation).toBeDefined();
    expect(rc.items[0].Relation instanceof ResourceCollection).toBe(true);
    expect(rc.items[0].Relation.countTotal()).toEqual(2);
  });

  describe('create', function() {
    it('should send POST request with Content-Type header and prepend response to local items', function() {
      expectItems(['/first']);
      xhr.expectGET('/first').respond({id: '1'});

      var rc = scope.$service('$resource')('/url', 'application/vnd.helpdesk.ticket+json');
      xhr.flush();

      var resourceNew = {id: 'new'};
      var resourceFromServer = {id: 'from-server'};

      xhr.expectPOST('/url', resourceNew, {'Content-Type': 'application/vnd.helpdesk.ticket+json'}).respond(resourceFromServer);
      spyOn(rc, 'loadRelations');

      rc.create(resourceNew);
      xhr.flush();

      expect(rc.countTotal()).toBe(2);
      expect(rc.items.pop().id).toEqual('from-server');
      expect(rc.loadRelations).toHaveBeenCalled();
    });

    it('should set url property to resource from server', function() {
      expectItems(['/first']);
      xhr.expectGET('/first').respond({id: '1'});

      var rc = scope.$service('$resource')('/url', 'application/vnd.helpdesk.ticket+json');
      xhr.flush();

      var resourceNew = {id: 'new'};
      var resourceFromServer = {id: 'from-server'};

      xhr.expectPOST('/url', resourceNew, {'Content-Type': 'application/vnd.helpdesk.ticket+json'}).respond(resourceFromServer);
      spyOn(rc, 'loadRelations');

      rc.create(resourceNew);
      xhr.flush();

      var res = rc.items.pop();
      expect(rc.countTotal()).toBe(2);
      expect(res.id).toEqual('from-server');
      expect(res.url).toEqual('fake-header');
    });

    it('should call optional done callback', function() {
      expectItems([]);

      var rc = scope.$service('$resource')('/url'),
          resourceNew = {id: 'new'},
          callback = jasmine.createSpy('done');

      xhr.flush();
      xhr.expectPOST('/url', resourceNew).respond({});
      spyOn(rc, 'loadRelations');

      rc.create(resourceNew, callback);
      xhr.flush();

      expect(callback).toHaveBeenCalledOnce();
    });
  });

  describe('destroy', function() {
    it('should send DELETE request and remove local item', function() {
      var res1 = {other: 'field', url: '/url1'},
          res2 = {id: 'res2', url: '/url2'},
          res3 = {id: 'res3', url: '/url3'};

      expectItems([res1.url, res2.url, res3.url]);
      xhr.expectGET(res1.url).respond(res1);
      xhr.expectGET(res2.url).respond(res2);
      xhr.expectGET(res3.url).respond(res3);

      var rc = scope.$service('$resource')('/url', 'application/vnd.helpdesk.ticket+json');
      xhr.flush();

      // delete res2
      xhr.expectDELETE(res2.url).respond({});
      rc.destroy(res2);
      xhr.flush();

      expect(rc.countTotal()).toBe(2);
      expect(rc.items_).not.toContain(res2.url);
      expect(rc.items_).toContain(res1.url);
      expect(rc.items_).toContain(res3.url);

      expect(rc.items).not.toContain(res2);
      expect(rc.items).toContain(res1);
      expect(rc.items).toContain(res3);

      // delete res1
      xhr.expectDELETE(res1.url).respond({});
      rc.destroy(res1);
      xhr.flush();

      expect(rc.countTotal()).toBe(1);
      expect(rc.items_).not.toContain(res1.url);
      expect(rc.items_).not.toContain(res2.url);
      expect(rc.items_).toContain(res3.url);

      expect(rc.items).not.toContain(res1);
      expect(rc.items).not.toContain(res2);
      expect(rc.items).toContain(res3);
    });
  });

  describe('countTotal', function() {
    it('should return number of items, even if details are not loaded', function() {
      expectItems(['/first', '/second', '/third']);
      var rc = new ResourceCollection(scope.$service('$xhr'), '/url');
      xhr.flush();

      expect(rc.countTotal()).toBe(3);
    });

    it('should return 0 even before index is loaded', function() {
      expectItems([]);
      var rc = new ResourceCollection(scope.$service('$xhr'), '/url');
      expect(rc.countTotal()).toBe(0);
    });
  });

  describe('reload', function() {
    it('should reload given resource by its url', function() {
      var res1 = {id: 'res1', url: '/url1'},
          res2 = {id: 'res2', url: '/url2'};

      expectItems([res1.url, res2.url]);
      xhr.expectGET(res1.url).respond(res1);
      xhr.expectGET(res2.url).respond(res2);

      var rc = scope.$service('$resource')('/url');
      xhr.flush();

      xhr.expectGET(res1.url).respond({id: 'new-id', isNew: true});
      rc.reload(res1.url);
      xhr.flush();

      expect(rc.items[0].id).toEqual('new-id');
      expect(rc.items[0].isNew).toBe(true);
    });

    it('should reload relations if changed', function() {

      var res = {id: 'res1', url: '/url1', rel1: '/url/rel1', rel2: '/url/rel2'};

      expectItems([res.url]);
      xhr.expectGET(res.url).respond(res);
      xhr.expectGET(res.rel1).respond({id: 'old-rel1'});
      xhr.expectGET(res.rel2).respond({id: 'old-rel2'});

      var rc = scope.$service('$resource')('/url', '', {
        rel1: ResourceCollection.RELATION.ONE,
        rel2: ResourceCollection.RELATION.ONE
      });
      xhr.flush();

      xhr.expectGET(res.url).respond({rel1: '/url/rel1', rel2: '/new-url'});
      xhr.expectGET('/new-url').respond({id: 'new-rel2'});
      rc.reload(res.url);
      xhr.flush();

      expect(rc.items[0].Rel1.id).toBe('old-rel1');
      expect(rc.items[0].Rel2.id).toBe('new-rel2');
    });
  });
});

describe('$auth', function() {
  var $auth, xhr;

  beforeEach(function() {
    var scope = angular.scope();
    xhr = scope.$service('$browser').xhr;
    xhr.expectGET(SERVICE_AUTH).respond({token: '%token%', user: '/user-url'});
    $auth = scope.$service('$auth');
  });

  it('should load and expose token', function() {
    xhr.flush();
    expect($auth.token).toEqual('%token%');
  });

  it('should load User details', function() {
    xhr.expectGET('/user-url', null, {Authorization: '%token%'}).respond({name: 'First Last'});
    xhr.flush();
    expect($auth.User).toBeDefined();
    expect($auth.User.name).toEqual('First Last');
  });
});

describe('$authXhr', function() {
  var $authXhr, xhr, token = '@token';

  beforeEach(function() {
    var scope = angular.scope();
    xhr = scope.$service('$browser').xhr;
    xhr.expectGET(SERVICE_AUTH).respond({token: token, user: '/user-url'});
    xhr.expectGET('/user-url').respond({});
    $authXhr = scope.$service('$authXhr');
  });

  it('should add Authorization header to every request', function() {
    var response = {},
        callback = jasmine.createSpy('callback');

    xhr.expectGET('/url', null, {Authorization: token}).respond(response);
    $authXhr('GET', '/url', callback);
    xhr.flush();
    expect(callback).toHaveBeenCalled();
    expect(callback.argsForCall[0][1]).toBe(response);
  });
});
