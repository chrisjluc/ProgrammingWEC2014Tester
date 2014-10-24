define(['jquery'],function ($) {
    $(function() {

    	$("#submit").click(function() {

    		// Get csv string from taxi locations
    		var file = document.getElementById("taxi_locations_csv").files[0];
			var taxiLocationReader = new FileReader();
			taxiLocationReader.onload = loadTaxiLocationHandler;
			taxiLocationReader.readAsText(file);
		});

	  	function loadTaxiLocationHandler(event) {
    		var text = event.target.result;
    		var data = JSON.parse(text);
  		}
    });
});
