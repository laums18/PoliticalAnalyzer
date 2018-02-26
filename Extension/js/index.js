chrome.history.search({"text": "", "maxResults": 1000000000}, function callback(results) {
	for(var i = 0; i < results.length; i++) {
		console.log(results[i]);
	}
	console.log(results.length);
})