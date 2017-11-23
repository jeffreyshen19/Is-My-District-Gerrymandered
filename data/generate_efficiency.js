var fs = require('fs');
var extract = require('pdf-text-extract');
eval(fs.readFileSync('../bin/util.js') + ""); //Include util.js in a traditional "c" style manner

var content = "";

function convertToVotes(str){
  str = str.replace("at large", "").replace(/[0-9]+\./g, ""); //Trim excess words
  str = str.trim();
  str = str.split(" ");

  var republican = null, democrat = null;

  if(str.indexOf("republican") != -1) republican = parseInt(str[str.indexOf("republican") + 1].replace(/,/g, ""));
  if(str.indexOf("democrat") != -1) democrat = parseInt(str[str.indexOf("democrat") + 1].replace(/,/g, ""));

  return {
    "republican": republican,
    "democrat": democrat
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
      dem = stateData.districts[d].democrat;
      rep = stateData.districts[d].republican;

      if(dem != null && !isNaN(dem)) totalVotes += dem;
      if(rep != null && !isNaN(rep)) totalVotes += rep;

      if(dem != null && rep != null && !isNaN(dem) && !isNaN(rep)){
        winningThreshold = Math.ceil((dem + rep) / 2);
        if(rep > dem){
          wastedRepublicanVotes += rep - winningThreshold;
          wastedDemocratVotes += dem;
        }
        else{
          wastedRepublicanVotes += rep;
          wastedDemocratVotes += dem - winningThreshold;
        }
      }
    }

    efficiency_gap = (wastedDemocratVotes - wastedRepublicanVotes) / totalVotes;

    if(efficiency_gap < 0) efficiency_gap = "D" + -1 * efficiency_gap;
    else if(efficiency_gap > 0) efficiency_gap = "R" + efficiency_gap;
    else efficiency_gap = "N" + efficiency_gap;



    stateEfficiencyGaps.push(efficiency_gap);
  }

  console.log(stateEfficiencyGaps);

  for(var dist = 0; dist < district_codes.length; dist++){
    content += district_codes[dist] + "," + stateEfficiencyGaps[postal_codes.indexOf(district_codes[dist].split("-")[0])] + "\n";
  }

  fs.writeFileSync("efficiency.csv", content);


});
