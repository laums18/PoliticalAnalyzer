//chrome.tabs.create({url: 'index.html'});

function drawGauge(ele, num, scale, left, right, color1, color2, labels) {
	w = 220
	h = 150
	var svg=d3.select(ele)
		.append("svg")
		.attr({
			width:w,
			height:h,
		})
		.append('g')
		.attr({
			transform:'translate('+w/2+','+ (h - 30)+')'
		});

	outerRadius = 100;
	innerRadius = 80;

	var arc = d3.svg.arc()
	    .innerRadius(innerRadius)
	    .outerRadius(outerRadius);

	svg.append("path")
	  .attr("d", arc({startAngle: -Math.PI/2, endAngle: Math.PI / 2}))
	  .attr("class", "back")

	svg.append("path")
	  .attr("d", arc({startAngle: 0, endAngle: num / scale * Math.PI / 2}))
	  .attr("class", "on")
	  .attr("fill", num > 0 ? color2 : color1)

	svg.append("text")
		.attr("x", -(outerRadius-10))
		.attr("y", 20)
		.text(left)
		.attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "#888888")
        .style("text-anchor", "middle");

	svg.append("text")
		.attr("x", (outerRadius-10))
		.attr("y", 20)
		.text(right)
		.attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "#888888")
        .style("text-anchor", "middle");
    for(var i = 0; i < labels.length; i++) {
    svg.append("text")
		.attr("x", 0)
		.attr("y", -30 + i * 20)
		.text(labels[i])
		.attr("font-family", "sans-serif")
        .attr("font-size", "15px")
        .attr("fill", "#888888")
        .style("text-anchor", "middle");
    }
	
}
var app = angular.module("myApp", []);
app.controller("page", ['$scope', function($scope) {

	// angular.element(document).ready(function () {
 //        drawGauge("#drgauge", 10, 50, "D.", "R.", "#232066", "#E91D0E", ["D: 40%", "R: 60%"])
 //        drawGauge("#sentimentgauge", .2, 1, "Neg.", "Pos.", "firebrick", "mediumseagreen", ["Magnitude", "18"])
 //    });

	$scope.data = {};
	$scope.data.loading = 0;
	$scope.openTab = function() {
		chrome.tabs.create({url: 'index.html'});
	}

	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
	    $scope.data.loading = true;
	    var qurl="http:127.0.0.1:5000/classify_one";
	    $.ajax({
			type: "GET",
			cache: false,
			data: {
				url: tabs[0].url
			},
			url: qurl,
			dataType: "json",
			success: function(result) {
				if("error" in result) {
					$scope.data.loading = 1;
					$scope.data.error = "Page cannot be accessed";
					$scope.$apply();
					return;
				}
				
			    result = result.result[0];
			    console.log(result)
			    drawGauge("#sentimentgauge", 
			    			result["sentiment"], 
			    			1, 
			    			"Neg.", 
			    			"Pos.", 
			    			"firebrick", 
			    			"mediumseagreen", 
			    			["Score: " + result["sentiment"].toFixed(2), "Magnitude: " + result["magnitude"].toFixed(2)]
			    			)  
			    var num = 0;
			    var labels = []
			    for(var i = 0; i < result.classify_data.length; i++) {
			    	if(result.classify_data[i].type == "D") {
			    		labels.push("D: " + result.classify_data[i].value.toFixed(1) + "%")
			    		if(result.classify_data[i].value > 50) {
			    			num = -(result.classify_data[i].value - 50)
			    		}
			    	}
			    	if(result.classify_data[i].type == "R") {
			    		labels.push("R: " + result.classify_data[i].value.toFixed(1) + "%")
			    		if(result.classify_data[i].value > 50) {
			    			num = result.classify_data[i].value - 50
			    		}
			    	}
			    }  
			    drawGauge("#drgauge", 
			    			num, 
			    			50, 
			    			"D.", 
			    			"R.", 
			    			"#232066", 
			    			"#E91D0E", 
			    			labels)
			    console.log(num, labels)
			    $scope.data.loading = 2;     
			    $scope.$apply();              
			},
			failure: function(error) {
			    $scope.data.loading = 1;
				$scope.data.error = "Page cannot be accessed";
			    console.log(error);
			}
		})
	});

}]);