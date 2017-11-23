var fs = require('fs');
var geojsonArea = require('geojson-area');
var turf = require('turf');
eval(fs.readFileSync('bin/util.js') + ""); //Include util.js in a traditional "c" style manner

var content = "", geographical_compactness, geojson, area, perimeter;

content += "district,compactness\n";

for(var i = 0; i < 435; i++){
  geojson = JSON.parse(fs.readFileSync("./raw/districts/" + district_codes[i] + "/shape.geojson").toString());
  area = geojsonArea.geometry(geojson.geometry); //in meters squared
  perimeter = turf.lineDistance(geojson.geometry, 'kilometers') * 1000; //meters
  geographical_compactness = 4 * Math.PI * area / (perimeter * perimeter); //Using Polsby Popper method

  content += district_codes[i] + "," + geographical_compactness + "\n";
}

fs.writeFileSync("compactness.csv", content);
