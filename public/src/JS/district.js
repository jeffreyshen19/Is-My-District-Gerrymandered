var map = L.map('map').setView([38.57, -94.71], 8);

var district_boundary;

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1IjoiamVmZnJleXNoZW5jYyIsImEiOiJjamE5MDI4YmowMmMzMndzNDdoZmZnYzF5In0.zV3f0WhqbHeyixwY--TyZg'
}).addTo(map);


$.ajax({
  dataType: "json",
  url: "/data/raw/districts/" + window.location.pathname.split("/district/")[1] + "/shape.geojson",
  success: function(data) {
    var affiliation = $("#map").data("affiliation");
    district_boundary = new L.geoJson(data, {style: {
      fillColor: affiliation === 'Republican' ? '#D64541' : "#3F72AF",
      color: affiliation === 'Republican' ? '#D64541' : "#3F72AF"
    }}).addTo(map);
    map.fitBounds(district_boundary.getBounds());
  },
  error: function(){

  }
});
