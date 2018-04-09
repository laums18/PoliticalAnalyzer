
var db = [];
var myInfinity = 10000000000;
var output = [];
console.log("Twitter Started")

function getUsers () {
	//var user = document.evaluate('//strong[@class="fullname show-popup-with-id u-textTruncate"]/b', document, null, XPathResult.ANY_TYPE, null);
	var user = document.evaluate('//strong[@class="fullname show-popup-with-id u-textTruncate "]', document, null, XPathResult.ANY_TYPE, null)
	var iterator = user.iterateNext();
	var users = [];

	while(iterator) {
		users.push(iterator.textContent);
		iterator = user.iterateNext();
	}

	return users;
}


function getTweets() {
	var tweet = document.evaluate('//p[@class="TweetTextSize  js-tweet-text tweet-text"]', document, null, XPathResult.ANY_TYPE, null);
	var iterator = tweet.iterateNext();

	var tweets = [];
	var ll = 0;
	while (iterator) {
		tweets.push(iterator.textContent);
		ll += 1
		iterator = tweet.iterateNext();
	}

	return tweets;
}


function tweetsCounter() {
	var tweets = getTweets();
	var tweetsLength = tweets.length;
	console.log(tweets.length)
	return tweetsLength;
}


function startScraping(tweetsAmount, resolve, reject) {
	var tweets = getTweets();
	var users = getUsers();

	var tweetsLength = tweets.length;

	for(var i = 0; i <= tweetsAmount - 1; i++) {
		var item = {"User": users[i], "Tweet": tweets[i]};
		db.push(item);
	};

	var json_text = JSON.stringify(db, null, 2);
	resolve(json_text);

	var vLink = document.createElement('a'),
	vBlob = new Blob([json_text], {type: "octet/stream"}),
	vName = 'tweets.json',
	vUrl = window.URL.createObjectURL(vBlob);
	vLink.setAttribute('href', vUrl);
	vLink.setAttribute('download', vName );
	vLink.click();
	
	return json_text;
}


function scrollBottom(tweetsAmount, resolve, reject) {
	setTimeout(function timeOut() {
		var tweetsLength = tweetsCounter();
		var twitterData;

		if (tweetsLength < tweetsAmount) {
			window.scrollTo(0, document.body.scrollHeight);
			scrollBottom(tweetsAmount, resolve, reject);
		}
		else {
			twitterData = startScraping(tweetsAmount,resolve, reject);
		}
		return twitterData;

	}, 1000);
}

var promise = new Promise(function(resolve, reject) {
	scrollBottom(10, resolve, reject);
	console.log("DOne")
})
console.log(promise)
promise;