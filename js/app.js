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
  // If dropdown changes, update the files to be downloaded
  $("#filename").change(function() {
    var val = $(this).val();
    $("#mapdownload").attr("href", "static/map" + val + ".txt");
    $("#mapdownload").attr("download", "map" + val + ".txt");
    $("#coorddownload").attr("href", "static/requests" + val + ".txt");
    $("#coorddownload").attr("download", "requests" + val + ".txt");
  });

  $("#submit").click(function() {
    // Get csv string from taxi locations
    var length = document.getElementById('taxi_locations_csv').files.length;
    for(var i = 0; i < length; i++){
      var file = document.getElementById("taxi_locations_csv").files[i];
      if(file === undefined)
        return;
      validator(file);
    }
  });
});
