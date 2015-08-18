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

var svg = d3.select("#mapdiv")
	.append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("id", "mapsvg");

var map_g = svg.append("g");
	
svg.append("rect")
	.attr("class", "overlay")
	.attr("width", width)
	.attr("height", height)
	.style("stroke", "black");

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
		//Some data points have improper lat/long.
		//Also, it's convenient to store the index here
		data = data.filter(function(d) { return d.FlowStationLocation.Longitude != 0; })
			.map(function(d, i) {d["index"] = i; return d;});
		flow = d3.nest()
			.key(function(d) {return d.FlowStationLocation.Direction + d.FlowStationLocation.RoadName;})
			.sortValues(function(a, b) {return a.FlowStationLocation.MilePost - b.FlowStationLocation.MilePost;})
			.entries(data);
		
		//Create two copies of every flow station: one to be held in place, and the other (visible) to be forced according to traffic
		//The two nodes will be linked together
		var fixed_nodes = data.map(function(d, i)
			{
				return {"x":d.FlowStationLocation.Longitude, "y":d.FlowStationLocation.Latitude, "fixed":true};
			});
		var forced_nodes = fixed_nodes.map(function(d) {d["fixed"] = false; return d; });
		
		var nodes = forced_nodes.concat(fixed_nodes);
		
		//Create links between the two nodes for each station
		var links = forced_nodes.map(function(d, i)
			{
				return {"source":i, "target":i+forced_nodes.length, "dist":0};
			});
		
		//Create links between adjacent nodes
		flow.forEach(function(road)
			{
				road.values.forEach(function(d, i)
					{
						if (i+1 < road.values.length)
						{
							links.push({"source":d.index, "target":road.values[i+1].index, "dist":flow_station_dist(d, road.values[i+1])});
						}
					});
			});
		
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
		
		function flow_station_dist(a, b)
		{	
			return Math.sqrt(
				Math.pow(a.FlowStationLocation.Longitude-b.FlowStationLocation.Longitude,2) +
				Math.pow(a.FlowStationLocation.Latitude-b.FlowStationLocation.Latitude,2));
		}
	});