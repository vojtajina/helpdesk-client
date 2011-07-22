describe('gmtdate', function() {
  beforeEach(function() {
    spyOn(angular.filter, 'date').andCallThrough();
  });

  it('should convert gmt to iso extended format', function() {
    angular.filter.gmtdate('2011-05-01T20:06:21+0000', null);
    expect(angular.filter.date).toHaveBeenCalledWith('2011-05-01T20:06:21.000Z', null);
  });

  it('should format basic date', function() {
    expect(angular.filter.gmtdate('2011-05-01T20:06:21+0000', 'd.M.yyyy')).toEqual('1.5.2011');
  });
});

describe('userInfo', function() {
  var userInfo = angular.filter.userInfo;

  it('should return name if defined', function() {
    expect(userInfo({familyName: null, givenName: 'First'})).toEqual('First');
    expect(userInfo({familyName: 'Last', givenName: null})).toEqual('Last');
    expect(userInfo({familyName: 'Last', givenName: 'First'})).toEqual('First Last');
  });

  it('should return email if no name defined', function() {
    expect(userInfo({familyName: null, givenName: null, email: 'a@b.c'})).toEqual('a@b.c');
  });

  it('should return empty string when no user given', function() {
    expect(userInfo()).toEqual('');
    expect(userInfo(null)).toEqual('');
  });
});

describe('textFormat',function(){
	var textFormat = angular.filter.textFormat;
	
	it('should rewrite *text* to <b>text</b>', function(){
		expect(textFormat('*text*')).toEqual('<b>text</b>');
	});
	
	it('should rewrite text \n newline to text <br /> newline', function(){
		expect(textFormat('text \\n newline')).toEqual('text <br /> newline');
	});
	
	it('should rewrite *bold text* \n newline to <b>bold text</b> <br /> newline', function(){
		expect(textFormat('*bold text* \\n newline')).toEqual('<b>bold text</b> <br /> newline');
	});
});
