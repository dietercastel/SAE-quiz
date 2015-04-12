var quizApp = angular.module('quiz', ['ngRoute']);

//Used as client side session storage
quizApp.factory('userDataService', function(){
	var userData = {};
	userData.user = "";
	userData.highscore = 0; 
	userData.highscoreRev = 0; 
	return userData;
});

quizApp.config(function($routeProvider) {
		$routeProvider
		.when('/', {
				templateUrl : '/sae/html/welcome.html',
		})
		.when('/login', {
				templateUrl : '/sae/html/login.html',
				controller  : 'loginController'
		})
		.when('/register', {
				templateUrl : '/sae/html/register.html',
				controller  : 'regController'
		})
		.when('/highscores', {
				templateUrl : '/sae/html/highscores.html',
				controller  : 'hsController'
		})
		.when('/quiz', {
				// templateUrl : '/sae/html/quiz', gives strange memory leak
				templateUrl : '/sae/quiz.html',
				controller  : 'quizController'
		});
});

quizApp.controller('hsController', function($scope, $http, $location){
		$scope.submit = function(){
				if($scope.queryHS){

						$http({
								method: 'GET',
								url: "/sae/highscores/by_score",
						})
						.success(function(data, status){
								console.log(data);
								$scope.resultHS = data
								$scope.hitcount = Object.keys($scope.resultHS).length;
						}).
						error(function(data, status){
								console.log(data);	
								console.log(status);	
						});
				}
		};
});
quizApp.controller('regController', function($scope, $http, $location){
		$scope.regForm = {}; 
		$scope.submit = function(){
				if($scope.regForm.name){
						$http({
								method: 'PUT',
								url: "/sae/users/add",
								data: $scope.regForm
						})
						.success(function(data, status){
								console.log(data);
								if(data.ok){
										alert(data.msg);
								}
						}).
						error(function(data, status){
								console.log(data);	
								console.log(status);	
						});
				}
		};
});

quizApp.controller('loginController', function($scope, $http, $location, userDataService){
		$scope.loginForm = {}; 
		$scope.submit = function(){
				if($scope.loginForm.name){
						$http({
								method: 'POST',
								url: "/sae/users/login",
								data: $scope.loginForm,
						})
						.success(function(data, status){
								if(data.authenticated){
										userDataService.user = data.user; 
										$location.path(data.url);
								} else {
										alert("LOGIN FAILED");
								}
						}).
						error(function(data, status){
								console.log(data);	
								console.log(status);	
						});
				}
		};
});

quizApp.controller('quizController', function($scope, $http, $location, userDataService){
		$scope.user = userDataService.user;
		$scope.question = "What is the most common 6-letter placeholder name in programming languages?";
		$scope.questionNb = 0;
		$scope.score = 0;
		$scope.highscore = 0;
		$scope.answerform ={};
		$scope.getHighscore = function(){
				$http({
						method: 'GET',
						url: "/sae/highscores/by_name?key="+userDataService.user,
				})
				.success(function(data, status){
						$scope.highscore = data[0].value.score;
						userDataService.highscore = data[0].value.score;
						userDataService.highscoreRev = data[0].value._rev;
				}).
				error(function(data, status){
						console.log(data);	
						console.log(status);	
				});
		};
		$scope.updateHighscore = function(score){
				$http({
						method: 'PUT',
						url: "/sae/highscores/add",
						data: { name : userDataService.user,
								_rev : userDataService.highscoreRev,
								score : score
						}
				})
				.success(function(data, status){
						console.log(data);
						if(data.ok){
								$scope.highscore = score;
								userDataService.highscore = score;
								userDataService.highscoreRev = data.rev;
						}
				}).
				error(function(data, status){
						console.log(data);	
						console.log(status);	
				});

		};
		$scope.submit = function(){
				if($scope.answerform.answer){
						$http({
								method: 'PUT',
								url: "/sae/quiz",
								data: $scope.answerform
						})
						.success(function(data, status){
								if(data.ok){
										lastScore = data.score;
										if(data.finished){
												alert("You finshed the quiz with "+ data.finalScore +" points. \n Restarting quiz.");
												lastScore = data.finalScore;
										} 
										$scope.score = data.score;	
										$scope.questionNb = data.questionNb;	
										$scope.question = data.question;	
										$scope.answerform.answer = "<your answer here>";
										if(lastScore > userDataService.highscore){
												$scope.updateHighscore(lastScore);
										}
								}
						}).
						error(function(data, status){
								console.log(data);	
								console.log(status);	
						});
				}
		};
		$scope.logout = function(){
				//only possible because it's not httpOnly
				$http({ 
					method: 'GET',
					url: '/sae/users/logout'
				})
				.success(function(data,status){
					console.log(data);
					$location.path("/");
				}).
				error(function(data, status){
					console.log("Try client-side cookie deletion");
					delete_cookie("csession");
					delete_cookie("XSRF-TOKEN");
					$location.path("/");
				});
		};
		//execute getHighscore to fetch it initially.
		$scope.getHighscore();
});

function delete_cookie(name) {
		document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}	
