define("validator", ["jquery", "./map"], function ($, Map) {
  var validate = function(map, requests, dataArray) {
    console.log(map);
    console.log(requests);

    var map = new Map(map, requests);

    // Holds previous taxi coordinates
    var prevCoord = null;

    // Taxi state if has person or not
    // Can add more properties if required.
    var state = {
      hasPerson: false,
      name: null,
      destination: null,
    };

    var distanceTravelled = 0;
    var distanceTravelledInTransaction = 0;

    // Start the checker
    for (var i = 0; i < dataArray.length; i++) {
      var data = dataArray[i];

      if (data.hasOwnProperty('action')) {
        if (data.action === 'pickup') {
          if (state.hasPerson) {
            console.error("Can't start new transaction, when you're in the middle of transaction (At index "+ i );
            return;
          }
          state.hasPerson = true;

        } else if (data.action === 'dropoff') {
          if (!state.hasPerson) {
            console.error("Can't end transaction, when you have no one in the cab (At index "+ i );
            return;
          }
          state.hasPerson = false;
        } else if (data.action === 'drive' && data.hasOwnProperty('x') && data.hasOwnProperty('y')) {
          coord = data;
          // Make sure start state is valid
          if (prevCoord == null) {
            if (!map.isStart(coord.x,coord.y)) {
              console.error("Wrong start coordinates");
              return;
            }
            prevCoord = coord;
          } else if (map.isStreet(coord.x,coord.y)) {
            if((abs(coord.x - prevCoord.x) === 1
                && abs(coord.y - prevCoord.y) === 0)
                || (abs(coord.x - prevCoord.x) === 0
                && abs(coord.y - prevCoord.y) === 1)) {
              prevCoord = coord;
              distanceTravelled++;
              if(state.hasPerson)
                distanceTravelledInTransaction++;
            } else {
              console.error("Taxi can't travel more than 1 unit horizontal or vertical " + i + "in data");
              return;
            }
          } else {
            console.error("Not valid coordinate at index " + i + "in data at coordinate (" +x+ "," + "y"+")");
            return;
          }
        }
      } else {
        console.error("Data at index" + i + "has an invalid property");
        return;
      }
    }

    //Calculate revenue and cost
    var revenuePerUnitDistance = 10;
    var costPerUnitDistance = 1;

    var cost = distanceTravelled * costPerUnitDistance;
    var revenue = distanceTravelledInTransaction * revenuePerUnitDistance;
    var profit = revenue - cost;

    console.log("Profit: "+ profit);
    console.log("Revenue: "+ revenue);
    console.log("Cost: "+ cost);

    alert("Good to go!");
  };

  var loadTaxiLocationHandler = function(event) {
    var text = event.target.result;
    var dataArray = JSON.parse(text);
    var filename = $("#filename").val();
    var mapFile = "static/map" + filename + ".txt";
    var coordFile = "static/coord" + filename + ".txt";
    console.log("Loading the map and coord");
    $.get(mapFile, function(mapText) {
      $.get(coordFile, function(coordText) {
        // Validate the dataArray after getting the map and coord
        console.log("Validating");
        validate(mapText, coordText, dataArray);
      });
    });
  }

  return loadTaxiLocationHandler;
});
