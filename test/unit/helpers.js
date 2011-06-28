/**
 * Create root scope with mocked $auth service, already providing auth token
 * @returns {object} Scope instance
 */
function createScopeWithMockAuth() {
  return angular.scope(null, null, {$auth: {token: '@token@'}});
}
