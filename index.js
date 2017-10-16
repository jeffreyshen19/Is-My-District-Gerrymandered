var express = require("express");
var bodyParser = require("body-parser");
var flash = require('connect-flash');
var fs = require('fs');
var NodeGeocoder = require('node-geocoder');
var curl = require('curlrequest');
var geocoder = NodeGeocoder({
  provider: 'google'
});

var app = express();
app.use(express.static("./public"));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/data',  express.static(__dirname + '/data'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.set('views', './views');
app.set('view engine', 'pug');

var postal_codes = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
var state_names = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];
var district_codes = ["AK-0", "AL-1", "AL-2", "AL-3", "AL-4", "AL-5", "AL-6", "AL-7", "AR-1", "AR-2", "AR-3", "AR-4", "AZ-1", "AZ-2", "AZ-3", "AZ-4", "AZ-5", "AZ-6", "AZ-7", "AZ-8", "AZ-9", "CA-1", "CA-10", "CA-11", "CA-12", "CA-13", "CA-14", "CA-15", "CA-16", "CA-17", "CA-18", "CA-19", "CA-2", "CA-20", "CA-21", "CA-22", "CA-23", "CA-24", "CA-25", "CA-26", "CA-27", "CA-28", "CA-29", "CA-3", "CA-30", "CA-31", "CA-32", "CA-33", "CA-34", "CA-35", "CA-36", "CA-37", "CA-38", "CA-39", "CA-4", "CA-40", "CA-41", "CA-42", "CA-43", "CA-44", "CA-45", "CA-46", "CA-47", "CA-48", "CA-49", "CA-5", "CA-50", "CA-51", "CA-52", "CA-53", "CA-6", "CA-7", "CA-8", "CA-9", "CO-1", "CO-2", "CO-3", "CO-4", "CO-5", "CO-6", "CO-7", "CT-1", "CT-2", "CT-3", "CT-4", "CT-5", "DE-0", "FL-1", "FL-10", "FL-11", "FL-12", "FL-13", "FL-14", "FL-15", "FL-16", "FL-17", "FL-18", "FL-19", "FL-2", "FL-20", "FL-21", "FL-22", "FL-23", "FL-24", "FL-25", "FL-26", "FL-27", "FL-3", "FL-4", "FL-5", "FL-6", "FL-7", "FL-8", "FL-9", "GA-1", "GA-10", "GA-11", "GA-12", "GA-13", "GA-14", "GA-2", "GA-3", "GA-4", "GA-5", "GA-6", "GA-7", "GA-8", "GA-9", "HI-1", "HI-2", "IA-1", "IA-2", "IA-3", "IA-4", "ID-1", "ID-2", "IL-1", "IL-10", "IL-11", "IL-12", "IL-13", "IL-14", "IL-15", "IL-16", "IL-17", "IL-18", "IL-2", "IL-3", "IL-4", "IL-5", "IL-6", "IL-7", "IL-8", "IL-9", "IN-1", "IN-2", "IN-3", "IN-4", "IN-5", "IN-6", "IN-7", "IN-8", "IN-9", "KS-1", "KS-2", "KS-3", "KS-4", "KY-1", "KY-2", "KY-3", "KY-4", "KY-5", "KY-6", "LA-1", "LA-2", "LA-3", "LA-4", "LA-5", "LA-6", "MA-1", "MA-2", "MA-3", "MA-4", "MA-5", "MA-6", "MA-7", "MA-8", "MA-9", "MD-1", "MD-2", "MD-3", "MD-4", "MD-5", "MD-6", "MD-7", "MD-8", "ME-1", "ME-2", "MI-1", "MI-10", "MI-11", "MI-12", "MI-13", "MI-14", "MI-2", "MI-3", "MI-4", "MI-5", "MI-6", "MI-7", "MI-8", "MI-9", "MN-1", "MN-2", "MN-3", "MN-4", "MN-5", "MN-6", "MN-7", "MN-8", "MO-1", "MO-2", "MO-3", "MO-4", "MO-5", "MO-6", "MO-7", "MO-8", "MS-1", "MS-2", "MS-3", "MS-4", "MT-0", "NC-1", "NC-10", "NC-11", "NC-12", "NC-13", "NC-2", "NC-3", "NC-4", "NC-5", "NC-6", "NC-7", "NC-8", "NC-9", "ND-0", "NE-1", "NE-2", "NE-3", "NH-1", "NH-2", "NJ-1", "NJ-10", "NJ-11", "NJ-12", "NJ-2", "NJ-3", "NJ-4", "NJ-5", "NJ-6", "NJ-7", "NJ-8", "NJ-9", "NM-1", "NM-2", "NM-3", "NV-1", "NV-2", "NV-3", "NV-4", "NY-1", "NY-10", "NY-11", "NY-12", "NY-13", "NY-14", "NY-15", "NY-16", "NY-17", "NY-18", "NY-19", "NY-2", "NY-20", "NY-21", "NY-22", "NY-23", "NY-24", "NY-25", "NY-26", "NY-27", "NY-3", "NY-4", "NY-5", "NY-6", "NY-7", "NY-8", "NY-9", "OH-1", "OH-10", "OH-11", "OH-12", "OH-13", "OH-14", "OH-15", "OH-16", "OH-2", "OH-3", "OH-4", "OH-5", "OH-6", "OH-7", "OH-8", "OH-9", "OK-1", "OK-2", "OK-3", "OK-4", "OK-5", "OR-1", "OR-2", "OR-3", "OR-4", "OR-5", "PA-1", "PA-10", "PA-11", "PA-12", "PA-13", "PA-14", "PA-15", "PA-16", "PA-17", "PA-18", "PA-2", "PA-3", "PA-4", "PA-5", "PA-6", "PA-7", "PA-8", "PA-9", "RI-1", "RI-2", "SC-1", "SC-2", "SC-3", "SC-4", "SC-5", "SC-6", "SC-7", "SD-0", "TN-1", "TN-2", "TN-3", "TN-4", "TN-5", "TN-6", "TN-7", "TN-8", "TN-9", "TX-1", "TX-10", "TX-11", "TX-12", "TX-13", "TX-14", "TX-15", "TX-16", "TX-17", "TX-18", "TX-19", "TX-2", "TX-20", "TX-21", "TX-22", "TX-23", "TX-24", "TX-25", "TX-26", "TX-27", "TX-28", "TX-29", "TX-3", "TX-30", "TX-31", "TX-32", "TX-33", "TX-34", "TX-35", "TX-36", "TX-4", "TX-5", "TX-6", "TX-7", "TX-8", "TX-9", "UT-1", "UT-2", "UT-3", "UT-4", "VA-1", "VA-10", "VA-11", "VA-2", "VA-3", "VA-4", "VA-5", "VA-6", "VA-7", "VA-8", "VA-9", "VT-0", "WA-1", "WA-10", "WA-2", "WA-3", "WA-4", "WA-5", "WA-6", "WA-7", "WA-8", "WA-9", "WI-1", "WI-2", "WI-3", "WI-4", "WI-5", "WI-6", "WI-7", "WI-8", "WV-1", "WV-2", "WV-3", "WY-0"];

function suffixNumber(i){
  var j = i % 10, k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

var csv = fs.readFileSync("./data/master.csv").toString().split("\n");

console.log("Running on port 3000");

//Routes
app.get("/", function(req, res){
  res.render("index", {postal_codes: postal_codes, state_names: state_names, district_codes: district_codes});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/lookup", function(req, res){
  var address = req.body.address;
  var zip = req.body.zip;

  geocoder.geocode(address + " " + zip + " USA", function(err, result) {
    if(result.length != 0){
      var url = "https://api.mapbox.com/v4/govtrack.cd-115-2016/tilequery/" + result[0].longitude + "," + result[0].latitude + ".json?radius=0&access_token=pk.eyJ1IjoiZ292dHJhY2siLCJhIjoiY2lua2J1cmwzMHhyNnVrbHl3bmx4ZnZneiJ9.Wld_AdbKwOgmF2ZXn2SPmw";

      curl.request({
        url: url
      }, function (err, parts) {
        var districtData = JSON.parse(parts).features[0].properties;
        console.log(districtData);
        res.redirect("/district/" + districtData.state + "-" + districtData.number);
      });
    }
    else{ //Throw error

    }
  });
});

app.get("/district/:state-:district", function(req, res){
  var state = req.params.state;
  var district = req.params.district;
  var district_code = state + "-" + parseInt(district);
  var district_code_i = district_codes.indexOf(district_code);

  if(district_code_i == -1) res.redirect("/404");

  //Set full state name
  var state_name = state_names[postal_codes.indexOf(state)];

  //Set full district name (California 37th District)
  var district_name;
  if(district === "00" || district === "0"){
    district_name = state_name + "'s at Large District";
  }
  else{
    district_name = state_name + "'s " + suffixNumber(parseInt(district)) + " District";
  }

  //Set whether district is Republican, Democrat, or Independently redistricted
  var redistricting_control;
  var republican_states = ["UT","TX","LA","OK","KS","AL","GA","FL","TN","SC","NC","VA","WI","MI","IN","OH","PA","NH"];
  var democrat_states = ["IL", "AR", "WV", "MD", "MA", "RI"];
  if(republican_states.includes(state)) redistricting_control = "Republican";
  else if(democrat_states.includes(state)) redistricting_control = "Democrat";
  else redistricting_control = "Independent";

  //Set the state's political affiliation + Rep
  var affiliation = csv[district_code_i + 1].split(",")[7];
  var rep = csv[district_code_i + 1].split(",")[9];

  //Set efficiency gap data
  var absolute_efficiency_gap, state_efficiency_gap, district_efficiency_gap;

  //Set compactness data
  var absolute_compactness, state_compactness, country_compactness;

  //Set overall gerrymandered rating
  var gerrymander_score;

  //Set previous and next district
  var previous_district, next_district;

  if(district_code_i == 0){
    previous_district = null;
    next_district = district_codes[1];
  }
  else if(district_code_i == district_codes.length - 1){
    previous_district = district_codes[district_codes.length - 2];
    next_district = null;
  }
  else{
    previous_district = district_codes[district_code_i - 1];
    next_district = district_codes[district_code_i + 1];
  }

  var district_data = {
    state: state,
    district: district,
    state_name: state_name,
    gerrymander_score: gerrymander_score,
    district_name: district_name,
    redistricting_control: redistricting_control,
    rep: rep,
    efficiency_gap: {
      absolute: absolute_efficiency_gap,
      state: state_efficiency_gap,
      district: district_efficiency_gap,
    },
    compactness: {
      absolute: absolute_compactness,
      state: state_compactness,
      country: country_compactness,
    },
    previous_district: previous_district,
    next_district: next_district,
    affiliation: affiliation
  };

  res.render("district", {district_data: district_data});
});

app.use(function (req, res, next){ //Handler for 404 page
  res.status(404).render("404");
});

//Startup
app.listen(process.env.PORT || 3000);
module.exports = app;
