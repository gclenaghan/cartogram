var width = 480, height = 540;

var proj = d3.geo.mercator()
	.center([-121.33, 47.9])
	.scale(10000);

var zoom = d3.behavior.zoom()
	.translate(proj.translate())
	.scale(proj.scale())
	.scaleExtent([10000,80000])
	.on("zoom", zoomed);


var road_line = d3.svg.line()
	.x(function(d) { return proj([d.FlowStationLocation.Longitude, d.FlowStationLocation.Latitude])[0]; })
	.y(function(d) { return proj([d.FlowStationLocation.Longitude, d.FlowStationLocation.Latitude])[1]; })
	.interpolate("basis");

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
	proj.translate(d3.event.translate).scale(d3.event.scale);
	map_g.selectAll("circle")
		.attr("cx", function(d)
			{
				return proj([d.FlowStationLocation.Longitude, d.FlowStationLocation.Latitude])[0];
			})
		.attr("cy", function(d)
			{
				return proj([d.FlowStationLocation.Longitude, d.FlowStationLocation.Latitude])[1];
			});
	map_g.selectAll("path")
		.attr("d", function(d) { return road_line(d.values); });
}

var flow;
d3.json("wsdottrafficflow8172015.json",
	function(data)
	{
		data = data.filter(function(d) { return d.FlowStationLocation.Longitude != 0; });
		flow = d3.nest()
			.key(function(d) {return d.FlowStationLocation.Direction + d.FlowStationLocation.RoadName;})
			.sortValues(function(a, b) {return a.FlowStationLocation.MilePost - b.FlowStationLocation.MilePost;})
			.entries(data);
		
		map_g.selectAll("path")
			.data(flow)
			.enter()
			.append("path")
			.attr("class", "road")
			.attr("id", function(d) {return d.key; })
			.attr("d", function(d) { return road_line(d.values); });
		
		map_g.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
			.attr("class", function(d) {return "station val" + d.FlowReadingValue;})
			.attr("r", function(d) {return d.FlowReadingValue + 1;})
			.attr("cx", function(d)
				{
					return proj([d.FlowStationLocation.Longitude, d.FlowStationLocation.Latitude])[0];
				})
			.attr("cy", function(d)
				{
					return proj([d.FlowStationLocation.Longitude, d.FlowStationLocation.Latitude])[1];
				});
	});