const urls = {
  // source: https://gist.github.com/mbostock/7608400
  airports:
    "./list_of_dorms.csv",

  // source: https://gist.github.com/mbostock/7608400
  flights:
    "./connections.csv"
};

const svg = d3.select("svg");

const width = parseInt(svg.attr("width"));
const height = parseInt(svg.attr("height"));
const hypotenuse = Math.sqrt(width * width + height * height);

const minLat = 42.368868;
const maxLat = 42.38248309999999;
const minLon = -71.124731;
const maxLon = -71.115963;

const midLat = (maxLat + minLat) / 2;
const midLon = (maxLon + minLon) / 2;
const scale = 600000 * 1.5;
const projection = d3.geoMercator().scale(scale).center([midLon, midLat]).translate([240 * 1.5,150 * 1.5]);
const scales = {
  airports: d3.scaleSqrt()
    .range([4, 18]),
  segments: d3.scaleLinear()
    .domain([0, hypotenuse])
    .range([1, 10])
};
const g = {
  basemap: svg.select("g#basemap"),
  flights: svg.select("g#flights"),
  airports: svg.select("g#airports"),
  voronoi: svg.select("g#voronoi")
};
const tooltip = d3.select("text#tooltip");

const promises = [
  d3.csv(urls.airports, typeAirport),
  d3.csv(urls.flights, typeFlight)
];

Promise.all(promises).then(processData);

// process airport and flight data
function processData(values) {
  console.assert(values.length === 2);

  let airports = values[0];
  let flights = values[1];

  console.log("airports: " + airports.length);
  console.log(" flights: " + flights.length);

  // convert airports array (pre filter) into map for fast lookup
  let iata = new Map(airports.map(node => [node.iata, node]));
  console.log(iata)

  // calculate incoming and outgoing degree based on flights
  // flights are given by airport iata code (not index)
  flights.forEach(function (link) {
    link.source = iata.get(link.origin);
    link.target = iata.get(link.destination);

    link.source.outgoing += link.count;
    link.target.incoming += link.count;
  });
  console.log(airports)

  // done filtering airports can draw
  drawAirports(airports);
  drawPolygons(airports);

  // reset map to only include airports post-filter

  // done filtering flights can draw
  drawFlights(airports, flights);

  console.log({ airports: airports });
  console.log({ flights: flights });
}

function drawAirports(airports) {
  // adjust scale
  const extent = d3.extent(airports, d => d.outgoing);
  scales.airports.domain(extent);

  // draw airport bubbles
  g.airports.selectAll("circle.airport")
    .data(airports, d => d.iata)
    .enter()
    .append("circle")
    .attr("r", d => scales.airports(d.outgoing) / 2)
    .attr("cx", d => d.x) // calculated on load
    .attr("cy", d => d.y) // calculated on load
    .attr("class", "airport")
    .each(function (d) {
      // adds the circle object to our airport
      // makes it fast to select airports on hover
      d.bubble = this;
    });
}

function drawPolygons(airports) {
  // convert array of airports into geojson format
  const geojson = airports.map(function (airport) {
    return {
      type: "Feature",
      properties: airport,
      geometry: {
        type: "Point",
        coordinates: [airport.longitude, airport.latitude]
      }
    };
  });

  // calculate voronoi polygons
  const polygons = d3.geoVoronoi().polygons(geojson);
  console.log(polygons);

  g.voronoi.selectAll("path")
    .data(polygons.features)
    .enter()
    .append("path")
    .attr("d", d3.geoPath(projection))
    .attr("class", "voronoi")
    .on("mouseover", function (d) {
      let airport = d.properties.site.properties;

      d3.select(airport.bubble)
        .classed("highlight", true);

      d3.selectAll(airport.flights)
        .classed("highlight", true)
        .raise();

      // make tooltip take up space but keep it invisible
      tooltip.style("display", null);
      tooltip.style("visibility", "hidden");

      // set default tooltip positioning
      tooltip.attr("text-anchor", "middle");
      tooltip.attr("dy", -scales.airports(airport.outgoing) - 4);
      tooltip.attr("x", airport.x);
      tooltip.attr("y", airport.y);

      // set the tooltip text
      tooltip.text(airport.iata);

      // double check if the anchor needs to be changed
      let bbox = tooltip.node().getBBox();

      if (bbox.x <= 0) {
        tooltip.attr("text-anchor", "start");
      }
      else if (bbox.x + bbox.width >= width) {
        tooltip.attr("text-anchor", "end");
      }

      tooltip.style("visibility", "visible");
    })
    .on("mouseout", function (d) {
      let airport = d.properties.site.properties;

      d3.select(airport.bubble)
        .classed("highlight", false);

      d3.selectAll(airport.flights)
        .classed("highlight", false);

      d3.select("text#tooltip").style("visibility", "hidden");
    })
    .on("dblclick", function (d) {
      // toggle voronoi outline
      let toggle = d3.select(this).classed("highlight");
      d3.select(this).classed("highlight", !toggle);
    });
}
function drawFlights(airports, flights) {
  let bundle = generateSegments(airports, flights);
  let line = d3.line()
    .curve(d3.curveBundle)
    .x(airport => airport.x)
    .y(airport => airport.y);

  let links = g.flights.selectAll("path.flight")
    .data(bundle.paths)
    .enter()
    .append("path")
    .attr("d", line)
    .attr("class", "flight")
    .each(function (d) {
      // adds the path object to our source airport
      // makes it fast to select outgoing paths
      d[0].flights.push(this);
    });
  let layout = d3.forceSimulation()
    // settle at a layout faster
    .alphaDecay(0.08)
    // nearby nodes attract each other
    .force("charge", d3.forceManyBody()
      .strength(0.15)
      .distanceMax(scales.airports.range()[1] * 2)
    )
    // edges want to be as short as possible
    // prevents too much stretching
    .force("link", d3.forceLink()
      .strength(0.5)
      .distance(0)
    )
    .on("tick", function (d) {
      links.attr("d", line);
    })
    .on("end", function (d) {
      console.log("layout complete");
    });

  layout.nodes(bundle.nodes).force("link").links(bundle.links);
}
function generateSegments(nodes, links) {
  let bundle = { nodes: [], links: [], paths: [] };

  // make existing nodes fixed
  bundle.nodes = nodes.map(function (d, i) {
    d.fx = d.x;
    d.fy = d.y;
    return d;
  });

  links.forEach(function (d, i) {
    // calculate the distance between the source and target
    let length = distance(d.source, d.target);

    // calculate total number of inner nodes for this link
    let total = Math.round(scales.segments(length));

    // create scales from source to target
    let xscale = d3.scaleLinear()
      .domain([0, total + 1]) // source, inner nodes, target
      .range([d.source.x, d.target.x]);

    let yscale = d3.scaleLinear()
      .domain([0, total + 1])
      .range([d.source.y, d.target.y]);

    // initialize source node
    let source = d.source;
    let target = null;

    // add all points to local path
    let local = [source];

    for (let j = 1; j <= total; j++) {
      // calculate target node
      target = {
        x: xscale(j),
        y: yscale(j)
      };

      local.push(target);
      bundle.nodes.push(target);

      bundle.links.push({
        source: source,
        target: target
      });

      source = target;
    }

    local.push(d.target);

    bundle.links.push({
      source: target,
      target: d.target
    });

    bundle.paths.push(local);
  });

  return bundle;
}
function typeAirport(airport) {
  airport.longitude = parseFloat(airport.longitude);
  airport.latitude = parseFloat(airport.latitude);

  // use projection hard-coded to match topojson data
  const coords = projection([airport.longitude, airport.latitude]);

  airport.x = coords[0];
  airport.y = coords[1];

  airport.outgoing = 0;  // eventually tracks number of outgoing flights
  airport.incoming = 0;  // eventually tracks number of incoming flights

  airport.flights = [];  // eventually tracks outgoing flights

  return airport;
}
function typeFlight(flight) {
  flight.count = parseInt(flight.count);
  return flight;
}
function distance(source, target) {
  const dx2 = Math.pow(target.x - source.x, 2);
  const dy2 = Math.pow(target.y - source.y, 2);
  return Math.sqrt(dx2 + dy2);
}
