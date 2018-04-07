function onExecuted(result) {
  console.log("Good");
}

function onError(error) {
  console.log("Error");
}

function executeScript (tab) {
	
	chrome.tabs.create({url: "https://twitter.com", active: false}, function(tab) {

		setTimeout(function () {
			console.log(tab.id)
			chrome.tabs.executeScript(
				tab.id,
				{file: "js/historyTwitter.js"}),
				function(result) {
					console.log(result)
				}
		}, 5000);
	})

	chrome.tabs.create({url: "https://facebook.com", active: false}, function(tab) {

		setTimeout(function () {
			console.log(tab.id)
			chrome.tabs.executeScript(
				tab.id,
				{file: "js/historyFacebook.js"},
				function(result){
					console.log(result);
				}
			);
			console.log("exec")
		}, 5000);

	})

}

function executeTwitter() {   
	
	chrome.tabs.create({url: "https://twitter.com", active: false}, function(tab) {

		setTimeout(function () {
		console.log(tab.id)
		chrome.tabs.executeScript(
			tab.id, 
			{file: "js/historyTwitter.js"}), function(result) {
			console.log(result)
		}
		console.log("Above")
		}, 5000);
	})
}


var executeHistory = function(){

  var myObject = []

  chrome.history.search({"text": "", "maxResults": 1000000000}, function callback(results) {

	for(var i = 0; i < results.length; i++) {
       myObject[i] = results[i].url;
	}
	var json= JSON.stringify(results);
	console.log(JSON.parse(json));
	var vLink = document.createElement('a'),
	vBlob = new Blob([json], {type: "octet/stream"}),
	vName = 'chromeHistory.json',
	vUrl = window.URL.createObjectURL(vBlob);
	vLink.setAttribute('href', vUrl);
	vLink.setAttribute('download', vName );
	vLink.click();
}) 
}


window.onload = function() {
	console.log("HI")
    	document.getElementById('alertButton').addEventListener('click', executeScript);
		document.getElementById('historyButton').addEventListener('click', executeHistory);
}
