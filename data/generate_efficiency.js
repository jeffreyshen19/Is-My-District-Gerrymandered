var fs = require('fs');
var extract = require('pdf-text-extract');
/* jshint ignore:start */
eval(fs.readFileSync('../bin/util.js') + ""); //Include util.js in a traditional "c" style manner
/* jshint ignore:end */

var content = "";

function convertToVotes(str){
  str = str.replace("at large", "").replace(/[0-9]+\./g, "").replace(/,/g, ""); //Trim excess words
  str = str.trim();

  var found = str.match(/[0-9]+/g);

  var total_votes = 0;
  for(var i = 0; i < found.length; i++){
  	total_votes += parseInt(found[i]);
  }

  var majority_needed = total_votes % 2 == 0 ? total_votes / 2 + 1 : Math.ceil(total_votes / 2);

  found = str.match(/(republican|democrat|\(republican\)|\(democrat\)) [0-9]+/g);

  var winner = 0;
  var winner_i = -1;
  var votes;

  var democrat_wasted = 0;
  var republican_wasted = 0;
  var affiliation;

  try{
    for(var j = 0; j < found.length; j++){
    	votes = parseInt(found[j].split(" ")[1]);
    	if(votes > winner){
      	winner = votes;
        winner_i = j;
      }
    }

    for(var k = 0; k < found.length; k++){
    	votes = parseInt(found[k].split(" ")[1]);
      if(found[k].indexOf("democrat") != -1) affiliation = "D";
      else affiliation = "R";

      if(i == winner_i){
      	if(affiliation === "D") democrat_wasted += votes - majority_needed;
        else republican_wasted += votes - majority_needed;
      }
      else{
    		if(affiliation === "D") democrat_wasted += votes;
        else republican_wasted += votes;
      }

    }
  }
  catch(e){
    total_votes = 0;
  }

  return {
    republican_wasted: republican_wasted,
    democrat_wasted: democrat_wasted,
    total_votes: total_votes
  };
}

content += "district,efficiency_gap\n";

//Read pdf
extract("./raw/2016election.pdf", {
  splitPages: false,
  firstPage: 3,
  lastPage: 79,
  layout: "raw"
}, function (err, text) {
  if (err) {
    console.dir(err);
    return;
  }

  text = text.toString();

  //Clean up text
  text = text.replace(/\.\.+/g, ""); //Remove lines of periods
  text = text.replace(/\s\s+/g, " "); //Trim whitespace

  //Extract only the salient voting data
  text = text.split(" ");

  var word;
  var state = 0;
  var district = 1;
  var searching = false;
  var currentString = "";

  var votingData = [];

  votingData.push({
    name: state_names[state],
    districts: []
  });

  for(var i = 0; i < text.length; i++){
    word = text[i].toLowerCase();

    if(word === "recapitulation" && i != 47 && (text[i + 5].toLowerCase().split("—")[1] !== "continued" && text[i + 6].toLowerCase().split("—")[1] !== "continued")) { //Stop search when "Recapitulation" is reached
      if(searching) votingData[state].districts.push(convertToVotes(currentString));

      if(state == 49) break;

      state++;
      district = 1;
      searching = false;
      currentString = "";

      votingData.push({
        name: state_names[state],
        districts: []
      });
    }
    else{ //Otherwise, look for 1., 2., 3., etc. and extract voting data for each district
      if(word.includes("" + district + ".") || (word === "at" && text[i - 1].toLowerCase() === "representative")){

        if(searching == true) votingData[state].districts.push(convertToVotes(currentString));
        searching = true;
        currentString = "";
        district++;
      }

      if(searching) currentString += word + " ";
    }
  }

  fs.writeFileSync("election.json", JSON.stringify(votingData));

  var efficiency_gap, stateData, districtData, wastedRepublicanVotes, wastedDemocratVotes, totalVotes, winningThreshold, dem, rep, stateEfficiencyGaps = [];

  for(var s = 0; s < 50; s++){
    stateData = votingData[s];
    totalVotes = 0;
    wastedRepublicanVotes = 0;
    wastedDemocratVotes = 0;

    for(var d = 0; d < stateData.districts.length; d++){
      dem = stateData.districts[d].democrat_wasted;
      rep = stateData.districts[d].republican_wasted;

      if(dem != 0 && rep != 0){
        totalVotes += stateData.districts[d].total_votes;
        wastedDemocratVotes += dem;
        wastedRepublicanVotes += rep;
      }
    }

    efficiency_gap = (wastedDemocratVotes - wastedRepublicanVotes) / totalVotes;

    if(efficiency_gap < 0) efficiency_gap = "D" + -1 * efficiency_gap;
    else if(efficiency_gap > 0) efficiency_gap = "R" + efficiency_gap;
    else efficiency_gap = "N" + efficiency_gap;

    stateEfficiencyGaps.push(efficiency_gap);
  }

  for(var dist = 0; dist < district_codes.length; dist++){
    content += district_codes[dist] + "," + stateEfficiencyGaps[postal_codes.indexOf(district_codes[dist].split("-")[0])] + "\n";
  }

  fs.writeFileSync("efficiency.csv", content);


});
