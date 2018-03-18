
function executeScript (tab) {
	//scrollBottom(100);
	chrome.tabs.create({url: "https://twitter.com", active: false}, function(tab) {

		setTimeout(function () {
		console.log(tab.id)
		chrome.tabs.executeScript(tab.id, {file: "js/history.js"});
		console.log("exec")
		}, 5000);
	})
	
}


window.onload = function() {
	console.log("HI")
    	document.getElementById('alertButton').addEventListener('click', executeScript);
}
