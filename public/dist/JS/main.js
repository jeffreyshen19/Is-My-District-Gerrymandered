function selectHandler(){
  window.location.pathname = "/district/" + $('#districts').find(":selected").text();
}
