'use strict';
var contacts = [];
angular.module('contactsApp', ['ngRoute'])
    .config($routeProvider => {
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
    })
    .run(($http) => {
        $http.get("data.json").success((data, status) => {
            if(status == "200") {
                contacts = data;
            }
        });
    })
    .controller('ContactsCtrl', function($scope, $location) {
        $scope.contacts = contacts;

        $scope.alert = id => {
            $location.path("/contact/" + id);
        }
    })
    .controller('AddContactCtrl', function($scope, $http, $window) {
        $scope.submit = () => {
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
    })
    .controller('PageContactCtrl', function($scope, $http, $location, $routeParams) {
        $scope.contact = contacts[$routeParams.id - 1];
    })
    .controller('EditContactCtrl', function($scope, $routeParams) {
        $scope.contact = contacts[$routeParams.id - 1];
    });
