// Register the 'userSession' component, along with its controller and template

angular.
	module('userData').
	component('userData', {
		templateUrl: 'user-data/user-data.template.html',
		controller: ['$http', '$routeParams', 
			function UserSessionController($http, $routeParams) {
				var self = this;
				self.noSessions = 10;
				self.userId = $routeParams.userId;
				
				var postData = {
					username: self.userId,
					noSessions: self.noSessions
				}

				$http.post('/getSessions', postData).then(function(response) {
					var i = 1;
					self.sessions = [];
					console.log(response.data);
					if (response.data[0].active == 1) {
						self.sessions.push({
							start: response.data[0].Timestamp,
							end: "N/A",
							duration: "N/A"
						});
						i++;
					}

					for (; i < response.data.length; i += 2) {
						var start = response.data[i].Timestamp;
						var end = response.data[i - 1].Timestamp;
						self.sessions.push({
							start: start,
							end: end,
							duration: end - start
						});

						
					}
					console.log(self.sessions);

				});


			}
		]
	});
