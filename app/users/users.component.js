// Register the 'userSession' component, along with its controller and template

angular.
	module('users').
	component('users', {
		templateUrl: 'users/users.template.html',
		controller: ['$http', '$routeParams',
			function UserSessionController($http, $routeParams) {

			
				var self = this;
				var getFromServer = function getFromServer(getPath) {
					$http.get(getPath).then(function(response) {
						self.users = response.data;
					});
					
				}
				self.selection = 'all';
				getFromServer('/users');
				self.selectionChanged = function selectionChanged() {
					
					console.log(self.selection);	
					switch(self.selection) {
					case 'active':
						getPath = '/onlineUsers';
						break;
					case 'inactive':
						getPath = '/offlineUsers';
						break

					default:
						getPath = '/users';


					}

					getFromServer(getPath);

				}

			}
		]
	});
