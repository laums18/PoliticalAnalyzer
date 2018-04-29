//chrome.tabs.create({url: 'index.html'});

app.controller("page", ['$scope', function($scope) {

	$scope.data = {};

	$scope.openTab = function() {
		chrome.tabs.create({url: 'index.html'});
	}

}]);