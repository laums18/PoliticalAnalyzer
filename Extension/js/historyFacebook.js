var db = [];
var myInfinity = 10000000000;
console.log("HI")

function getLinks () {
	//var user = document.evaluate('//strong[@class="fullname show-popup-with-id u-textTruncate"]/b', document, null, XPathResult.ANY_TYPE, null);
	var user = document.evaluate('//a/@href', document, null, XPathResult.ANY_TYPE, null)
	var iterator = user.iterateNext();
	var users = [];

	var count = 0;
	while(iterator) {
		var text = iterator.textContent;
		if(text.length > 12 && text.substr(0,12) == "https://l.fa")
			users.push(text);
			count++;
		iterator = user.iterateNext();
		
	}
	console.log(count)

	return users;
}


function linksCounter() {
	var links = getLinks();
	var linksLength = links.length;
	console.log(links.length)
	return linksLength;
}


function startScraping(linksAmount) {
	var links = getLinks();
	//var users = getUsers();

	var linksLength = links.length;

	for(var i = 0; i <= linksAmount - 1; i++) {
		var item = {"Link": links[i]};
		db.push(item);
	};

	var json_text = JSON.stringify(db, null, 2);
	console.log(json_text);
}


function scrollBottom(linksAmount) {
	setTimeout(function timeOut() {
		var linksLength = linksCounter();
		
		if (linksLength < linksAmount) {
			window.scrollTo(0,document.body.scrollHeight);
			scrollBottom(linksAmount);
		}
		else {
			startScraping(linksAmount);		
		}

	}, 1000);
}


scrollBottom(10);
