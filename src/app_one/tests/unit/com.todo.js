// describe('sorting the list of users', function() {
//     it('sorts in descending order by default', function() {
//         var users = ['jack', 'igor', 'jeff'];
//         var sorted = users.sort(function(a, b) {
//             return b > a; }).slice();
//         expect(sorted).toEqual(['jeff', 'jack', 'igor']);
//     });
// });

describe('adding new todo item', function() {

    beforeEach(module('app'));

    var $controller;

    beforeEach(inject(function(_$controller_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
    }));


    it('new item is added', function() {

        var $scope = {};
        var controller = $controller('todoListController', {$scope: $scope});

        $scope.newItem = 'test one';
        $scope.add();

        expect($scope.total()).toEqual(1);
        expect($scope.newItem).toEqual(null);
    });

});
