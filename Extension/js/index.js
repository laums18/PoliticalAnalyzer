
function executeScript (tab) {
	//scrollBottom(100);
	// chrome.tabs.create({url: "https://twitter.com", active: false}, function(tab) {

	// 	setTimeout(function () {
	// 	console.log(tab.id)
	// 	chrome.tabs.executeScript(tab.id, {file: "js/historyTwitter.js"});
	// 	console.log("exec")
	// 	}, 5000);
	// })

	chrome.tabs.create({url: "https://facebook.com", active: false}, function(tab) {

		setTimeout(function () {
		console.log(tab.id)
		chrome.tabs.executeScript(tab.id, {file: "js/historyFacebook.js"}, function(db){ console.log(db); });
		console.log("exec")
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
}) 
}


window.onload = function() {
	console.log("HI")
    	document.getElementById('alertButton').addEventListener('click', executeScript);
		document.getElementById('historyButton').addEventListener('click', executeHistory);
}
