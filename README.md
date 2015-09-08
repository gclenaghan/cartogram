#Seattle Traffic Cartogram

This is a work-in-progress side project using D3.js to visualize traffic data
in the Seattle area (actually all of Washington state, but Seattle has the most data).
The idea is that, rather than show slowdowns in traffic via colors or similar,
the path of the road itself changes, stretching and curving where heavy traffic lies,
making it intuitively clear that the road will take longer than it appeared while straight.

It is setup to take JSON data directly from [WSDOT's traffic flow API](http://wsdot.com/traffic/api/) without alterations.

To create the curves, a D3 force layout is used. This is a pseudo-physics simulation
of a graph of nodes connected by springy links, each spring has a natural length
and creates a force on the nodes to shorten or lengthen the spring depending on
its current length; the movement seen is the movement of the nodes under these forces.
In particular, for each flow station, two nodes are created, one fixed and one free.
The free and fixed versions of each station are connected by a link of length 0, and consecutive
nodes on a particular road are connected by a link with length some multiple of the true distance
of the flow stations depending on how heavy traffic is. Then, a path is drawn interpolating
between the free nodes for each road. In the end, each free node is pulled towards its true
location but is pushed away from nearby nodes in heavy traffic, typically creating zigzags
in those areas.

View it here: http://gclenaghan.github.io/cartogram/

##Potential future features:
 * Live traffic
 * Ability to filter which roads are shown, by name or direction of travel.
