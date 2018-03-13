var fs = require('fs');
/* jshint ignore:start */
eval(fs.readFileSync('../bin/util.js') + ""); //Include util.js in a traditional "c" style manner
/* jshint ignore:end */
postal_codes.sort();

var csv = fs.readFileSync("master.csv").toString().split("\n");

var districts = [];

for(var i = 1; i < csv.length - 1; i++){
  districts.push({
    name: district_codes[i - 1],
    gerrymander_score: parseInt(csv[i].split(",")[10]),
    compactness_score: parseFloat(csv[i].split(",")[5])
  });
}

var sorted = districts.slice().sort(function(a,b){
  return b.gerrymander_score - a.gerrymander_score;
});

var content = "name\n";
for(var i = 0; i < 10; i++){
  content += sorted[i].name + "\n";
}

//fs.writeFileSync("gerrymandering_ranks.csv", content, "utf-8");

sorted = districts.slice().sort(function(a,b){
  return a.compactness_score - b.compactness_score;
});


var content = "name\n";
var limit = 10;
for(var i = 0; i < limit; i++){
  if(sorted[i].name.split("-")[1] === "0") limit++;
  else content += sorted[i].name + "\n";
}

fs.writeFileSync("compactness_ranks.csv", content, "utf-8");
