let contactsApp = angular.module('contactsApp', ['ngRoute']);
contactsApp.config($routeProvide => {
    $routeProvide
        .when('/',{
            templateUrl: './template/contacts.html',
            controller: 'ContactsCtrl'
        })
        .otherwise({
            redirectTo: '/'
        })
});
contactsApp.controller('ContactsCtrl', function($scope, $http, $location) {
    var contactsList = $scope;

    $http.get("data.json").success((data, status) => {
        if(status == "200")
            contactsList.contacts = data;
        console.log(data);
    });

    contactsList.alert = () => {
        alert();
    };

    contactsList.addTodo = () => {
        contactsList.contacts.push({text:contactsList.todoText, done:false});
        contactsList.todoText = '';
    };

    contactsList.remaining = () => {
        var count = 0;
        angular.forEach(contactsList.contacts, function(todo) {
            count += todo.done ? 0 : 1;
        });
        return count;
    };

    contactsList.archive = () => {
        var oldTodos = contactsList.contacts;
        contactsList.contacts= [];
        angular.forEach(oldTodos, function(todo) {
            if (!todo.done) contactsList.contacts.push(todo);
        });
    };
});