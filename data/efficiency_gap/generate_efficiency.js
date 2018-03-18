var fs = require('fs');
var extract = require('pdf-text-extract');
/* jshint ignore:start */
eval(fs.readFileSync('../../bin/util.js') + ""); //Include util.js in a traditional "c" style manner
/* jshint ignore:end */

var content = "district,efficiency_gap\n";

/*
and then averaged those percentages to find each state’s
overall percentage gap. This calculated percentage gap was then multiplied by the number of districts in the
state to find the seat gap.
*/

//Do i count unconteseted districts?

function convertTextToVotes(text){
  var votes = text.split(/\n[0-9]+\. /g);
  if(votes.length > 1) votes[0] = votes[0].replace("1. ", "");

  votes = votes.map(function(district){ //Clean up JSON
    return district.split("\n").map(function(candidate){
      candidate = candidate.replace(/, Jr./, "").replace(/[^,]+, /i, "").split(" ");

      return {
        votes: parseInt(candidate[candidate.length - 1].replace(/,/g, "")),
        party: candidate.slice(0, candidate.length - 1).join(" ")
      };
    })
    .filter(function(candidate){ //IMPORTANT: Only get Republican and Democrat candidates
      return candidate.party == "Republican" || candidate.party == "Democrat";
    })
    .sort(function(a, b){
      return b.votes - a.votes;
    });
  })
  .map(function(district){
    var numRepublican = 0, numDemocrat = 0;
    for(var i = 0; i < district.length; i++){
      if(district[i].party == "Republican") numRepublican++;
      else if(district[i].party == "Democrat") numDemocrat++;
    }
    return {
      candidates: district,
      numRepublican: numRepublican,
      numDemocrat: numDemocrat
    };
  })
  .map(function(district){ //Calculate values
    var total_votes = district.candidates.reduce(function(total, candidate){
      return !isNaN(candidate.votes) ? total + candidate.votes : total;
    }, 0);
    var winner = district.candidates.reduce(function(a, b) {
      return Math.max(a, b.votes);
    }, 0);

    var dem_wasted = 0;
    var rep_wasted = 0;

    if(district.numRepublican == 0 || district.numDemocrat == 0){ //If uncontested
      total_votes = Math.round(total_votes * 4/3); //Presume 25 % of the votes went to the loser
      if(district.numRepublican == 0) rep_wasted = Math.round(total_votes / 4);
      if(district.numDemocrat == 0) dem_wasted = Math.round(total_votes / 4);
    }

    var votes_needed_to_win = Math.round(total_votes / 2) + 1;

    for(var i = 0; i < district.candidates.length; i++){
      if(district.candidates[i].votes == winner) wasted = district.candidates[i].votes - votes_needed_to_win;
      else wasted = district.candidates[i].votes;

      if(district.candidates[i].party == "Republican") rep_wasted += wasted;
      else if(district.candidates[i].party == "Democrat") dem_wasted += wasted;
    }

    return {
      candidates: district.candidates,
      total_votes: total_votes,
      votes_needed_to_win: votes_needed_to_win,
      dem_wasted: dem_wasted,
      rep_wasted: rep_wasted,
      efficiency_gap: (dem_wasted - rep_wasted) / total_votes,
      uncontested: (district.numRepublican == 0 || district.numDemocrat == 0)
    };
  });

  return votes;
}

//Read pdf
extract("./2016electionORIGINAL.pdf", {
  crop: {
    w: 612,
    h: 720,
    y: 70,
    x: 0
  }
}, function (err, pages) {
  if(err) throw err;

  // ** Clean up document **
  var deleteMode = false;
  var text = pages.slice(2, 81) //Slice off extra pages
  .toString()
  .replace(/\.{2,}/g, "") //Remove lines of periods
  .replace(/ {2,}/g, " ") //Trim whitespace
  .replace(/\n /g, "\n") //Trim space in front of each line
  .split("\n").filter(function(line){ //Remove non-house elections
    if(line == "FOR PRESIDENTIAL ELECTORS") deleteMode = true;
    else if(line == "FOR UNITED STATES REPRESENTATIVE") deleteMode = false;

    return !deleteMode;
  });

  deleteMode = false;

  text = text.filter(function(line){ //Remove recapitulation
    if(line.includes("Recapitulation of Votes")) deleteMode = true;
    else if(/[A-Z]{2,}$/.test(line)) deleteMode = false;

    return !deleteMode;
  }).join("\n")
  .replace(/, [A-Z| ]{2,}—Continued\n(FOR UNITED STATES REPRESENTATIVE—Continued)?/g, "") //Remove "Continued" markings
  .replace(/^((\n|.)*?)ALABAMA/g, "ALABAMA") //Remove everything before the first state
  .replace(/FOR UNITED STATES REPRESENTATIVE\n(AT LARGE\n)?/g, "") //Remove representative text under each state
  .replace(/\n, /g, "\n") //Replace weird commas
  .replace(/\n{2,}/g, "\n") //Replace excess line breaks
  .replace(/PUERTO RICO(\n|.)+/g, ""); //Remove everything after Puerto Rico

  // ** Split document by states and parse out the votes **
  var states = [];
  var lines = text.split("\n");
  var startIndex = 0;
  var stateName = "";

  for(var i = 0; i < lines.length; i++){
    if(/^[A-Z ]{2,}$/g.test(lines[i])){
      if(i != 0){
        states.push({
          name: stateName,
          votes: convertTextToVotes(lines.slice(startIndex + 1, i).join("\n"))
        });
      }

      startIndex = i;
      stateName = lines[i];
    }
  }

  states.push({
    name: stateName,
    votes: convertTextToVotes(lines.slice(startIndex + 1).join("\n"))
  });

  // ** Calculate efficiency gap for each state **
  var stateEfficiencyGaps = [];
  var stateEfficiencyGapsPercent = [];

  states.forEach(function(state){
    var efficiency_gap, efficiency_gap_percent;

    if(state.votes.length <= 6){ //For states with less than 6 districts
      efficiency_gap = null;
      efficiency_gap_percent = null;
    }
    else{
      var numDistricts = 0, aggregatePercent = 0;

      state.votes.forEach(function(vote){
        if(!isNaN(vote.efficiency_gap)){
          aggregatePercent += vote.efficiency_gap;
          numDistricts++;
        }
      });

      efficiency_gap_percent = aggregatePercent / numDistricts;
      efficiency_gap = Math.round(efficiency_gap_percent * state.votes.length); //Convert to seat count

      if(efficiency_gap < 0) efficiency_gap = "D" + -1 * efficiency_gap;
      else if(efficiency_gap > 0) efficiency_gap = "R" + efficiency_gap;
      else efficiency_gap = "N" + efficiency_gap;

      if(efficiency_gap_percent < 0) efficiency_gap_percent = "D" + -1 * efficiency_gap_percent;
      else if(efficiency_gap_percent > 0) efficiency_gap_percent = "R" + efficiency_gap_percent;
      else efficiency_gap_percent = "N" + efficiency_gap_percent;
    }

    stateEfficiencyGaps.push(efficiency_gap);
    stateEfficiencyGapsPercent.push(efficiency_gap_percent);
  });

  for(var dist = 0; dist < district_codes.length; dist++){
    content += district_codes[dist] + "," + stateEfficiencyGaps[postal_codes.indexOf(district_codes[dist].split("-")[0])] + "," + stateEfficiencyGapsPercent[postal_codes.indexOf(district_codes[dist].split("-")[0])] + "\n";
  }

  //fs.writeFileSync("test.json", JSON.stringify(states));
  fs.writeFileSync("../efficiency.csv", content);
});
