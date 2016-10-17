'use strict';
angular.module('contactsApp', ['ui.router', 'ngStorage', 'angular-md5', 'ngFileUpload'])
    .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        $urlRouterProvider.otherwise('/list');

        $stateProvider
            .state('login', {
                url: "/",
                templateUrl: "../template/login.html",
                controller: 'LoginCtrl'
            })
            .state('register', {
                url: "/register",
                templateUrl: '../template/register.html',
                controller: 'RegisterCtrl'
            })
            .state('list', {
                url: "/list",
                templateUrl: '../template/contacts.html',
                controller: 'ContactsCtrl'
            })
            .state('add', {
                url: "/add",
                templateUrl: '../template/add_contact.html',
                controller: 'AddContactCtrl'
            })
            .state('contact', {
                url: "/contact/:id",
                templateUrl: '../template/contact_page.html',
                controller: 'PageContactCtrl'
            })
            .state('edit', {
                url: "/edit/:id",
                templateUrl: '../template/edit_contact.html',
                controller: 'EditContactCtrl'
            });
    }])
    .factory('userUrl', function () {
        var url = {};
        url.mainModule = {
            api: 'http://contacts.server/',
            LoginCtrl: {
                login: 'auth.php'
            },
            RegisterCtrl: {
                register: 'register.php'
            },
            ContactsCtrl: {
                get: 'get_data.php?'
            },
            PageContactCtrl: {
                get: 'get_data.php?'
            },
            AddContactCtrl: {
                add: 'add_contact.php?'
            },
            EditContactCtrl: {
                set: 'edit_contact.php?'
            }
        };
        return url;
    })
    .service('requestService', ['$http', 'userUrl', '$localStorage', function ($http, userUrl, $localStorage) {
        var action = {
            request : function (method, action, data, config, handleSuccess, handleError) {
                $rootScope.globalLoader={'opacity':1};
                if($localStorage.key){
                    var auth_key = '&key='+$localStorage.key;
                }
                var getConfig, postConfig;
                (method === "GET") ? getConfig = data : postConfig = data;
                var req = $http({
                    method: method,
                    url: userUrl.mainModule.api + action + auth_key,
                    params: getConfig,
                    data: postConfig
                });

                return (req.then(handleSuccess, handleError))
            }
        };
        return action;
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
            $scope.contacts = [];

            $http.get("http://contacts.server/get_data.php?key=" + $localStorage.key)
                .success(function (data, status) {
                    if (status == 200) {
                        data.forEach(item => {
                            $scope.contacts.push(item);
                        });
                    }
                })
                .error(function(err){
                    $scope.err = {};
                    $scope.err.status = true;
                    $scope.err.message = "Произошла ошибка сервера";
                });
        }

        $scope.show = function(id) {
            $location.path("/contact/" + id);
        }
    }])
    .controller('PageContactCtrl', ['$scope', '$http', '$location', '$stateParams', '$localStorage', function($scope, $http, $location, $stateParams, $localStorage) {
        if (!$localStorage.key || $localStorage.key.length == 0) {
            $location.path("/");
        }

        $http.get("http://contacts.server/get_data.php?key=" + $localStorage.key + '&id=' + $stateParams.id)
            .success(function (data, status) {
                if (status == 200) {
                    $scope.contact = data
                    console.log(data);
                }
            })
            .error(function(err){
                $scope.err = {};
                $scope.err.status = true;
                $scope.err.message = "Не удалось получить информацию";
            });

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
    .controller('EditContactCtrl', ['$scope', '$stateParams', '$localStorage', '$location', '$http', 'Upload', function($scope, $stateParams, $localStorage, $location, $http, Upload) {
        if (!$localStorage.key || $localStorage.key.length == 0) {
            $location.path("/");
        }

        $http.get("http://contacts.server/get_data.php?key=" + $localStorage.key + '&id=' + $stateParams.id)
            .success(function (data, status) {
                if (status == 200) {
                    $scope.contact = data
                    console.log(data);
                }
            })
            .error(function(err){
                $scope.err = {};
                $scope.err.status = true;
                $scope.err.message = "Не удалось получить информацию";
            });

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
