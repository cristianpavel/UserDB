// Register the 'userSession' component, along with its controller and template

angular.
	module('users').
	component('users', {
		templateUrl: 'users/users.template.html',
		controller: ['$http', '$routeParams',
			function UsersController($http, $routeParams) {

				var self = this;
				
				var noUsersPerPage = 10;
				var searchInput = '';
				var postPath = '/users';
				var getFromServer = function getFromServer(postPath, postData) {
					console.log(postPath);
					console.log(postData);
					$http.post(postPath, postData).then(function(response) {
						console.log(response.data);
						if (response.data.error) {
							self.users = undefined;
							return;
						}

						self.users = response.data;

					});
					
				}

			
				
				self.search = '';
				
				self.ddSelectOptions = [
					{
						text: 'All',
						value: 'all'
					},
					{
						text: 'Active',
						value: 'active'
					},
					{
						text: 'Inactive',
						value: 'inactive'
					}
				];
				self.noUsersProductive = 5;
				self.ddSelectSelected = self.ddSelectOptions[0];

				self.onSelectionChanged = function onSelectionChanged(selected) {
				
					searchInput = '';
					var postData = {
						lastUser: {
							username: ''
						},

						noUsers: noUsersPerPage
					}
					

					switch(selected.value) {
					case 'active':
						postPath = '/users/active';
						break;
					case 'inactive':
						postPath = '/users/inactive';
						break;
					default:
						postPath = '/users';
					

					}

					getFromServer(postPath, postData); 
				}
				
				self.onSelectionChanged(self.ddSelectSelected);

				self.nextPage = function nextPage() {
					if (!self.users || self.users.length < noUsersPerPage)
						return;
					
					console.log("Next");	
					getFromServer(postPath,
						{
							username: searchInput,
							lastUser: {
								username: self.users.length ? self.users[self.users.length - 1].username : ''
							},
							noUsers: noUsersPerPage
						});
				}

				self.getProductiveUsers = function () {
					self.usersProductive = undefined;
					$http.post('/users/productive', {
						noUsers: self.noUsersProductive
					}).then(function(response) {
						console.log('Got Most Productive');
						self.usersProductive = response.data;
					});
				}
				self.getProductiveUsers();

				self.searchUser = function(keyEvent) {
					if (keyEvent.which == 13) {
						searchInput = self.search;
						postPath = '/users/user';
						postData = {
							username: self.search,
							lastUser: {
								username: ''
							},
							noUsers: noUsersPerPage
						};
						
						
						getFromServer(postPath, postData);
						

					}

				}

			}
		]
	});
