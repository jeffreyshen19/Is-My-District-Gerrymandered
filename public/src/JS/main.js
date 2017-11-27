function selectHandler(){
  window.location.pathname = "/district/" + $('#districts').find(":selected").text();
}

function gerrymanderedDistrictsHandler(){
  window.location.pathname = "/district/" + $('#gerrymandered-districts').find(":selected").text().split(/[0-9]+. /)[1];
}

function compactDistrictsHandler(){
  window.location.pathname = "/district/" + $('#compact-districts').find(":selected").text().split(/[0-9]+. /)[1];
}

$("#submitAddress").submit(function(e){
  if($("#address").val().length == 0 || $("#zip").val().length == 0){
    $("#error").show();
    e.preventDefault();
  }
});
