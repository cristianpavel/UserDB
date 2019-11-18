// Register the 'userSession' component, along with its controller and template

angular.
	module('userData').
	component('userData', {
		templateUrl: 'user-data/user-data.template.html',
		controller: ['$http', '$routeParams', 
			function UserDataController($http, $routeParams) {
				var self = this;
				self.noSessionsTable = 10;
				self.noSessionsGraph = 10;
				self.average = 0;
				
				self.session = [];
				self.userId = $routeParams.userId;
			


				var formPostData = function formPostData(noSessions, pageNo) {
					return {
						username: self.userId,
						noSessions: noSessions,
						pageNo: pageNo
					};
				}


				var getSessionsFromServer = function getSessionsFromServer() {
					
					$http.post('/user-data/sessions', formPostData(self.noSessionsTable, self.pageNo)).then(function(response) {
						self.sessions = getSessionsFromResponse(response);
					
					});

				}
				
				self.setPageNo = function setPageNo(pageNo) {
					console.log("Setting page number " + pageNo);
					if (pageNo == self.pageNo
						|| pageNo < 1)
						return;
					
					
					if (self.pageNo 
						&& pageNo > self.pageNo
						&& (!self.sessions
							|| self.sessions.length < self.noSessionsTable))
						return;
					
					self.pageNo = pageNo;
					getSessionsFromServer();		
				}

				
				self.setPageNo(1);	
				self.showGraph = function showGraph() {
					console.log(self.noSessionsGraph);
					if (self.noSessionsGraph < 2) {
						self.graphChartObject = undefined;
						return;
					}

					$http.post('/user-data/sessions', formPostData(self.noSessionsGraph, 1)).then(function(response) {
						
						var sessions = getSessionsFromResponse(response);

						if (sessions.length > 1) {
							self.graphChartObject = createGraphFromSessions(sessions);
						} else {
							self.graphChartObject = undefined;
							return;
						}
					
					});	
				}
				
				self.showDateHistogram = function showDateHistogram() {
					
					console.log("Histogram");	
					if (!self.to || !self.from)
						return;
				
					// include end in histogram
					var to = new Date(self.to);
					to.setDate(to.getDate() + 1);
					$http.post('/user-data/date-histogram', 
						{
							username: self.userId,
							to: to,
							from: new Date(self.from).getTime() 
						}).then(
						function(response) {
						
							console.log(response.data);
							self.histogramChartObject = createHistogramFromDates(response.data);

						});





				};

				var convertMillisecondsToMinutes = function convertMillisecondsToMinutes(milliseconds) {

					return milliseconds / 60000;

				}
				var areSameDay = function areSameDay(d1, d2) {
					return d1.getFullYear() === d2.getFullYear() &&
						d1.getMonth() === d2.getMonth() &&
						d1.getDate() === d2.getDate();
				}
				var datesToDataTable = function datesToDataTable(dates) {


					var data = [];
					var start = new Date(self.from);

					var to = new Date(self.to);
					var j = start;
					to.setDate(to.getDate() + 1);

					for (var i = 0; i < dates.length;) {
						var date = new Date(dates[i].day);
						if (!areSameDay(j, date)) {
							data.push({
								c: [ 
									{ v: j.toLocaleDateString()},
									{v : 0}
								   ]
								});
							j.setDate(j.getDate() + 1);
							continue;

						}
						j.setDate(j.getDate() + 1);
						data.push({
							c: [ 
								{ v: new Date(dates[i].day).toLocaleDateString()},
								{v : convertMillisecondsToMinutes(dates[i].value)}
							   ]
							});
						i++;
					}

					while (!areSameDay(j, to)) {
						data.push({
							c: [ 
								{ v: j.toLocaleDateString()},
								{v : 0}
							   ]
							});
						j.setDate(j.getDate() + 1);


					}

					return {
						"cols": [
							{id: "t", label: "Day", type: "string"},
							{id: "s", label: "Duration (min)", type: "number"},
						],
						"rows": data
					};



				}

				var sessionToDataTable = function sessionToDataTable(sessions) {
					
					var data = [];
					for (var i = sessions.length - 1; i >= 0; i--) {
						if (sessions[i].valid) {
							data.push({
								c: [ 
									{ v: "Session #" + i},
									{v : convertMillisecondsToMinutes(sessions[i].duration)}
								   ]
								});
						}
					}

					return {
						"cols": [
							{id: "t", label: "Sessions", type: "string"},
							{id: "s", label: "Duration (min)", type: "number"},
						],
						"rows": data
					};

					


				}

				var createGraphFromSessions = function createGraphFromSessions(sessions) {


					var graphObject = {};
					graphObject.type = "LineChart";

					graphObject.data = sessionToDataTable(sessions);
					console.log(graphObject);
					return graphObject;




				};

				var createHistogramFromDates = function createHistogramFromDates(dates) {

					var histogramObject = {};
					histogramObject.type = "BarChart";

					histogramObject.options = {
						title: "Histogram",
						vAxis: { gridlines: { count: 4 } },
						height: 500

					};

					histogramObject.data = datesToDataTable(dates);
					return histogramObject;

				}

				var getSessionsFromResponse = function getSessionsFromResponse(response) {
					var sessions = [];

					for (i = 0; i < response.data.length; i ++) {
						var start = response.data[i].start;
						var session = {};
						if (response.data[i].valid == 1) {

							var end = response.data[i].end;
							session = {
								start: start,
								end: end,
								duration: end - start,
								valid: true
							};
						} else {
							session = {
								start: start,
								end: 'N/A',
								duration: 'N/A',
								valid: false
							}
						}
						
						sessions.push(session);

						
					}

					return sessions;

				}
				
				$http.post('/user-data/average', formPostData(0, 0)).then(function(response) {

					console.log(response.data);
					self.average = response.data.avg;



				});
				self.showGraph();	

			}
		]
	});
