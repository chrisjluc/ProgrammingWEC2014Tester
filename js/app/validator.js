define("validator", ["jquery", "./map"], function ($, Map) {
  var scope = this;
  this.actionFileNames = [];
  this.index = 0;

  var validate = function(map, requests, taxiActionsList) {
    // console.log(map);
    // console.log(requests);

    var map = new Map(map, requests);
    // Used to hold distance travelled and wait time
    // for each taxi as we iterate through the actions
    var arrayOfTaxiData = [];
    var reqStatuses = map.getRequests();
    var totalCustomerFee = 0;
    // Keep track of Ids to ensure no duplicates
    var carrierIds = [];

    for (var j = 0; j < taxiActionsList.length; j++) {
      var taxiInfo = taxiActionsList[j];
      if(!taxiInfo.hasOwnProperty('carrierId') || !taxiInfo.hasOwnProperty('actions')){
        console.log("Carrier at "+j+"th index isn't a proper object");
        return false;
      }

      var carrierId = taxiInfo['carrierId'];
      if(carrierIds.indexOf(carrierId) > -1){
        console.log("Carrier with id "+carrierId+" already exists.");
        return false;
      }
      carrierIds.push(carrierId);
      var taxiActions = taxiInfo['actions'];

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
              console.log("Can't start new transaction, when you're in the middle of transaction (At index "+ i + ") for carrier: " + carrierId );
              return false;
            }
           //pickup state needs to have an id
            if (!map.isPickup(prevCoord.x, prevCoord.y, data.id)) {
                console.log("Not a valid pickup for deliveryId: "+data.id+" at carrier: "+carrierId);
                return false;
            }
            pickupid = data.id;
            totalCustomerFee += reqStatuses[pickupid].deliveryFee;
            taxiState.hasPerson = true;
            // Time from pickup (i) to start time (0)
           // taxiData.waitTimeForCustomers += i;

          } else if (data.action === 'dropoff') {
            if (!taxiState.hasPerson) {
              console.log("Can't end transaction, when you have no parcel in the car (At index "+ i + ") for carrier: " + carrierId );
              return false;
            }
            //dropoff state needs to have an id
            if (!map.isDropoff(prevCoord.x, prevCoord.y, data.id)) {
                console.log("Not a valid dropoff (At index "+ i + ") for carrier: " + carrierId);
                return false;
            }
            dropoffid = data.id;
            if (dropoffid != pickupid)
            {
                console.log("Dropoff does not correspond to pickup (At index "+ i + ") for carrier: " + carrierId);
                return false;
            }
            taxiData.waitTimeForCustomers += i;
            reqStatuses[dropoffid].done = true;
            taxiState.hasPerson = false;
          } else if(data.action === 'start' && data.hasOwnProperty('x') && data.hasOwnProperty('y')){
            if (prevCoord == null) {
              if (!map.isValidStart(data.x,data.y)) {
                console.log("Wrong start coordinates for carrier: " + carrierId);
                return false;
              }
              prevCoord = data;
            } else {
              console.log("Can't have multiple start actions for a carrier: " + carrierId);
              return false;
            }
          }else if(prevCoord == null){
            // Should never get to this state unless there was no start
            console.log("No start action for carrier: "+carrierId);
            return false;
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
              } else {
                console.log("Carrier: "+carrierId+" can't travel more than 1 unit horizontal or vertical at index " + i + " in actions");
                return false;
              }
            } else {
              console.log("Not valid coordinate at index " + i + "for carrier: "+carrierId+" in data at coordinate (" +coord.x+ "," + coord.y+")");
              return false;
            }
          }else{
            console.log("Invalid action for carrier: "+carrierId+" at index " + i + " has an invalid property");
            return false;
          }
        } else {
          console.log("Data at index " + i + "has an invalid property for carrier: "+carrierId);
          return false;
        }
        prevData = data;
      }
    arrayOfTaxiData.push(taxiData);
    }

    var allCompleted = true;
    for (i in reqStatuses)
      if (!reqStatuses[i].done)
      {
        console.log("Delivery request with id " + reqStatuses[i].id + " is not completed");
        allCompleted = false;
      }
      
    if(!allCompleted)
      return false;

    //Constants for calculating cost
    var costPerUnitDistance = 1;
    var initializationCostPerTaxi = 50;

    var cost = 0, revenue = totalCustomerFee, waitTime = 0;

    for(var i = 0; i < arrayOfTaxiData.length; i++){
      var taxiData = arrayOfTaxiData[i];
      cost += parseInt(taxiData.distanceTravelled) * costPerUnitDistance;
      waitTime += parseInt(taxiData.waitTimeForCustomers);
    }

    cost += (initializationCostPerTaxi * taxiActionsList.length);
    var profit = revenue - cost;

    console.log("Profit: "+ profit);
    console.log("Revenue: "+ revenue);
    console.log("Cost: " + cost);
    console.log("Wait time: " + waitTime);
    return true;
  };

  var loadTaxiLocationHandler = function(event) {
    var text = event.target.result;
    try{
      var taxiActions = JSON.parse(text);
    }catch(err){
      console.log(err);
      console.log(scope.actionFileNames[scope.index++]);
      return;
    }
    var filename = $("#filename").val();
    var mapFile = "static/map" + filename + ".txt";
    var coordFile = "static/requests" + filename + ".txt";
    var actionFileName = scope.actionFileNames[scope.index++];
    $.get(mapFile, function(mapText) {
      $.get(coordFile, function(coordText) {
        // Validate the taxiActions after getting the map and coord
        if(validate(mapText, coordText, taxiActions))
          console.log("pass " + actionFileName);
        else
          console.log("fail " +  actionFileName);
        console.log("");
      });
    });
  }

  var setUpValidator = function(file){
    scope.actionFileNames.push(file.name);
    var taxiLocationReader = new FileReader();
    taxiLocationReader.onload = loadTaxiLocationHandler;
    taxiLocationReader.readAsText(file);
  }

  return setUpValidator;
});
