angular.
  module('myApp').
  config(['$routeProvider',
    function config($routeProvider) {
      $routeProvider.
        when("/connect", {
          template: "<user-session></user-session>"
        }).
        when("/users", {
          template: "<users></users>"
        }).
	when("/users/:userId", {
	  template: "<user-data></user-data>"
	}).
        otherwise({redirectTo: "/connect"});
  	}
  ]);
