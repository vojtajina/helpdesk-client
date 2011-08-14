// fake authentication, can't use $cookieStore as we need to set path
function loginAs(email, isAdmin) {
  isAdmin = angular.isDefined(isAdmin) ? isAdmin + '' : 'false';
  window.document.cookie = 'dev_appserver_login=' + email + ':' + isAdmin + ':18580476422013912411; path=/';
}

describe('basic', function() {

  beforeEach(function() {
    loginAs('test@example.com');
    browser().navigateTo('../../app/index.html');
  });


  it('should display intro page', function() {
    expect(element('#content').text()).toMatch(/Introduction/);
    expect(using('#menu').element('a:contains(Intro)').attr('class')).toMatch(/active/);
  });
});
