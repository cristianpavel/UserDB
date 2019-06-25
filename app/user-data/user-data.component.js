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
					for (i = 0; i < response.data.length; i ++) {
						var start = response.data[i].start;
						var session = {};
						if (response.data[i].valid == 1) {

							var end = response.data[i].end;
							session = {
								start: start,
								end: end,
								duration: end - start
							};
						} else {
							session = {
								start: start,
								end: 'N/A',
								duration: 'N/A'
							}
						}
						
						self.sessions.push(session);

						
					}
					console.log(self.sessions);

				});
				
				$http.post('/getAverageDuration', postData).then(function(response) {

					console.log(response.data);
					self.average = response.data.avg;



				});

			}
		]
	});
