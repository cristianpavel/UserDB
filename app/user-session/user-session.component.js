// Register the 'userSession' component, along with its controller and template

angular.
	module('userSession').
	component('userSession', {
		templateUrl: 'user-session/user-session.template.html',
		controller: ['$http', 
			function UserSessionController($http) {

				var self = this;
				var badUsername = function badUsername() {
					return !self.username;
				}

				var sendDataToServer = function sendDataToServer(data) {
					return $http.post("/connect", data)
						.catch(function(err) {
							console.log(err);
							return false;
						});


				}

				self.startSession = function startSession() {
					if (badUsername()) {
						console.log("Bad Username");
						return;
					}
					
					var postData = { 
						"username"	: self.username,
						"active"	: 1
					};

		
					console.log(postData);
					sendDataToServer(postData)
						.then(function(response) {
						if (response.data &&
							response.data.error) {
							alert(response.data.error);
							return false;
						}
							
						alert("Session started");
					});

				}

				self.endSession = function endSession() {
					if (badUsername()) {
						console.log("Bad Username");
						return;
					}
					
					var postData = { 
						"username"	: self.username,
						"active"	: 0
					};

		
					console.log(postData);
					sendDataToServer(postData)
						.then(function(response) {
						if (response.data &&
							response.data.error) {
							alert(response.data.error);
							return false;
						}
						
						alert("Session ended");
					});


				}





			}
		]
	});
