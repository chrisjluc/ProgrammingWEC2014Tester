define(['jquery'],function ($) {
    $(function() {

    	$("#submit").click(function() {

    		// Get csv string from taxi locations
    		var file = document.getElementById("taxi_locations_csv").files[0];
			var reader = new FileReader();
			reader.onload = loadHandler;
			reader.readAsText(file);
		});

	  	function loadHandler(event) {
    		var text = event.target.result;
    		var data = JSON.parse(text);
  		}
    });
});
