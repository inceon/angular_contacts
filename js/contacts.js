'use strict';
angular.module('contactsApp', ['ngRoute'])
    .config($routeProvider => {
        $routeProvider
            .when('/', {
                templateUrl: '../template/contacts.html',
                controller: 'ContactsCtrl'
            })
            .when('/', {
                templateUrl: '../template/add_contact.html',
                controller: 'AddContactCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .controller('ContactsCtrl', function($scope, $http) {
        $http.get("data.json").success((data, status) => {
            if(status == "200")
                $scope.contacts = data;
            console.log(data);
        });
    })
    .controller('AddContactCtrl', function($scope, $http) {

    });