describe('gmtdate', function() {
  beforeEach(function() {
    spyOn(angular.filter, 'date');
  });

  it('should convert gmt to iso extended format', function() {
    angular.filter.gmtdate('2011-05-01T20:06:21+0000', null);
    expect(angular.filter.date).toHaveBeenCalledWith('2011-05-01T20:06:21.000Z', null);
  });
});
