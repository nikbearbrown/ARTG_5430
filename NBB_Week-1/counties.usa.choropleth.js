const margin = {t: 50, r:50, b: 50, l: 50};
const size = {w: 800, h: 800};
const svg = d3.select('svg');

svg.attr('width', size.w)
    .attr('height', size.h);

const files = ['data/maps/us-counties.geo.json', 'data/mortality_cardiovascular_diseases_counties.json'];
const promises = [];
Promise.all([
    d3.json(files[0]),
    d3.json(files[1])
]).then(function (datasets) {
    let mapData = datasets[0],
        df = datasets[1];

    let mapSize = {
            w: size.w - margin.l - margin.r,
            h: size.h - margin.t - margin.b
        };
    let g = svg.append('g')
        .classed('map', true)
        .attr('transform', 'translate('+margin.l+','+margin.t+')');
    let pathSelection = drawMap(mapData, g, mapSize);

    choroplethiseMap(pathSelection, df);
});



function drawMap (mapData, ele, size) {

    const newLocal = d3.geoAlbersUsa()
        .fitSize([size.w, size.h], mapData);
    let projection = newLocal;

    let geoPath = d3.geoPath(projection);

    let pathSelection = ele.selectAll('path')
        .data(mapData.features)
        .enter()
        .append('path')
        .attr('id', (d) => d.properties.GEO_ID)
        .attr('d', (d) => geoPath(d));
    
    // returning the path selection (d3 selection)
    // for other functions to utilise the geo-data attached 
    return pathSelection;
}

function choroplethiseMap (pathSelection, data) {

    // creating a color scale to translate
    // pctChange age to respective colors
    const colorScale = d3.scaleSequential()
        // the domain is the [min, max] pctChange age
        .domain(d3.extent(data, d => +d.pctChange))
        // the range is the color-gradient from yellow-green-blue
        .interpolator(d3.interpolatePuRd);

    // time to fill the SVG path of the region with respective color
    pathSelection.style('fill', function(d) {
        // each path is related to a geographic region
        // we are filtering out the region's life expectancy data
        console. log(data)
        let region = data.filter(e => e.geoID === d.properties.GEO_ID);
        // this returns an array
        // if pctChange data exists for a region, the array will be non-empty
        if (region.length > 0) {
            // pctChange is measured for that region
            region = region[0];
            // translate pctChange to color
            return colorScale(region.pctChange);
        }

        // if no data exists, we return a light grey
        return '#43464B';
    })
};