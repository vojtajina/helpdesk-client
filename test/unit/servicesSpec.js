describe('$api', function() {
  var API = {tickets: '/tickets', users: '/users'},
      $api, xhr, callback;

  beforeEach(function() {
    var scope = angular.scope();
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
    scope = angular.scope();
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
      rc.create(resourceNew);
      xhr.flush();

      expect(rc.items.length).toBe(2);
      expect(rc.countTotal()).toBe(2);
      expect(rc.items[0].id).toEqual('from-server');
    });
  });

  describe('destroy', function() {
    it('should send DELETE request and remove local item', function() {
      var resource = {link: '/first-url', other: 'field'};
      expectItems([resource.link, '/second-url']);
      xhr.expectGET(resource.link).respond(resource);
      xhr.expectGET('/second-url').respond({id: '2', link: '/second-url'});

      var rc = scope.$service('$resource')('/url', 'application/vnd.helpdesk.ticket+json');
      xhr.flush();

      xhr.expectDELETE(resource.link).respond({});
      rc.destroy(resource);
      xhr.flush();

      expect(rc.countTotal()).toBe(1);
      expect(rc.items_).not.toContain('/first-url');
      expect(rc.items).not.toContain(resource);
    });
  });
});
