chrome.runtime.onInstalled.addListener(function() {
	chrome.history.search({"text": "", "startTime": 0 , "maxResults": 1000000000}, function callback(results) {

		var json= JSON.stringify(results);
		console.log(JSON.parse(json));


	   var qurl="http:127.0.0.1:5000/initialUpdate";

	   
	/*   $.ajax({
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
	        })*/


	}) 
});

var color = function(c,n,i,d){for(i=3;i--;c[i]=d<0?0:d>255?255:d|0)d=c[i]+n;return c}

chrome.tabs.onUpdated.addListener(function(id, info, tab) {
	if(info.status != ("complete"))
		return;
	var qurl="http:127.0.0.1:5000/classify_one";
	$.ajax({
			type: "GET",
			cache: false,
			data: {
				url: tab.url
			},
			url: qurl,
			dataType: "json",
			success: function(result) {
				if("error" in result) {
					chrome.browserAction.setBadgeBackgroundColor({
				    	color: [0,0,0,0],
				    	tabId: tab.id
				    })
					chrome.browserAction.setBadgeText({
				    	text: "ERR",
				    	tabId: tab.id
				    })
					return;
				}
			    result = result.result[0];
			    if(result["sentiment"] > 0)
			    	num = "" + result["sentiment"].toFixed(2)
			   	else {
			   		num = "" + result["sentiment"].toFixed(1)
			   	}
			    var num = 0;
			    var labels = []
			    var r = 255;
			    var g = 255;
			    var b = 255;
			    var opacity = 255;
			    for(var i = 0; i < result.classify_data.length; i++) {
			    	if(result.classify_data[i].type == "D") {
			    		if(result.classify_data[i].value > 50) {
			    			r = 25;
			    			g = 32; 
			    			b = 102;
			    			opacity = (result.classify_data[i].value - 50) / 25
			    			if(opacity > 1)
			    				opacity =  1;
			    			opacity *= 255
			    		}
			    	}
			    	if(result.classify_data[i].type == "R") {
			    		if(result.classify_data[i].value > 50) {
			    			r = 233;
			    			g = 29; 
			    			b = 14;
			    			opacity = (result.classify_data[i].value - 50) / 25
			    			if(opacity >= 1)
			    				opacity =  1;
			    			opacity *= 255
			    		}
			    	}
			    }  
			    var c = color([r, g, b], 255 - opacity)
			    c.push(255)
			    chrome.browserAction.setBadgeBackgroundColor({
			    	color: c,
			    	tabId: tab.id
			    })
			    chrome.browserAction.setBadgeText({
			    	text: num.toString(),
			    	tabId: tab.id
			    })
        
			},
			failure: function(error) {
			    console.log(error);
			}
		})
});	