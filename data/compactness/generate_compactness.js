var fs = require('fs');
/* jshint ignore:start */
eval(fs.readFileSync('../../bin/util.js') + ""); //Include util.js in a traditional "c" style manner
/* jshint ignore:end */

var content = "district,compactness\n";
var lines = fs.readFileSync('compactness_raw.csv').toString().split("\n");

function convertStateFPToPostal(fp){
  var postals = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
  var fpCodes = ["1", "2", "4", "5", "6", "8", "9", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "44", "45", "46", "47", "48", "49", "50", "51", "53", "54", "55", "56"];

  var index = fpCodes.indexOf(fp);
  if(index == -1) return null;

  return postals[index];
}

var line;
var postal_code;
var districts = [];

for(var i = 1; i < 438; i++){
  line = lines[i].split(",");
  postal_code = convertStateFPToPostal(line[0]);
  if(postal_code != null && postal_code != "DC") districts.push({
    "postal_code": postal_code,
    "district_num": line[1],
    "polsby_popper": line[2] / 100.0
  });
}

districts.sort(function(a, b){
  return district_codes.indexOf(a.postal_code + "-" + a.district_num) - district_codes.indexOf(b.postal_code + "-" + b.district_num);
});

districts.forEach(function(district){
  content += district.postal_code + "-" + district.district_num + "," + district.polsby_popper + "\n";
});

fs.writeFileSync("../compactness.csv", content);
