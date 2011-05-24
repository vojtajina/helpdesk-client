describe('ucfirst', function() {
  it('should upper case first letter of string', function() {
    expect(ucfirst).toBeDefined();
    expect(ucfirst('whatever')).toEqual('Whatever');
  });
});

describe('pathFromUrl', function() {
  it('should extract path from full url', function() {
    expect(pathFromUrl('http://service.com/api/v1/ticket')).toBe('/api/v1/ticket');
  });
});
