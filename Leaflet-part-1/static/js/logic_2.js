//create the tilelayer for the map
let tilemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
let topomap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});


// setting the base layer for the map
let map = L.map("map", {
    center: [38.50, -96.00],
    zoom: 3,
    layers:[tilemap,topomap]
});

tilemap.addTo(map)
topomap.addTo(map)

// Create an object to add to the layer control.
let baseMaps ={
    "Basic Map": tilemap,
    "Topography": topomap
};

//Defining earthquake_data and tectonic plates as layers
let earthquakes= new L.LayerGroup();
let tectonics = new L.layerGroup();

//Create an overlay object to hold the layergroup
let overlays = {
    "Tectonic Plates": tectonics,
    "Earthquakes": earthquakes
};

//Adding a control layer
L.control.layers(baseMaps, overlays).addTo(map);


//Calling Earthquake data and creating markers
//Data source 
var url= "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

//Fetching the data from the url and console log
d3.json(url).then(function(data){
    console.log(data);


//creating markers and marker properties
//marker styles
function markerstyle(feature){
    return {
        color:chooseColor(feature.geometry.coordinates[2]),
        radius: chooseRadius(feature.properties.mag),
        fillColor:chooseColor(feature.geometry.coordinates[2]),
        weight: 1,
        fillOpacity: 0.5
    }
};

//Define the function to chose color
function chooseColor(depth) {
    switch(true){
        case depth>90:
            return"red";
        case depth >70:
            return"orangered";
        case depth >50:
            return"orange";
        case depth >30:
            return"gold";
        case depth >10:
            return"yellow";
        default:
            return"blue";
    }
} 

//Define the function to size the marker
function chooseRadius (magnitude){
    return magnitude*3;
};

//reference the earthquake data  to populate the marker popup information

    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, box) {
        box.bindPopup(`<div class="map-popup"><a href="${feature.properties.url}">${feature.properties.place}</a></div><br>
        <div class="map-popup-warning"> For more information, click on the location name.</div>
        <div class="map-popup-exp">
          <span>Time: </span> ${new Intl.DateTimeFormat().format(new Date(feature.properties.time))} <br>
          <span>Location: </span> ${feature.geometry.coordinates[0]} , ${feature.geometry.coordinates[1]} <br>
          <span>Depth: </span> ${feature.geometry.coordinates[2]} km <br>
          <span>Magnitude: </span> ${feature.properties.mag}
        </div>`);
    }
    // Create a GeoJSON layer containing the features array on the earthquakeData object
      
    L.geoJSON(data,{
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng){
            return L.circleMarker(latlng);
        },
        style:markerstyle
    }).addTo(earthquakes);

earthquakes.addTo(map);
});

//reference the tectonic plates data and draw a purple line over the plates
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plates_data){
    L.geoJSON(plates_data, {
        color:"purple",
        weight: 2
    }).addTo(tectonics);
    tectonics.addTo(map);
});

//Create a legend
let legend = L.control({ position: "bottomright" });
legend.onAdd = function(_map) {
    let div = L.DomUtil.create("div", "legend");     
       div.innerHTML += "<h4>Depth Color Legend</h4>";
       div.innerHTML += '<i style="backgroundColor: blue"></i><span>(depth < 10)</span><br>';
       div.innerHTML += '<i style="backgroundColor: yellow"></i><span>(10 < depth <= 30)</span><br>';
       div.innerHTML += '<i style="backgroundColor: gold"></i><span>(30 < depth <= 50)</span><br>';
       div.innerHTML += '<i style="backgroundColor: orange"></i><span>(50 < depth <= 70)</span><br>';
       div.innerHTML += '<i style="backgroundColor: orangered"></i><span>(70 < depth <= 90)</span><br>';
       div.innerHTML += '<i style="backgroundColor: red"></i><span>(depth > 90)</span><br>';
  
    return div;
}
  //add the legend to the map
  legend.addTo(map);

 