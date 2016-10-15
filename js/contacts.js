'use strict';
var contacts = [];
angular.module('contactsApp', ['ngRoute', 'ngStorage', 'angular-md5', 'ngFileUpload'])
    .config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        $routeProvider
            .when('/', {
                templateUrl: '../template/login.html',
                controller: 'LoginCtrl'
            })
            .when('/register', {
                templateUrl: '../template/register.html',
                controller: 'RegisterCtrl'
            })
            .when('/list', {
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
    .run(['$http', '$location', '$localStorage', function($http, $location, $localStorage) {
        if($localStorage.key) {

        }
    }])
    .controller('LoginCtrl', ['$scope', '$http', '$location', '$localStorage', 'md5', function($scope, $http, $location, $localStorage, md5) {
        if ($localStorage.key && $localStorage.key.length != 0) {
            $location.path("/list");
        }
        $scope.auth = function () {
            if($scope.login && $scope.password) {
                let user = {
                    login: $scope.login,
                    password: md5.createHash($scope.password)
                };
                $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
                $http.post('http://contacts.server/auth.php', user)
                     .success(function(data, status) {
                         if(status == 200) {
                            if(data['status'] == 'OK') {
                                $localStorage.key = data['key'];
                                $localStorage.id = data['id'];
                                $location.path("/list");
                            } else {
                                $scope.err = {};
                                $scope.err.status = true;
                                $scope.err.message = "Неправильное сочетание логин/пароль";
                            }
                         }
                     })
                     .error(function(err){
                         $scope.err = {};
                         $scope.err.status = true;
                         $scope.err.message = "Ошибка сервера";
                     });
            }
        }
    }])
    .controller('RegisterCtrl', ['$scope', '$localStorage', '$http', 'md5', '$location', function($scope, $localStorage, $http, md5, $location) {
        $scope.register = function () {
            if($scope.login && $scope.password) {
                let user = {
                    login: $scope.login,
                    password: md5.createHash($scope.password)
                };
                $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
                $http.post('http://contacts.server/register.php', user)
                    .success(function(data, status) {
                        if(status == 200) {
                            if(data['status'] == 'OK') {
                                $localStorage.key = data['key'];
                                $localStorage.id = data['id'];
                                $location.path("/list");
                            }else{
                                $scope.err = {};
                                $scope.err.status = true;
                                $scope.err.message = "Такой логин уже зарегистрирован";
                            }
                        }
                    })
                    .error(function(err){
                        $scope.err = {};
                        $scope.err.status = true;
                        $scope.err.message = "Ошибка сервера";
                    });
            }
        }
    }])
    .controller('ContactsCtrl', ['$scope', '$location', '$localStorage', '$http', function($scope, $location, $localStorage, $http) {
        if (!$localStorage.key || $localStorage.key.length == 0) {
            $location.path("/");
        }
        if($localStorage.key) {
            contacts = [];
            $http.get("http://contacts.server/get_data.php?key=" + $localStorage.key)
                .success(function (data, status) {
                    if (status == 200) {
                        data.forEach(item => {
                            contacts.push(item);
                        });
                    }
                })
                .error(function(err){
                    $scope.err = {};
                    $scope.err.status = true;
                    $scope.err.message = "Произошла ошибка сервера";
                });
        }
        $scope.contacts = contacts;
        console.log(contacts);

        $scope.show = function(id) {
            $location.path("/contact/" + id);
        }
    }])
    .controller('PageContactCtrl', ['$scope', '$http', '$location', '$routeParams', '$localStorage', function($scope, $http, $location, $routeParams, $localStorage) {
        if (!$localStorage.key || $localStorage.key.length == 0) {
            $location.path("/");
        }
        let found = contacts.filter(function (node) {
            return node.id == $routeParams.id;
        });
        $scope.contact = found[0];

        $scope.delete = function(id){
            $http.get("http://contacts.server/delete_contact.php?key=" + $localStorage.key + '&id=' + id)
                .success(function (data, status) {
                    if (status == 200) {
                        if (data['status'] == 'OK'){
                            $location.path("/list");
                        } else {
                            $scope.err = {};
                            $scope.err.status = true;
                            $scope.err.message = "Удалить не удалось";
                        }
                    }
                });
        }
    }])
    .controller('AddContactCtrl', ['$scope', 'Upload', '$localStorage', '$location', '$timeout', '$http', function($scope, Upload, $localStorage, $location, $timeout, $http) {
        if (!$localStorage.key || $localStorage.key.length == 0) {
            $location.path("/");
        }
        $scope.submit = function(file) {
            let url = 'http://contacts.server/add_contact.php?key=' + $localStorage.key;
            if (file) {
                Upload.upload({
                    url: url,
                    data: {
                        name: $scope.name,
                        surname: $scope.surname,
                        number: $scope.phone,
                        email: $scope.email,
                        photo: file
                    }
                }).success(function (data) {
                    if (data['status'] == 'OK') {
                        $location.path("/list");
                    } else {
                        $scope.err = {};
                        $scope.err.status = true;
                        $scope.err.message = data['message'];
                    }
                }).error(function () {
                    $scope.err = {};
                    $scope.err.status = true;
                    $scope.err.message = "Произошла ошибка сервера";
                });
            } else {
                $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
                $http.post(url, {
                        name: $scope.name,
                        surname: $scope.surname,
                        number: $scope.phone,
                        email: $scope.email
                    })
                    .success(function(data, status) {
                        if(status == 200) {
                            if(data['status'] == 'OK') {
                                $location.path("/list");
                            }else{
                                $scope.err = {};
                                $scope.err.status = true;
                                $scope.err.message = data['message'];
                            }
                        }
                    });
            }
        };
    }])
    .controller('EditContactCtrl', ['$scope', '$routeParams', '$localStorage', '$location', '$http', 'Upload', function($scope, $routeParams, $localStorage, $location, $http, Upload) {
        if (!$localStorage.key || $localStorage.key.length == 0) {
            $location.path("/");
        }
        let found = contacts.filter(function (node) {
            return node.id == $routeParams.id;
        });
        $scope.contact = found[0];

        $scope.submit = function(file) {
            let url = 'http://contacts.server/edit_contact.php?key=' + $localStorage.key;
            let data = {
                id: $scope.contact.id,
                name: $scope.contact.name,
                surname: $scope.contact.surname,
                number: $scope.contact.number,
                email: $scope.contact.email
            };
            if (file) {
                data['photo'] = file;
                Upload.upload({
                    url: url,
                    data: data
                }).success(function (data) {
                    if (data['status'] == 'OK') {
                        $scope.contact.photo = data['photo'];
                        $location.path("/contact/" + $scope.contact.id);
                    } else {
                        $scope.err = {};
                        $scope.err.status = true;
                        $scope.err.message = data['message'];
                    }
                }).error(function () {
                    $scope.err = {};
                    $scope.err.status = true;
                    $scope.err.message = "Произошла ошибка сервера";
                });
            } else {
                $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
                $http.post(url, data)
                     .success(function(data, status) {
                        if(status == 200) {
                            if(data['status'] == 'OK') {
                                $location.path("/contact/" + $scope.contact.id);
                            }else{
                                $scope.err = {};
                                $scope.err.status = true;
                                $scope.err.message = data['message'];
                            }
                        }
                     });
            }
        };
    }]);
