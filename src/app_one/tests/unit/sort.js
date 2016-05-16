describe('sorting the list of users', function() {
  it('sorts in descending order by default', function() {
    var users = ['jack', 'igor', 'jeff'];
    var sorted = users.sort(function(a, b) { return b > a;}).slice();
    expect(sorted).toEqual(['jeff', 'jack', 'igor']);
  });
});