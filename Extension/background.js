chrome.runtime.onInstalled.addListener(function() {
	chrome.history.search({"text": "", "startTime": 0 , "maxResults": 1000000000}, function callback(results) {

		var json= JSON.stringify(results);
		console.log(JSON.parse(json));


	   var qurl="http:127.0.0.1:5000/initialUpdate";
	   $.ajax({
	            type: "POST",
	            cache: false,
	            data: {
	            	history: json
	            },
	            url: qurl,
	            dataType: "json",
	            success: function(returnData) { 
	                console.log(returnData);                    
	            },
	            failure: function(error) {
	                alert("error: " + error.status);
	                console.log(error);
	            }
	        })
	}) 
});

chrome.tabs.onUpdated.addListener(function(id, info, tab) {
	if(info.status != ("complete"))
		return;

	var qurl="http:127.0.0.1:5000/receiver";
	$.ajax({
        type: "POST",
        cache: false,
        data: {
        	history: JSON.stringify([tab.url])
        },
        url: qurl,
        dataType: "json",
        success: function(data) { 
        	console.log(data)
        	data = JSON.stringify(data.result)
        	value = parseInt(data)
        	data = value.toFixed(0).toString()
            chrome.browserAction.setBadgeText({text: data})
			
			if(value > 2)
				chrome.browserAction.setBadgeBackgroundColor({
					color: [255, 0, 0, 255]
				})
			else if(value < -2)
				chrome.browserAction.setBadgeBackgroundColor({
					color: [0, 0, 255, 255]
				})
			else
				chrome.browserAction.setBadgeBackgroundColor({
					color: [0, 255, 0, 255]
				})			                 
        },
        failure: function(error) {
            alert("error: " + error.status);
            console.log(error);
        }
    })
    console.log("sent", tab.url)
});	