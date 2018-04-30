function onExecuted(result) {
  console.log("Good");
}

function onError(error) {
  console.log("Error");
}
console.log("Starting")

function executeScript (tab) {
	
	chrome.tabs.create({url: "https://twitter.com", active: false}, function(tab) {

		setTimeout(function () {
			console.log(tab.id)
			chrome.tabs.executeScript(
				tab.id,
				{file: "js/historyTwitter.js"},
				async function(result) {
					console.log("resssss")
					console.log(result)
					console.log(typeof(result[0]))
					var x = await result[0]
					console.log(x)
				});
		}, 5000);
	})

	// chrome.tabs.create({url: "https://facebook.com", active: false}, function(tab) {

	// 	setTimeout(function () {
	// 		console.log(tab.id)
	// 		chrome.tabs.executeScript(
	// 			tab.id,
	// 			{file: "js/historyFacebook.js"},
	// 			function(result){
	// 				console.log(result);
	// 			}
	// 		);
	// 		console.log("exec")
	// 	}, 5000);

	// })

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

  chrome.history.search({"text": "", "startTime": 0 , "maxResults": 1000000000}, function callback(results) {

	var json= JSON.stringify(results);
	console.log(JSON.parse(json));


   var qurl="http:127.0.0.1:5000/receiver";
   $.ajax({
            type: "POST",
            cache: false,
            data: {
            	history: json
            },
            url: qurl,
            dataType: "json",
            success: function(data) { 
                console.log(data);                    
            },
            failure: function(error) {
                alert("error: " + error.status);
                console.log(error);
            }
        })


	}) 
}


window.onload = function() {
	console.log("HI")
     	document.getElementById('alertButton').addEventListener('click', executeScript);
		document.getElementById('historyButton').addEventListener('click', executeHistory);
}


var app = angular.module("myApp", []);

app.controller("page", ['$scope', function($scope) {

	$scope.data = {};


	$scope.plotWords = function() {
		$scope.data.wording = true;
		$.ajax({
			type: "POST",
			url: "http://localhost:5000/words",
			data: {
			},
			dataType: 'json',
			success: function(result) {
				console.log(result)
				if("Error" in result) {
					alert(result);
					return;
				} 
				d3.wordcloud()
		        .size([700, 300])
		        .selector('#wordcloud')
		        .scale('linear')
		        .words(result.result)
		        .start();
		        $scope.data.wording = false;
		        $scope.data.show = true;
		        $scope.$apply()
			},
			failure: function(err, result) {
				console.log(err)
			},
			cache: false
		})	

	}


	$scope.donut = function(ele, result) {
		dataset = result;
	// 	var dataset = [
	//     { type: 'IE', value: 39.10 },
	//     { type: 'Chrome', value: 32.51 },
	//     { type: 'Safari', value: 13.68 },
	//     { type: 'Firefox', value: 8.71 },
	//     { type: 'Others', value: 6.01 }
	// ];
 
var pie=d3.layout.pie()
  .value(function(d){return d.value})
  .sort(null)
  //.padAngle(.03);
 
var w=300,h=300;
 
var outerRadius=w/2;
var innerRadius=100;
 
var color = d3.scale.category10();
 
var arc=d3.svg.arc()
  .outerRadius(outerRadius)
  .innerRadius(innerRadius);
 d3.select("#" + ele + "1567").remove()
var svg=d3.select("#" + ele)
  .append("svg")
  .attr("id", ele + "1567")
  .attr({
      width:w,
      height:h,
      class:'shadow'
  }).append('g')
  .attr({
      transform:'translate('+w/2+','+h/2+')'
  });
  console.log(dataset)
  console.log(pie(dataset))
var path=svg.selectAll('path')
  .data(pie(dataset))
  .enter()
  .append('path')
  .attr({
      d:arc,
      fill:function(d){
          return d.data.color;
      }
  });
 
path.transition()
  .duration(1000)
  .attrTween('d', function(d) {
      var interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
      return function(t) {
          return arc(interpolate(t));
      };
  });
 
 
var restOfTheData=function(){
    var text=svg.selectAll('text')
	        .data(pie(dataset))
	        .enter()
	        .append("text")
	        .transition()
	        .duration(200)
	        .attr("transform", function (d) {
	            return "translate(" + arc.centroid(d) + ")";
	        })
	        .attr("dy", ".4em")
	        .attr("text-anchor", "middle")
	        .text(function(d){
	            return d.data.value.toFixed(1)+"%";
	        })
	        .style({
	            fill:'#fff',
	            'font-size':'10px'
	        });
	 
	    var legendRectSize=20;
	    var legendSpacing=7;
	    var legendHeight=legendRectSize+legendSpacing;
	 
	 
	    var legend=svg.selectAll('.legend')
	        .data(dataset)
	        .enter()
	        .append('g')
	        .attr({
	            class:'legend',
	            transform:function(d,i){
	                //Just a calculation for x & y position
	                return 'translate(-35,' + ((i*legendHeight)-65) + ')';
	            }
	        });
	    legend.append('rect')
	        .attr({
	            width:legendRectSize,
	            height:legendRectSize,
	            rx:20,
	            ry:20
	        })
	        .style({
	            fill: function(d) {return d.color},
	            stroke: function(d) {return d.color}
	        });
	 
	    legend.append('text')
	        .attr({
	            x:30,
	            y:15
	        })
	        .text(function(d){
	            return d.type;
	        }).style({
	            fill:'#929DAF',
	            'font-size':'14px'
	        });
	};
	 
	setTimeout(restOfTheData,1000);
	}
	//$scope.donut();

	$scope.classify = function() {
		$scope.data.classifying = true;
		$.ajax({
			type: "POST",
			url: "http://localhost:5000/classify",
			data: {
			},
			dataType: 'json',
			success: function(result) {
				console.log(result)
				if("Error" in result) {
					alert(result);
					return;
				} 
				$scope.data.classifying= false;
				$scope.data.result = result.result;
				$scope.donut("drdonut", result.result);
		        $scope.$apply()
			},
			failure: function(err, result) {
				console.log(err)
			},
			cache: false
		})	
	}

	$scope.sentiment = function() {
		$scope.data.senting = true;
		$.ajax({
			type: "POST",
			url: "http://localhost:5000/sentiment",
			data: {
			},
			dataType: 'json',
			success: function(result) {
				console.log(result)
				if("Error" in result) {
					alert(result);
					return;
				} 
				$scope.data.senting = false;
				$scope.data.result2 = result.result;
				$scope.donut("sentdonut", result.result);
		        $scope.$apply()
			},
			failure: function(err, result) {
				console.log(err)
			},
			cache: false
		})	
	}
}]);