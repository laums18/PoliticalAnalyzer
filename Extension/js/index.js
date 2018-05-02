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
				{file: "js/historyTwitter.js"});
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
     	//document.getElementById('alertButton').addEventListener('click', executeScript);
		//document.getElementById('historyButton').addEventListener('click', executeHistory);
}


var app = angular.module("myApp", []);

app.controller("page", ['$scope', function($scope) {

	$scope.data = {};
	$scope.data.twitter = null;

	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if (request.greeting == "twitter") {
				$scope.data.tweeting = false;
				$scope.data.twitter = request.data
				$scope.$apply();
			}
		});

	$scope.twitterHistory = function() {
		if($scope.data.twitter == null) {
			$scope.data.tweeting = true;
			executeScript();
		}
		else {

		}
	}


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

	$scope.plotWordsTwitter = function() {
		if($scope.data.twitter == null) {
			alert("Please import twitter data first")
			return
		}
		$scope.data.t1l = true;
		$.ajax({
			type: "POST",
			url: "http://localhost:5000/words_twitter",
			data: {
				tweets: $scope.data.twitter
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
		        .selector('#wordcloudtwitter')
		        .scale('linear')
		        .words(result.result)
		        .start();
		        $scope.data.t1l = false;
		        $scope.data.t1 = true;
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

	$scope.sentiment_map = function() {
		$scope.data.sent_mapping = true;
		$.ajax({
			type: "GET",
			url: "http://localhost:5000/sentiment_map",
			data: {
			},
			dataType: 'json',
			success: function(result) {
				if("error" in result) {
					alert(result);
					$scope.data.sent_mapping = false;
					return;
				} 
				console.log(result)
				$scope.data.result3 = result.result
				draw3PieceChord(result.result, 
								"#sent_map_container", 
								false,
								0, 
								["Positive", "Negative", "Neutral"],
								["pos", "neg", "neut"],
								"senty_map");
				$scope.data.sent_mapping = false;
		        $scope.$apply()
			},
			failure: function(err, result) {
				console.log(err)
			},
			cache: false
		})	
	}

	$scope.classify_map = function() {
		$scope.data.class_mapping = true;
		$.ajax({
			type: "GET",
			url: "http://localhost:5000/classify_map",
			data: {
			},
			dataType: 'json',
			success: function(result) {
				if("error" in result) {
					$scope.data.class_mapping = false;
					return;
				} 
				console.log(result)
				$scope.data.result4 = result.result
				draw3PieceChord(result.result, 
								"#class_map_container", 
								true, 1, 
								["Republican", "Demeocrat", "Independent"],
								["rep", "dem", "ind"],
								"classy_map");
				$scope.data.class_mapping = false;
		        $scope.$apply()
			},
			failure: function(err, result) {
				console.log(err)
			},
			cache: false
		})	
	}


	$scope.dendro = function() {
		$scope.data.dendro = true;
		$.ajax({
			type: "GET",
			url: "http://localhost:5000/dendrogram",
			data: {
			},
			dataType: 'json',
			success: function(result) {
				if("error" in result) {
					$scope.data.class_mapping = false;
					return;
				} 
				console.log(result)
				$scope.data.result5 = result.result
				radDend("#dendro", result.result)
				$scope.data.dendro = false;
		        $scope.$apply()
			},
			failure: function(err, result) {
				console.log(err)
			},
			cache: false
		})
	}

	$scope.directed = function() {
		$scope.data.directed = true;
		$.ajax({
			type: "GET",
			url: "http://localhost:5000/directed",
			data: {
			},
			dataType: 'json',
			success: function(result) {
				if("error" in result) {
					$scope.data.directed = false;
					return;
				} 
				console.log(result)
				$scope.data.result6 = result.result
				directed("#directed", result.result)
				$scope.data.directed = false;
		        $scope.$apply()
			},
			failure: function(err, result) {
				console.log(err)
			},
			cache: false
		})
	}
}]);

function draw3PieceChord(circles, ele, flip, thresh, labels, classes, idss) {
  function makeSafeForCSS(name) {
      return name.replace(/[^a-z0-9]/g, function(s) {
          var c = s.charCodeAt(0);
          if (c == 32) return '-';
          if (c >= 65 && c <= 90) return '_' + s.toLowerCase();
          return '__' + ('000' + c.toString(16)).slice(-4);
      });
  }

  var circopacity = .6;
  var lighten = .09
  console.log(classes)
  var label1 = labels[0]
  var label2 = labels[1]
  var label3 = labels[2]

    // Define the div for the tooltip
  var div = d3.select("body").append("div") 
      .attr("class", "tooltip")      
      .attr("id", ele.substring(1) + "345") 
      .style("opacity", 0);
  var toolid = ele.substring(1) + "345";
  var width = 400, height = 400;
  padding = 0
  ringWidth = 30
  var outerRadius = (width - 2 * padding) / 2,
      innerRadius = outerRadius - ringWidth;

    var arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

  var svg_out = d3.select(ele).append("svg")
    .attr("width", width).attr("height", height).attr("id", idss)

  var svg = svg_out.append("g")
      .attr("transform", "translate(" + padding + "," + padding + ")");

  for(var i = 0; i < circles.children.length; i++) {
  	if(circles.children[i].pos < thresh) {
  		circles.children[i].pos = 0
  	}
  	if(circles.children[i].neg < thresh) {
  		circles.children[i].neg = 0
  	}
  	if(circles.children[i].neutral < thresh) {
  		circles.children[i].neutral = 0
  	}

  }

  pos = []
  neg = []
  neutral = []
  for(var i = 0; i < circles.children.length; i++) {
    if(circles.children[i].pos > circles.children[i].neg && circles.children[i].pos > circles.children[i].neutral) {
      pos.push(circles.children[i])
    } else if(circles.children[i].neg > circles.children[i].neutral){
      neg.push(circles.children[i])
    } else {
      neutral.push(circles.children[i])
    }

  }

  total = 0
  totalp = 0
  totalneutral = 0;
  for(var i = 0; i < circles.children.length; i++) {
    total += circles.children[i].pos + circles.children[i].neg + circles.children[i].neutral
    totalp += circles.children[i].pos
    totalneutral +=  circles.children[i].neutral
  }

  numArcs = 0
  numP = 0
  for(var i = 0; i < circles.children.length; i++) {
    if (circles.children[i].pos > 0) {
      numArcs++;
      numP++;
    }
    if (circles.children[i].neg > 0)
      numArcs++;
    if (circles.children[i].neutral > 0)
      numArcs++;

  }

  totaln = total - totalp - totalneutral
  currentp = 0
  currentn = -splitDist
  currentneutral = 0;
  var splitDist = Math.PI/ 360
  tn = totaln / total * (2 *  Math.PI - numArcs * splitDist)
  tp = totalp / total * (2 *  Math.PI - numArcs * splitDist)
  tneutral = totalneutral / total * (2 *  Math.PI - numArcs * splitDist)
  console.log(neutral)
  var circles = {
    "name": "All",
    "value": 120,
    "children": [
          {
            "name": "Pos",
            "value": 40,
            "children": pos
          },
          {
            "name": "Neg",
            "value": 40,
            "children": neg
          },
      ]}
    if(neutral.length > 0) {
    	circles["children"].push({
            "name": "Neutral",
            "value": 40,
            "children": neutral
          });
    }


  for(var i = 0; i < circles.children.length; i++) {
    
  }

  var pack = d3.layout.pack()
      .size([outerRadius, outerRadius])
      .padding(10);
    var nodes = pack.nodes(circles)

    if(flip){
	    for(var i = 0; i < nodes.length; i++) {
	      nodes[i].x = (outerRadius / 2 - nodes[i].x) + outerRadius / 2
	      nodes[i].y = (outerRadius / 2 - nodes[i].y) + outerRadius / 2
	    }
	}
	for(var i = 0; i < nodes.length; i++) {
		d = nodes[i]
		if(d.pos > d.neg && d.pos > d.neutral)
	        nodes[i].color =  classes[0]
          else if(d.neg > d.neutral)
            nodes[i].color = classes[1]
          else
            nodes[i].color = classes[2];
    }


  // tn = totaln / total * 2 *  Math.PI
  // tp = totalp / total * 2 *  Math.PI
  var diagonal = d3.svg.diagonal()
      .source(function(d) { return {"x":d.y, "y":d.x}; })            
      .target(function(d) { return {"x":d.ty, "y":d.tx}; })
      .projection(function(d) { return [d.y, d.x]; });

  var links = []
  var shapes = []
  var arcs = []
  currentp = 0
  currentn = -splitDist

  currentneutral = splitDist * numP + tp

  normTot = 0
  var names = []
  for (var i = nodes.length - 1; i >= 0; i--) {
    if(!nodes[i].children) {

      if(nodes[i].pos != 0) {
        start = currentp
        end = currentp + (nodes[i].pos / total ) * (2 *  Math.PI - numArcs * splitDist)

        normTot += (nodes[i].pos / total )
        currentp = end + splitDist
        sx = Math.cos(start - Math.PI / 2) * innerRadius + innerRadius / 2 + ringWidth / 2
        sy = Math.sin(start - Math.PI / 2) * innerRadius + innerRadius / 2 + ringWidth / 2
        ex = Math.cos(end - Math.PI / 2) * innerRadius + innerRadius / 2 + ringWidth / 2
        ey = Math.sin(end - Math.PI / 2) * innerRadius + innerRadius / 2 + ringWidth / 2

        arcs.push({startAngle: start, endAngle: end, class: classes[0]})

       link1 = {x: nodes[i].x, y: nodes[i].y, tx: sx, ty: sy}
       link2 = {tx: nodes[i].x, ty: nodes[i].y, x: ex, y: ey}


      var path = d3.path();
            path.moveTo(sx, sy);
            path.arc(innerRadius / 2 + ringWidth / 2, innerRadius / 2 + ringWidth / 2,
                      innerRadius,
                      start - Math.PI / 2,
                      end - Math.PI / 2,
                      false
                      );

       var path1 = diagonal(link1);
        var path2 = diagonal(link2).replace(/^M/, 'L');
        var path3 = path.toString().replace(/^M/, 'L');
        var shape = path1 + path3 + path2 + 'Z';
        names.push({n: nodes[i].name, s: shape, c: "links " + classes[0] + " p" + makeSafeForCSS(nodes[i].name), v: nodes[i].neg, v2: nodes[i].pos, v3: nodes[i].neutral, t: nodes[i].neg + nodes[i].pos + nodes[i].neutral, x: nodes[i].x, y: nodes[i].y, r: nodes[i].r, value: nodes[i].value})
      }
        if(nodes[i].neg != 0) {
        start = currentn
        end = currentn - (nodes[i].neg / total ) * (2 *  Math.PI - numArcs * splitDist)
        currentn = end - splitDist
        sx = Math.cos(start - Math.PI / 2) * innerRadius + innerRadius / 2 + ringWidth / 2
        sy = Math.sin(start - Math.PI / 2) * innerRadius + innerRadius / 2 + ringWidth / 2
        ex = Math.cos(end - Math.PI / 2) * innerRadius + innerRadius / 2 + ringWidth / 2
        ey = Math.sin(end - Math.PI / 2) * innerRadius + innerRadius / 2 + ringWidth / 2
        arcs.push({startAngle: start, endAngle: end, class: classes[1]})

        var path = d3.path();
        path.moveTo(sx, sy);
        path.arc(innerRadius / 2 + ringWidth / 2, innerRadius / 2 + ringWidth / 2,
                  innerRadius,
                  start - Math.PI / 2,
                  end - Math.PI / 2,
                  true
                  );

       link1 = {x: nodes[i].x, y: nodes[i].y, tx: sx, ty: sy}
       link2 = {tx: nodes[i].x, ty: nodes[i].y, x: ex, y: ey}
       var path1 = diagonal(link1);
        var path2 = diagonal(link2).replace(/^M/, 'L');
        var path3 = path.toString().replace(/^M/, 'L');
        var shape = path1 + path3 + path2 + 'Z';
        names.push({n: nodes[i].name, s: shape, c: "links " + classes[1] + " p" + makeSafeForCSS(nodes[i].name), v: nodes[i].neg , v2: nodes[i].pos, v3: nodes[i].neutral, t: nodes[i].neg + nodes[i].pos + nodes[i].neutral, x: nodes[i].x, y: nodes[i].y, r: nodes[i].r, value: nodes[i].value})
      }
      if(nodes[i].neutral != 0) {
        start = currentneutral
        end = currentneutral + (nodes[i].neutral / total ) * (2 *  Math.PI - numArcs * splitDist)
        currentneutral = end + splitDist
        sx = Math.cos(start - Math.PI / 2) * innerRadius + innerRadius / 2 + ringWidth / 2
        sy = Math.sin(start - Math.PI / 2) * innerRadius + innerRadius / 2 + ringWidth / 2
        ex = Math.cos(end - Math.PI / 2) * innerRadius + innerRadius / 2 + ringWidth / 2
        ey = Math.sin(end - Math.PI / 2) * innerRadius + innerRadius / 2 + ringWidth / 2
        arcs.push({startAngle: start, endAngle: end, class: classes[2]})
       link1 = {x: nodes[i].x, y: nodes[i].y, tx: sx, ty: sy}
       link2 = {tx: nodes[i].x, ty: nodes[i].y, x: ex, y: ey}


      var path = d3.path();
            path.moveTo(sx, sy);
            path.arc(innerRadius / 2 + ringWidth / 2, innerRadius / 2 + ringWidth / 2,
                      innerRadius,
                      start - Math.PI / 2,
                      end - Math.PI / 2,
                      false
                      );

       var path1 = diagonal(link1);
        var path2 = diagonal(link2).replace(/^M/, 'L');
        var path3 = path.toString().replace(/^M/, 'L');
        var shape = path1 + path3 + path2 + 'Z';
        names.push({n: nodes[i].name, s: shape, c: "links " + classes[2] + " p" + makeSafeForCSS(nodes[i].name), v: nodes[i].neg, v2: nodes[i].pos, v3: nodes[i].neutral, t: nodes[i].neg + nodes[i].pos + nodes[i].neutral, x: nodes[i].x, y: nodes[i].y, r: nodes[i].r, value: nodes[i].value})
      }
      
    }
  }

  console.log("Final", currentp, normTot)

  svg.selectAll(".arc")
    .data(arcs)
    .enter()
    .append("path")
    .attr("class", function(d) { return d.class})
    .attr("d", arc)
    .attr("transform", function(d) { return "translate(" + (outerRadius) + "," + (outerRadius)+ ")"; })
    .on("mouseover", function(d) {   
              div.transition()    
                  .duration(200)    
                  .style("opacity", .9);    
              div .html("<span style='font-weight: bold'>Positive:</span> " + "<br/>" + (totalp / total * 100).toFixed(1) + "%")  
                  .style("left", (d3.event.pageX) + "px")   
                  .style("top", (d3.event.pageY - 28) + "px");  
              })          
          .on("mouseout", function(d) {   
              div.transition()    
                  .duration(500)    
                  .style("opacity", 0); 
          });

  var svg = svg_out.append("g")
    .attr("transform", "translate(" + (padding+ outerRadius / 2) + "," + (padding + outerRadius / 2) + ")")

  var path = svg.selectAll(".chooords")
      .data(names).enter().append('path')
      .attr("class", function(d) {return d.c})
      .attr("d",  function(d) {return d.s;})
      .on("mouseover", function(d) {  
              d3.selectAll(".links").style("fill-opacity", lighten)
               d3.selectAll(".circ").style("fill-opacity", lighten)
              d3.select(this).style("fill-opacity", .76)
              d3.selectAll(".p" + makeSafeForCSS(d.n)).style("fill-opacity", .76)
              d3.selectAll(".p" + makeSafeForCSS(d.n)).filter(".circ")
              .style("stroke-width", "8px")
              .style("stroke", "#ffffff")
              .style("stroke-opacity", ".8")

              div.transition()    
                  .duration(200)    
                  .style("opacity", .9); 
              var bodyRect = document.body.getBoundingClientRect()
              div.html("<span style='font-weight: bold'>" +  d.n + "</span> <div> " + d.value + " pages</div><hr/>" + "<div><span style='font-weight: bold'>" + label1 + " : </span>" + (d.v / d.t * 100).toFixed(1) + "%</div>"  + "<div><span style='font-weight: bold'>" + label2 + " : </span>" + (d.v2 / d.t * 100).toFixed(1) + "%</div>" + "<div><span style='font-weight: bold'>" + label3 + " : </span>" + (d.v3 / d.t * 100).toFixed(1) + "%</div>")  
              var divRect = document.getElementById(idss).getBoundingClientRect()
              var divR = document.getElementById(toolid).getBoundingClientRect()
              div.style("left", divRect.left - bodyRect.left + bodyRect.left + d.x + (padding + outerRadius / 2) - divR.width / 2+ "px")   
                  .style("top",  divRect.top - bodyRect.top + d.r + 20 + d.y + (padding + outerRadius / 2) + "px");    
              })          
          .on("mouseout", function(d) {  
              div.transition()    
                  .duration(500)    
                  .style("opacity", 0); 
              d3.selectAll(".links").style("fill-opacity", .2)
              d3.selectAll(".circ").style("fill-opacity", circopacity)
              d3.selectAll(".p" + makeSafeForCSS(d.n)).filter(".circ")
              .style("stroke-width", "0px")
              .style("stroke", "#ffffff")
              .style("stroke-opacity", ".8")
          });

  var node = svg.selectAll(".node")
        .data(nodes).enter()
      .append("g")
        .attr("class", function(d) { return "node " + d.color})
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"});
  node.append("circle")
        .attr("r",function(d) { return d.children ? 0 : d.r;  })
        .attr("fill", function(d) { 
          if(d.children)
            return "#fff";
          return d.color;
          }) //make nodes with children invisiblechildren invisible
        .attr("stroke-width", 0)
        .attr("class", function(d) {
          if(d.children)
            return "backLayer";
          return "circ " + "p" + makeSafeForCSS(d.name);
        })
        .on("mouseover", function(d) {   

              if(d.children )
                return

              d3.selectAll(".links").style("fill-opacity", lighten)
               d3.selectAll(".circ").style("fill-opacity", lighten)
              d3.select(this).style("fill-opacity", .76)
              d3.selectAll(".p" + makeSafeForCSS(d.name)).style("fill-opacity", .76)
              d3.selectAll(".p" + makeSafeForCSS(d.name)).filter(".circ")
              .style("stroke-width", "8px")
              .style("stroke", "#ffffff")
              .style("stroke-opacity", ".8")

              div.transition()    
                  .duration(200)    
                  .style("opacity", .9); 
              d.t = d.pos + d.neg + d.neutral
              
              div.html("<span style='font-weight: bold'>" +  d.name + "</span> <div> " + d.value + " pages</div><hr/>" +"<div><span style='font-weight: bold'>" + label1 + " : </span>" + (d.pos / d.t * 100).toFixed(1) + "%</div>"  + "<div><span style='font-weight: bold'>" + label2 + " : </span>" + (d.neg / d.t * 100).toFixed(1) + "%</div>" + "<div><span style='font-weight: bold'>" + label3 + " : </span>" + (d.neutral / d.t * 100).toFixed(1) + "%</div>")  
              var bodyRect = document.body.getBoundingClientRect()
              var divRect = document.getElementById(idss).getBoundingClientRect()
              var divR = document.getElementById(toolid).getBoundingClientRect()
              div.style("left", divRect.left - bodyRect.left + bodyRect.left + d.x + (padding + outerRadius / 2) - divR.width / 2 + "px")   
                  .style("top",  divRect.top - bodyRect.top + d.r + 20 + d.y + (padding + outerRadius / 2) + "px");  
              })          
          .on("mouseout", function(d) {  
              if(d.children )
                return 
              div.transition()    
                  .duration(500)    
                  .style("opacity", 0);
              d3.selectAll(".links").style("fill-opacity", .2)
              d3.selectAll(".circ").style("fill-opacity", circopacity) 
              d3.selectAll(".p" + makeSafeForCSS(d.name)).filter(".circ")
              .style("stroke-width", "0px")
          });
}
extCount = 0
function radDend(ele, data) {
		width = 650
	    height = 650
	var svg = d4.select(ele).append("svg").attr("width", width + 50).attr("height", height + 50)


	var g = svg.append("g").attr("transform", "translate(" + (width / 2 + 40) + "," + (height / 2 + 40) + ")");

	var stratify = d4.stratify()
	    .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf("#")); });

	var tree = d4.tree()
	    .size([2 * Math.PI, 250])
	    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });
	  
	  var root = tree(stratify(data));
	  //var nodes = tree.nodes(data)

	  var link = g.selectAll(".linkD")
	    .data(root.links())
	    .enter().append("path")
	      .attr("class", "linkD")
	      .attr("d", d4.linkRadial()
	          .angle(function(d) { return d.x; })
	          .radius(function(d) { return d.y; }));


	  console.log(root.descendants())

	  var node = g.selectAll(".nodeD")
	    .data(root.descendants())
	    .enter().append("g")
	      .attr("class", function(d) { return "nodeD" + (d.children ? " node--internalD" : " node--leafD"); })
	      .attr("transform", function(d) { return "translate(" + radialPoint(d.x, d.y) + ")"; });

	  node.append("circle")
	      .attr("r", 2.5);

	  node.append("text")
	      .attr("dy", "0.31em")
	      .attr("x", function(d) { return d.x < Math.PI === !d.children ? 6 : -6; })
	      .attr("text-anchor", function(d) { return d.x < Math.PI === !d.children ? "start" : "end"; })
	      .attr("transform", function(d) { return "rotate(" + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ")"; })
	      .text(function(d, i) {return true || ((d.data.value < 2)|| (i % (20 * (d.data.value)) == 0)) ? d.id.substring(d.id.lastIndexOf("#") + 1) : ""; })
	      .style("font-size", "8px")
	function radialPoint(x, y) {
	  return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
	}
}

function directed(ele, data) {
	width = 1200
	height = 600

	  var div = d3.select("body").append("div") 
      .attr("class", "tooltip")      
      .attr("id", ele.substring(1) + "345") 
      .style("opacity", 0);
  var toolid = ele.substring(1) + "345";

	var svg = d4.select(ele).append("svg").attr("width", width).attr("height", height)

	var color = d4.scaleOrdinal(d4.schemeCategory20);

	var simulation = d4.forceSimulation()
	    .force("link", d4.forceLink().id(function(d) { return d.id; }))
	    .force("charge", d4.forceManyBody())
	    .force("center", d4.forceCenter(width / 2, height / 2));

	graph = data

	  var link = svg.append("g")
	      .attr("class", "linksDir")
	    .selectAll("line")
	    .data(graph.links)
	    .enter().append("line")
	      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

	  var node = svg.append("g")
	      .attr("class", "nodesDir")
	    .selectAll("circle")
	    .data(graph.nodes)
	    .enter().append("circle")
	      .attr("r", 5)
	      .attr("fill", function(d) { return d.color})
	      .on("mouseover", function(d) {
		       div.transition()
		         .duration(200)
		         .style("opacity", .9);
		       	  div.html(d.id)
		         .style("left", (d4.event.pageX) + 100 + "px")
		         .style("top", (d4.event.pageY - 28) + "px");
		       })
		     .on("mouseout", function(d) {
		       div.transition()
		         .duration(500)
		         .style("opacity", 0);
		       })
	      .call(d4.drag()
	          .on("start", dragstarted)
	          .on("drag", dragged)
	          .on("end", dragended));

	  node.append("title")
	      .text(function(d) { return d.id; });

	  simulation
	      .nodes(graph.nodes)
	      .on("tick", ticked);

	  simulation.force("link")
	      .links(graph.links);

	  function ticked() {
	    link
	        .attr("x1", function(d) { return Math.min(Math.max(d.source.x,5), width - 5); })
	        .attr("y1", function(d) { return Math.min(Math.max(d.source.y,5), height - 5); })
	        .attr("x2", function(d) { return Math.min(Math.max(d.target.x,5), width - 5); })
	        .attr("y2", function(d) { return Math.min(Math.max(d.target.y,5), height - 5); });

	    node
	        .attr("cx", function(d) { return Math.min(Math.max(d.x,5), width - 5); })
	        .attr("cy", function(d) { return Math.min(Math.max(d.y,5), height - 5); });
	  }

	function dragstarted(d) {
	  if (!d4.event.active) simulation.alphaTarget(0.3).restart();
	  d.fx = d.x;
	  d.fy = d.y;
	}

	function dragged(d) {
	  d.fx = d4.event.x;
	  d.fy = d4.event.y;
	}

	function dragended(d) {
	  if (!d4.event.active) simulation.alphaTarget(0);
	  d.fx = null;
	  d.fy = null;
	}

}