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

describe('$tickets', function() {
  // the basic logic is tested by TicketListCtrl test
  var $tickets, xhr;

  beforeEach(function() {
    var scope = angular.scope();
    $tickets = scope.$service('$tickets');
    xhr = scope.$service('$browser').xhr;
    xhr.expectGET('/tickets/url').respond({items: ['/t1-url']});
  });

  it('should load author into Author property', function() {
    var author = {};

    xhr.expectGET('/t1-url').respond({author: '/auth-url', comments: null});
    xhr.expectGET('/auth-url').respond(author);

    var tickets = $tickets('/tickets/url');
    xhr.flush();

    expect(tickets[0].Author).toBeDefined();
    expect(tickets[0].Author).toBe(author);
  });

  it('should create empty array if no comment', function() {
    xhr.expectGET('/t1-url').respond({author: '/auth-url', comments: null});
    xhr.expectGET('/auth-url').respond({});

    var tickets = $tickets('/tickets/url');
    xhr.flush();

    expect(tickets[0].Comments).toBeDefined();
    expect(tickets[0].Comments.items).toBeDefined();
    expect(tickets[0].Comments.items.length).toBe(0);
  });

  it('should load comments collection into Comments property', function() {
    xhr.expectGET('/t1-url').respond({author: '/auth-url', comments: '/comments-url'});
    xhr.expectGET('/auth-url').respond({});
    xhr.expectGET('/comments-url').respond({items: ['/c1-url', '/c2-url']});

    var tickets = $tickets('/tickets/url');
    xhr.flush();

    expect(tickets[0].Comments.items.length).toBe(2);
  });

  it('should lazy load comments details', function() {
    xhr.expectGET('/t1-url').respond({author: '/auth-url', comments: '/comments-url'});
    xhr.expectGET('/auth-url').respond({});
    xhr.expectGET('/comments-url').respond({items: ['/c1-url', '/c2-url']});

    var tickets = $tickets('/tickets/url');
    xhr.flush();

    var comment1 = {}, comment2 = {};
    xhr.expectGET('/c1-url').respond(comment1);
    xhr.expectGET('/c2-url').respond(comment2);

    $tickets.loadComments(tickets[0]);
    xhr.flush();

    expect(tickets[0].Comments.data).toEqual([comment1, comment2]);
  });
});