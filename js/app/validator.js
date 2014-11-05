define("validator", ["jquery", "./map"], function ($, Map) {
  var validate = function(map, requests, taxiActionsList) {
    console.log(map);
    console.log(requests);

    var map = new Map(map, requests);
    // Used to hold distance travelled and wait time
    // for each taxi as we iterate through the actions
    var arrayOfTaxiData = [];
    
    var reqStatuses = map.getRequests;
    for (var taxiId in taxiActionsList) {
      if (!taxiActionsList.hasOwnProperty(taxiId))
        continue;
      var taxiActions = taxiActionsList[taxiId];

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
      var prevData = null;
      var pickupid = null;
      var dropoffid = null;
      // Start the action checker for each taxi
      for (var i = 0; i < taxiActions.length; i++) {
          var data = taxiActions[i];
 
        if (data.hasOwnProperty('action')) {
          if (data.action === 'pickup') {
            if (taxiState.hasPerson) {
              console.error("Can't start new transaction, when you're in the middle of transaction (At index "+ i );
              return;
            }
           //pickup state needs to have an id
            if (!map.isPickup(prevData.x, prevData.y, data.id)) {
                console.error("Not a valid pickup");
                return;
            }
            pickupid = data.id;
            taxiState.hasPerson = true;
            // Time from pickup (i) to start time (0)
            taxiData.waitTimeForCustomers += i;

          } else if (data.action === 'dropoff') {
            if (!taxiState.hasPerson) {
              console.error("Can't end transaction, when you have no one in the taxi (At index "+ i );
              return;
            }
            //dropoff state needs to have an id
            if (!map.isDropoff(prevData.x, prevData.y, data.id)) {
                console.error("Not a valid dropoff");
                return;
            }
            dropoffid = data.id;
            if (dropoffid != pickupid)
            {
                console.error("Dropoff does not correspond to pickup");
                return;
            }
            reqStatuses[dropoffid].done = true;
            taxiState.hasPerson = false;
          } else if(data.action === 'start' && data.hasOwnProperty('x') && data.hasOwnProperty('y')){
            if (prevCoord == null) {
              if (!map.isValidStart(data.x,data.y)) {
                console.error("Wrong start coordinates for taxi: " + taxiId);
                return;
              }
              prevCoord = data;
            } else {
              console.error("Can't have multiple start actions for a taxi: " + taxiId);
              return;
            } 
          }else if (data.action === 'drive' && data.hasOwnProperty('x') && data.hasOwnProperty('y')) {
            coord = data;
            // Make sure start taxiState is valid
            if (map.isValidStreet(coord.x,coord.y)) {
              if((Math.abs(coord.x - prevCoord.x) === 1
                  && Math.abs(coord.y - prevCoord.y) === 0)
                  || (Math.abs(coord.x - prevCoord.x) === 0
                  && Math.abs(coord.y - prevCoord.y) === 1)) {
                prevCoord = coord;
                taxiData.distanceTravelled++;
                if(taxiState.hasPerson)
                  taxiData.distanceTravelledInTransaction++;
              } else {
                console.error("Taxi: "+taxiId+" can't travel more than 1 unit horizontal or vertical " + i + " in data");
                return;
              }
            } else {
              console.error("Not valid coordinate at index " + i + "for taxi: "+taxiId+" in data at coordinate (" +x+ "," + y+")");
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
        prevData = data;
      }
    arrayOfTaxiData.push(taxiData);
    }


    for (i in reqStatuses)
    {
        if (!reqStatuses[i].done)
        {
            console.error("Request" + reqStatuses[i].id + "not completed");
            return;
        }
    }

    //Constants for calculating revenue and cost
    var revenuePerUnitDistance = 5;
    var costPerUnitDistance = 1;
    var initializationCostPerTaxi = 50;

    var cost = 0, revenue = 0, waitTime = 0;

    for(var i = 0; i < arrayOfTaxiData.length; i++){
      var taxiData = arrayOfTaxiData[i];
      cost += parseInt(taxiData.distanceTravelled) * costPerUnitDistance;
      revenue += parseInt(taxiData.distanceTravelledInTransaction) * revenuePerUnitDistance;
      waitTime += parseInt(taxiData.waitTimeForCustomers);
    }

    cost += initializationCostPerTaxi * arrayOfTaxiData.length;
    var profit = revenue - cost;

    console.log("Profit: "+ profit);
    console.log("Revenue: "+ revenue);
    console.log("Cost: "+ cost);
    console.log("Wait time: " + waitTime);
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
