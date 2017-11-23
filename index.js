var express = require("express");
var bodyParser = require("body-parser");
var flash = require('connect-flash');
var fs = require('fs');
var NodeGeocoder = require('node-geocoder');
var curl = require('curlrequest');
var geocoder = NodeGeocoder({
  provider: 'google'
});

/* jshint ignore:start */
eval(fs.readFileSync('bin/util.js') + ""); //Include util.js in a traditional "c" style manner
/* jshint ignore:end */

// ** SETUP **
var app = express();
app.use(express.static("./public"));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/data',  express.static(__dirname + '/data'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.set('views', './views');
app.set('view engine', 'pug');
var csv = fs.readFileSync("./data/master.csv").toString().split("\n"); //Array containing all district data

// ** ROUTES **
app.get("/", function(req, res){ //Homepage
  res.render("index", {postal_codes: postal_codes, state_names: state_names, district_codes: district_codes});
});

app.get("/random", function(req, res){ //Random district
  res.redirect("/district/" + district_codes[Math.floor(Math.random() * 435)]);
});

app.get("/about", function(req, res){ //About page
  res.render("about");
});

app.get("/no/taxation/without/representation", function(req, res){
  res.render("territories");
});


app.post("/lookup", function(req, res){ //Handler for finding district based on address
  var address = req.body.address;
  var zip = req.body.zip;

  geocoder.geocode(address + " " + zip + " USA", function(err, result) {
    console.log(result);
    if(result.length != 0){
      var url = "https://api.mapbox.com/v4/govtrack.cd-115-2016/tilequery/" + result[0].longitude + "," + result[0].latitude + ".json?radius=0&access_token=pk.eyJ1IjoiZ292dHJhY2siLCJhIjoiY2lua2J1cmwzMHhyNnVrbHl3bmx4ZnZneiJ9.Wld_AdbKwOgmF2ZXn2SPmw";



      curl.request({
        url: url
      }, function (err, parts) {
        var districtData = JSON.parse(parts).features[0].properties;

        if(postal_codes.indexOf(districtData.state) == -1) res.redirect("/no/taxation/without/representation");
        else res.redirect("/district/" + districtData.state + "-" + districtData.number);
      });
    }
    else{ //Throw error

    }
  });
});

app.get("/district/:state-:district", function(req, res){ //Handler for rendering a district
  var state = req.params.state;
  var district = req.params.district;
  var district_code = state + "-" + parseInt(district);
  var district_code_i = district_codes.indexOf(district_code);

  if(district_code_i == -1) res.redirect("/404");
  else if(district === "00") res.redirect("/district/" + state + "-0");
  else if(district.charAt(0) === "0" && district.length > 1) res.redirect("/district/" + state + "-" + district.substring(1));
  else{
    var district_name, state_name, redistricting_control, affiliation, rep, state_affiliation, efficiency_gap, previous_district, next_district, gerrymander_score, absolute_compactness, state_compactness, country_compactness, compactness_rank;

    //Set full state name
    state_name = state_names[postal_codes.indexOf(state)];

    //Set full district name (i.e. California 37th District)
    if(district === "0") district_name = state_name + "'s at Large District";
    else district_name = state_name + "'s " + suffixNumber(parseInt(district)) + " District";

    //Set how state is redistricted
    redistricting_control = csv[district_code_i + 1].split(",")[9];

    var redistrictingStringToDisplay = "";

    if(redistricting_control.charAt(0) === "D")
      redistrictingStringToDisplay += "<em>Democrat</em>";
    else if(redistricting_control.charAt(0) === "R")
      redistrictingStringToDisplay += "<em class = 'red'>Republican</em>";
    else redistrictingStringToDisplay += "<strong>Split</strong>";

    redistrictingStringToDisplay += " redistricting control through ";

    if(redistricting_control.charAt(1) === "A")
      redistrictingStringToDisplay += "the state legislature and an advisory commmision (non-legislators who provide non-binding input before redistricting plans are submitted).";
    else if(redistricting_control.charAt(1) === "B")
      redistrictingStringToDisplay += "the state legislature and a backup commission (non-legislators who provide non-binding input on redistricting plans if the plans are not initially passed by the state legislature).";
    else if(redistricting_control.charAt(1) === "P")
      redistrictingStringToDisplay += "a committee of elected state officials.";
    else if(redistricting_control.charAt(1) === "I")
      redistrictingStringToDisplay += "an independent commission that limits direct participation by elected state officials.";
    else
      redistrictingStringToDisplay += "the state legislature. ";

    //Set the state's political affiliation and representatitive
    affiliation = csv[district_code_i + 1].split(",")[2];
    rep = csv[district_code_i + 1].split(",")[1];
    state_affiliation = csv[district_code_i + 1].split(",")[3];

    if(state_affiliation < 0) state_affiliation = "Democrat";
    else if(state_affiliation > 0) state_affiliation = "Republican";
    else state_affiliation = "Neutral";

    //Set efficiency gap
    efficiency_gap = csv[district_code_i + 1].split(",")[4];

    //Set compactness data
    absolute_compactness = parseFloat(csv[district_code_i + 1].split(",")[5]);
    state_compactness = parseFloat(csv[district_code_i + 1].split(",")[6]);
    country_compactness = parseFloat(csv[district_code_i + 1].split(",")[7]);
    compactness_rank = parseInt(csv[district_code_i + 1].split(",")[8]);

    //Set overall gerrymandered rating
    gerrymander_score = parseInt(csv[district_code_i + 1].split(",")[10]);

    //Set previous and next district
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

    //Render district
    var district_data = {
      state: state,
      district: parseInt(district),
      state_name: state_name,
      gerrymander_score: gerrymander_score,
      district_name: district_name,
      redistricting_control: redistrictingStringToDisplay,
      redistricting_control_code: redistricting_control,
      rep: rep,
      efficiency_gap: efficiency_gap,
      compactness: {
        absolute: absolute_compactness,
        state: state_compactness,
        country: country_compactness,
        rank: suffixNumber(compactness_rank)
      },
      previous_district: previous_district,
      next_district: next_district,
      affiliation: affiliation,
      state_affiliation: state_affiliation
    };

    res.render("district", {district_data: district_data});
  }
});

app.use(function (req, res, next){ //Handler for 404 page
  res.status(404).render("404");
});

// ** START THE SERVER **
var port = process.env.PORT || 3000;
app.listen(port);
console.log("Running on port " + port);
module.exports = app;
