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

});