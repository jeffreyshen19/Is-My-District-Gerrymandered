/*
  GENERATE SVG
  Converts Geojson files to SVG files
*/

var geojson2svg = require('geojson2svg');
var converter = geojson2svg({});
var fs = require('fs');

fs.readdir("./raw/districts", function(err, files) {
  for(var i = 0; i < files.length; i++){
    if(fs.lstatSync("./raw/districts/" + files[i]).isDirectory()){
      var contents = JSON.parse(fs.readFileSync("./raw/districts/" + files[i] + "/shape.geojson", "utf8"));
      var svg = converter.convert(contents, {type: "LineString"});
      console.log(svg);
      //if(!fs.existsSync("./processed/districts/" + files[i])) fs.mkdirSync("./processed/districts/" + files[i]);
      //fs.writeFileSync("./processed/districts/" + files[i] + "/shape.svg", svg);
      break;


    }
  }
});
