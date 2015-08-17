var width = 480, height = 960;

var zoom = d3.behavior.zoom()
	.scaleExtent([1,8])
	.on("zoom", zoomed);

var proj = d3.geo.mercator()
	.center([-121.33, 47.9])
	.scale(10000)

var svg = d3.select("#map")
	.append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g");

var map_g = svg.append("g");
	
svg.append("rect")
	.attr("class", "overlay")
	.attr("width", width)
	.attr("height", height);

svg.call(zoom)
	.call(zoom.event);

function zoomed()
{
	map_g.attr("transform", "translate("  + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

d3.csv("stationlocation.csv",
	function(data)
	{	
		map_g.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
			.attr("fill", "steelblue")
			.attr("r", 2)
			.attr("cx", function(d) {console.log(d); return proj([+d["Longitude"], +d["Latitude"]])[0];})
			.attr("cy", function(d) {return proj([+d["Longitude"], +d["Latitude"]])[1];});
		
	});