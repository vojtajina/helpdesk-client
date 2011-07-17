/**
 * Create root scope with mocked $auth service, already providing auth token
 * @returns {object} Scope instance
 */
function createScopeWithMockAuth() {
  return angular.scope(null, null, {$auth: {token: '@token@', user: '/fake-auth-user'}});
}

beforeEach(function() {
  this.addMatchers({

    /**
     * Assert that given spy has been called exactly once
     */
    toHaveBeenCalledOnce: function() {
      if (arguments.length > 0) {
        throw new Error('toHaveBeenCalledOnce does not take arguments, use toHaveBeenCalledWith');
      }

      if (!jasmine.isSpy(this.actual)) {
        throw new Error('Expected a spy, but got ' + jasmine.pp(this.actual) + '.');
      }

      this.message = function() {
        return [
          this.actual.callCount == 0 ?
            'Expected spy ' + this.actual.identity + ' to have been called once, but was never called.' :
            'Expected spy ' + this.actual.identity + ' to have been called once, but was called ' + this.actual.callCount + ' times.',
          'Expected spy ' + this.actual.identity + ' not to have been called once, but was called once.'
        ];
      };

      return this.actual.callCount == 1;
    }
  });
});
