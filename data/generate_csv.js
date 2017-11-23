var fs = require('fs');
var curl = require('curlrequest');
eval(fs.readFileSync('../bin/util.js') + ""); //Include util.js in a traditional "c" style manner

postal_codes.sort();

var content = "";

function addLine(line){
  content += line + "\n";
}

function generateLine(json){
  return json.district_code + "," + json.rep + "," + json.affiliation + "," + json.state_affiliation + "," + json.efficiency_gap + "," + json.absolute_compactness + "," + json.state_compactness + "," + json.country_compactness + "," + json.compactness_rank + "," + json.redistricting_control + "," + json.gerrymander_score;
}

addLine("district_code,representative,representative_affiliation,state_affiliation,efficiency_gap,absolute_compactness,state_compactness,country_compactness,compactness_rank,redistricting_control,gerrymander_score");

var representatives_parsed = [];

curl.request({
  url: "https://theunitedstates.io/congress-legislators/legislators-current.json"
}, function (err, parts) {
  var representatives = JSON.parse(parts);
  for(var i = 0; i < representatives.length; i++){
    var current_term = representatives[i].terms[representatives[i].terms.length - 1];
    if(current_term.type === "rep"){
      var json_parsed = {
        name: representatives[i].name.official_full.replace(/,/ig, ""),
        party: current_term.party,
        district_code: current_term.state + "-" + current_term.district
      };
      representatives_parsed.push(json_parsed);
    }
  }

  //Get compactness
  var country_avg = 0.0;
  var state_avgs = [];
  var state_districts = [];
  var district_compactness_ranks = [];
  var current_state_i = -1;
  var compactness_csv = fs.readFileSync("compactness.csv").toString().split("\n");

  for(var k = 0; k < 435; k++){
    if(district_codes[k].split("-")[0] !== postal_codes[current_state_i]){
      current_state_i++;
      state_avgs.push(0.0);
      state_districts.push(0);
    }

    district_compactness_ranks.push(parseFloat(compactness_csv[k + 1].split(",")[1]));

    state_avgs[current_state_i] += parseFloat(compactness_csv[k + 1].split(",")[1]);
    state_districts[current_state_i]++;
    country_avg += parseFloat(compactness_csv[k + 1].split(",")[1]);
  }

  var sorted = district_compactness_ranks.slice().sort(function(a,b){return a-b;});
  district_compactness_ranks = district_compactness_ranks.slice().map(function(v){ return sorted.indexOf(v)+1;});

  for(var l = 0; l < 50; l++) state_avgs[l] /= state_districts[l];
  country_avg /= district_codes.length;

  //Get efficiency gap
  var efficiency_csv = fs.readFileSync("efficiency.csv").toString().split("\n");

  //Get Representatives and Affiliation
  current_state_i = -1;
  var states_affiliation = [], state_rep;

  for(var j = 0; j < district_codes.length; j++){
    if(district_codes[j].split("-")[0] !== postal_codes[current_state_i]){
      current_state_i++;
      states_affiliation.push(0);
    }

    for(var k = 0; k < representatives_parsed.length; k++){
      if(representatives_parsed[k].district_code === district_codes[j]) {
        state_rep = representatives_parsed[k];
        break;
      }
    }

    if(state_rep.party === "Republican") states_affiliation[current_state_i]++;
    else states_affiliation[current_state_i]--;

  }

  for(var j = 0; j < district_codes.length; j++){
    var rep;
    for(var k = 0; k < representatives_parsed.length; k++){
      if(representatives_parsed[k].district_code === district_codes[j]) {
        rep = representatives_parsed[k];
        break;
      }
    }

    var absolute_compactness = parseFloat(compactness_csv[j + 1].split(",")[1]);
    var district = district_codes[j].split("-")[1];
    var efficiency_gap = parseFloat(efficiency_csv[j + 1].split(",")[1].substring(1));

    if(district === "0") gerrymander_score = 0;
    else {
      gerrymander_score = Math.round(50 * (1 - absolute_compactness)) + Math.round(50 * efficiency_gap); //Score is 50% due to geographical compactness, 50% to efficiency gap
    }

    var line = generateLine({
      district_code: district_codes[j],
      rep: rep.name,
      efficiency_gap: efficiency_csv[j + 1].split(",")[1],
      absolute_compactness: absolute_compactness,
      state_compactness: state_avgs[postal_codes.indexOf(district_codes[j].split("-")[0])],
      country_compactness: country_avg,
      affiliation: rep.party,
      state_affiliation: states_affiliation[postal_codes.indexOf(district_codes[j].split("-")[0])],
      gerrymander_score: gerrymander_score,
      compactness_rank: district_compactness_ranks[j],
      redistricting_control: ""
    });

    addLine(line);
  }

  fs.writeFileSync("master.csv", content, "utf-8");
});
