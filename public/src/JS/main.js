function selectHandler(){
  window.location.pathname = "/district/" + $('#districts').find(":selected").text();
}

$("#submitAddress").submit(function(e){
  if($("#address").val().length == 0 || $("#zip").val().length == 0){
    $("#error").show();
    e.preventDefault();
  }
});
