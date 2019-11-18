// Register the 'userSession' component, along with its controller and template

angular.
	module('userSession').
	component('userSession', {
		templateUrl: 'user-session/user-session.template.html',
		controller: ['$http', '$timeout', 
			function UserSessionController($http, $timeout) {

				var self = this;
				var badUsername = function badUsername() {
					return !self.username;
				}
				self.error = "";

				self.msg = "";
				var sendDataToServer = function sendDataToServer(data) {
					return $http.post("/", data)
						.catch(function(err) {
							console.log(err);
							return false;
						});


				}
				var clear = function (toClear) {

					
					$timeout(function() {
						if (toClear == 'error') {
							self.error = '';
							console.log(self.error);
						} else 
							self.msg = '';

					}, 1000);

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
							self.error = self.username + " is already active. Press End first.";
							clear('error');
							return false;
						}
						
						self.msg = self.username + " has started his/her session.";

						clear(self.msg);
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
							console.log("error");
							self.error = self.username + " is not active. Press Start first.";
							clear('error');
							return false;
						}

						self.msg = self.username + " has ended his/her session.";

						clear('msg');
						
					});


				}





			}
		]
	});
