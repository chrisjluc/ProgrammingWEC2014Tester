// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'js/app/',
    paths: {
        app: 'app',
        'jquery': '../lib/jquery-2.1.1.min',
    },
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['map', 'validator', 'jquery'], function(Map, validator, $) {
  $("#filename").change(function() {
    var val = $(this).val();
    $("#mapdownload").attr("href", "static/map" + val + ".txt");
    $("#mapdownload").attr("download", "map" + val + ".txt");
    $("#coorddownload").attr("href", "static/coord" + val + ".txt");
    $("#coorddownload").attr("download", "coord" + val + ".txt");
  });

  $("#submit").click(function() {
    // Get csv string from taxi locations
    var file = document.getElementById("taxi_locations_csv").files[0];
    var taxiLocationReader = new FileReader();
    console.log("Clicked submit");
    taxiLocationReader.onload = validator;
    taxiLocationReader.readAsText(file);
  });
});
