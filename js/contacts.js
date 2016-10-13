'use strict';
var contacts = [];
angular.module('contactsApp', ['ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '../template/contacts.html',
                controller: 'ContactsCtrl'
            })
            .when('/add', {
                templateUrl: '../template/add_contact.html',
                controller: 'AddContactCtrl'
            })
            .when('/contact/:id', {
                templateUrl: '../template/contact_page.html',
                controller: 'PageContactCtrl'
            })
            .when('/edit/:id', {
                templateUrl: '../template/edit_contact.html',
                controller: 'EditContactCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    }])
    .run(['$http', function($http) {
        $http.get("data.json").success(function(data, status) {
            if(status == "200") {
                contacts = data;
            }
        });
    }])
    .controller('ContactsCtrl', ['$scope', '$location', function($scope, $location) {
        $scope.contacts = contacts;

        $scope.alert = function(id) {
            $location.path("/contact/" + id);
        }
    }])
    .controller('AddContactCtrl', ['$scope', function($scope) {
        $scope.submit = function() {
            let user = {
                name: $scope.name,
                surname: $scope.surname,
                number: $scope.phone,
                email: $scope.email,
                photo: "photo_6.jpg"
            };
            contacts.push(user);
            console.log(contacts);
            // $window.location.href = "/";
        }
    }])
    .controller('PageContactCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams) {
        $scope.contact = contacts[$routeParams.id - 1];
    }])
    .controller('EditContactCtrl', ['$scope', '$routeParams', function($scope, $routeParams) {
        $scope.contact = contacts[$routeParams.id - 1];
    }]);
