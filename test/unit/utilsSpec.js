describe('ucfirst', function() {
  it('should upper case first letter of string', function() {
    expect(ucfirst).toBeDefined();
    expect(ucfirst('whatever')).toEqual('Whatever');
  });
});
