var fs = require('fs');
var curl = require('curlrequest');
/* jshint ignore:start */
eval(fs.readFileSync('../bin/util.js') + ""); //Include util.js in a traditional "c" style manner
/* jshint ignore:end */
postal_codes.sort();

function generateLine(json){ //Generates csv formatted string
  return json.district_code + "," + json.rep + "," + json.affiliation + "," + json.state_affiliation + "," + json.efficiency_gap + "," + json.absolute_compactness + "," + json.state_compactness + "," + json.country_compactness + "," + json.compactness_rank + "," + json.redistricting_control + "," + json.gerrymander_score + "," + json.gerrymander_rank + "," + json.num_districts;
}

var content = "", representatives_parsed = [];
content += "district_code,representative,representative_affiliation,state_affiliation,efficiency_gap,absolute_compactness,state_compactness,country_compactness,compactness_rank,redistricting_control,gerrymander_score,gerrymander_rank,num_districts\n";

curl.request({
  url: "https://theunitedstates.io/congress-legislators/legislators-current.json"
}, function (err, parts) {
  //Generate list of representatives
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
  var states_affiliation = [], district_rep;

  for(var j = 0; j < district_codes.length; j++){
    if(district_codes[j].split("-")[0] !== postal_codes[current_state_i]){
      current_state_i++;
      states_affiliation.push(0);
    }

    for(var m = 0; m < representatives_parsed.length; m++){
      if(representatives_parsed[m].district_code === district_codes[j]) {
        district_rep = representatives_parsed[m];
        break;
      }
    }

    if(district_rep.party === "Republican") states_affiliation[current_state_i]++;
    else states_affiliation[current_state_i]--;

  }

  var gerrymander_rank = [];
  var num_districts_per_state = Array(50).fill(0);

  for(var n = 0; n < district_codes.length; n++){
    num_districts_per_state[postal_codes.indexOf(district_codes[n].split("-")[0])]++;
  }

  for(var n = 0; n < district_codes.length; n++){
    var rep;
    for(var p = 0; p < representatives_parsed.length; p++){
      if(representatives_parsed[p].district_code === district_codes[n]) {
        rep = representatives_parsed[p];
        break;
      }
    }

    var absolute_compactness = parseFloat(compactness_csv[n + 1].split(",")[1]);
    var district = district_codes[n].split("-")[1];
    var efficiency_gap = parseInt(efficiency_csv[n + 1].split(",")[1].substring(1));

    //Get redistricting Control
    var state = district_codes[n].split("-")[0];
    var redistricting_control = "";

    if(district === "0") redistricting_control = "null";
    else{
      var republican_controlled_states = ["UT", "KS", "OK", "TX", "LA", "TN", "AL", "GA", "FL", "SC", "NC", "TN", "VA", "NH", "PA", "OH", "IN", "MI", "WI"];
      var democrat_controlled_states = ["AR", "IL", "WV", "MD", "MA", "RI"];

      if(republican_controlled_states.includes(state)) redistricting_control += "R";
      else if(democrat_controlled_states.includes(state)) redistricting_control += "D";
      else redistricting_control += "I";

      var advisory_commission = ["IA", "OH", "VA", "NY", "RI", "ME"];
      var backup_commission = ["IN", "CT"];
      var politician_commission = ["HI", "NJ"];
      var independent_commission = ["WA", "ID", "CA", "AZ"];

      if(advisory_commission.includes(state)) redistricting_control += "A";
      else if(backup_commission.includes(state)) redistricting_control += "B";
      else if(politician_commission.includes(state)) redistricting_control += "P";
      else if(independent_commission.includes(state)) redistricting_control += "I";
      else redistricting_control += "L";
    }

    if(district === "0") gerrymander_score = 0;
    else {
      gerrymander_score = 0;
      gerrymander_score += -83.623 * absolute_compactness + 75;
      if(parseInt(efficiency_csv[n + 1].split(",")[1].charAt(1)) >= 2) gerrymander_score += 25; //If above tolerable efficiency gap
      if(redistricting_control == 'II') gerrymander_score -= 25;
      gerrymander_score = Math.round(Math.max(gerrymander_score, 0)); //Make sure it's not negative
    }

    gerrymander_rank.push(gerrymander_score);

    var line = generateLine({
      district_code: district_codes[n],
      rep: rep.name,
      efficiency_gap: efficiency_csv[n + 1].split(",")[1],
      absolute_compactness: absolute_compactness,
      state_compactness: state_avgs[postal_codes.indexOf(district_codes[n].split("-")[0])],
      country_compactness: country_avg,
      affiliation: rep.party,
      state_affiliation: states_affiliation[postal_codes.indexOf(district_codes[n].split("-")[0])],
      gerrymander_score: gerrymander_score,
      compactness_rank: district_compactness_ranks[n],
      redistricting_control: redistricting_control,
      gerrymander_rank: "PLACEHOLDER" + n,
      num_districts: num_districts_per_state[postal_codes.indexOf(district_codes[n].split("-")[0])]
    });

    content += line + "\n";
  }

  sorted = gerrymander_rank.slice().sort(function(a,b){return b - a;});
  gerrymander_rank = gerrymander_rank.slice().map(function(v){ return sorted.indexOf(v)+1;});

  for(var z = 0; z < district_codes.length; z++){
    content = content.replace("PLACEHOLDER" + z, gerrymander_rank[z]);
  }

  fs.writeFileSync("master.csv", content, "utf-8");
});
