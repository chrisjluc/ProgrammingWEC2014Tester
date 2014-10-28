define("validator", ["jquery", "./map"], function ($, Map) {
  var validate = function(map, requests, taxiActions) {
    console.log(map);
    console.log(requests);

    var map = new Map(map, requests);
    // Used to hold distance travelled and wait time
    // for each taxi as we iterate through the actions
    var arrayOfTaxiData = [];

    for (var taxiId in taxiActions) {
      if (!obj.hasOwnProperty(taxiId))
        continue;
      var taxiActions = taxiActions[taxiId];

      // Holds previous taxi coordinates
      var prevCoord = null;

      // Taxi state if has person or not
      // Can add more properties if required.
      var taxiState = {
        hasPerson: false,
        name: null,
        destination: null,
      };

      var taxiData = {
        waitTimeForCustomers: 0,
        distanceTravelled : 0,
        distanceTravelledInTransaction : 0
      }

      // Start the action checker for each taxi
      for (var i = 0; i < taxiActions.length; i++) {
        var data = taxiActions[i];

        if (data.hasOwnProperty('action')) {
          if (data.action === 'pickup') {
            if (taxiState.hasPerson) {
              console.error("Can't start new transaction, when you're in the middle of transaction (At index "+ i );
              return;
            }
            taxiState.hasPerson = true;
            // Time from pickup (i) to start time (0)
            taxiData.waitTimeForCustomers += i;

          } else if (data.action === 'dropoff') {
            if (!taxiState.hasPerson) {
              console.error("Can't end transaction, when you have no one in the taxi (At index "+ i );
              return;
            }
            taxiState.hasPerson = false;
          } else if(data.action === 'start'){
            if (prevCoord == null) {
              if (!map.isStart(coord.x,coord.y)) {
                console.error("Wrong start coordinates");
                return;
              }
              prevCoord = coord;
            } else {
              console.error("Can't have multiple start actions for a taxi");
              return;
            } 
          }else if (data.action === 'drive' && data.hasOwnProperty('x') && data.hasOwnProperty('y')) {
            coord = data;
            // Make sure start taxiState is valid
            if (map.isStreet(coord.x,coord.y)) {
              if((abs(coord.x - prevCoord.x) === 1
                  && abs(coord.y - prevCoord.y) === 0)
                  || (abs(coord.x - prevCoord.x) === 0
                  && abs(coord.y - prevCoord.y) === 1)) {
                prevCoord = coord;
                taxiData.distanceTravelled++;
                if(taxiState.hasPerson)
                  taxiData.distanceTravelledInTransaction++;
              } else {
                console.error("Taxi can't travel more than 1 unit horizontal or vertical " + i + "in data");
                return;
              }
            } else {
              console.error("Not valid coordinate at index " + i + "in data at coordinate (" +x+ "," + "y"+")");
              return;
            }
          }else{
            console.error("Invalid action for taxi: "+taxiId+" at index" + i + "has an invalid property");
            return;
          }
        } else {
          console.error("Data at index" + i + "has an invalid property");
          return;
        }
      }
    arrayOfTaxiData.push(taxiData);
    }

    //Constants for calculating revenue and cost
    var revenuePerUnitDistance = 10;
    var costPerUnitDistance = 1;
    var initializationCostPerTaxi = 5;

    var cost = 0, revenue = 0;

    for(var taxiData in arrayOfTaxiData){
      cost += taxiData.distanceTravelled * costPerUnitDistance;
      revenue += taxiData.distanceTravelledInTransaction * revenuePerUnitDistance;
    }

    cost -= initializationCostPerTaxi * arrayOfTaxiData.length;
    var profit = revenue - cost;

    console.log("Profit: "+ profit);
    console.log("Revenue: "+ revenue);
    console.log("Cost: "+ cost);

    alert("Good to go!");
  };

  var loadTaxiLocationHandler = function(event) {
    var text = event.target.result;
    var taxiActions = JSON.parse(text);
    var filename = $("#filename").val();
    var mapFile = "static/map" + filename + ".txt";
    var coordFile = "static/coord" + filename + ".txt";
    console.log("Loading the map and coord");
    $.get(mapFile, function(mapText) {
      $.get(coordFile, function(coordText) {
        // Validate the taxiActions after getting the map and coord
        console.log("Validating");
        validate(mapText, coordText, taxiActions);
      });
    });
  }
  return loadTaxiLocationHandler;
});
