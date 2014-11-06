define('map', ['jquery'], function($) {
  /**
   * Constructor
   */
  function Map(mapText, requestText) {
    // 2D array, each element is a blockEnum, so either STREET or BUILDING
    this.map = parseMap(mapText);
    var requests = JSON.parse(requestText);
    this.deliveryHq = requests.deliveryHeadquarter;
   // this.deliveryHq = requests.taxi;
    this.startReqs = parseStartRequests(requests.requests);
    this.endReqs = parseEndRequests(requests.requests);
    this.reqIds = parseReqIds(requests.requests);
   // this.endReqs = parseStartRequests(requests.requests);
  }

  /**
   * Returns a 2D array of the map
   */
  function parseMap(mapText) {
    var mapText = mapText.split("\n");
    var length = mapText.length;

    var map = initialize2DArray(length);
    for (var rowIndex=0; rowIndex<length; rowIndex++) {
      for (var colIndex=0; colIndex<length; colIndex++) {
        var block = mapText[rowIndex].charAt(colIndex);
        switch (block) {
          case blockEnum.BUILDING:
            map[rowIndex][colIndex] = blockEnum.BUILDING;
            break;
          case blockEnum.STREET:
          default:
            // If it's a T(taxi), or a person, it's a street since
            // a taxi can go over a person
            map[rowIndex][colIndex] = blockEnum.STREET;
        }
      }
    }
    return map;
  }

  /**
   * Returns a map of symbol to location
   *UPDATED: Returns a map of request id to pickup location
   */
  function parseStartRequests(requests) {
    var reqs = {};
    for (i in requests) {
        var req = requests[i];
        var requestId = req.id;
        reqs[requestId] = {
            "x": req.pickup.x,
            "y": req.pickup.y,
        }
      //var startSymbol = req.start.symbol;
      //reqs[startSymbol] = {
      //  "x": req.start.x,
      //  "y": req.start.y,
      //}
    }
    return reqs;
  }

  /**
   * Returns a map of end symbol to location
   *UPDATED: Returns  map of request id to dropoff location
   */
  function parseEndRequests(requests) {
    var reqs = {};
    for (i in requests) {
        var req = requests[i];
        var requestId = req.id;
        reqs[requestId] = {
            "x": req.dropoff.x,
            "y": req.dropoff.y,
        }
      //var endSymbol = req.destination.symbol;
      //reqs[endSymbol] = {
      //  "x": req.destination.x,
      //  "y": req.destination.y,
      //}
    }
    return reqs;
  }

  function parseReqIds(requests) {
      var reqs = {};
      for (i in requests) {
          var req = requests[i];
          var requestId = req.id;
          reqs[requestId] = {
              "id":req.id,
              "done": false,
              "deliveryFee":req.deliveryFee,
          }
      }
      return reqs;
  }

  /**
   * Returns the symbol of the destination
   * A => a
   * B => b
   */
  //function getDestinationSymbol(startSymbol) {
  //  var ascii = startSymbol.charCodeAt(0) + 32;
  //  return String.fromCharCode(ascii);
  //}

  /**
   * Returns the symbol of the start
   * a => A
   * b => B
   */
  //function getStartSymbol(endSymbol) {
  //  var ascii = startSymbol.charCodeAt(0) - 32;
  //  return String.fromCharCode(ascii);
  //}

    
  /**
   * Prints out the map
   */
  Map.prototype.printMap = function() {
    for (var rowIndex=0; rowIndex<this.map.length; rowIndex++) {
      var row = this.coord[rowIndex];
      console.log(row.join(""));
    }
  }

  /**
   * Returns whether the coordinate is the pickup point
   */

  Map.prototype.isPickup = function (x, y, id) {
      if (id in this.startReqs)
      {
          if (this.startReqs[id].x == x && this.startReqs[id].y == y)
              return true;
      }      
      return false;
  }

  //Map.prototype.isPickup = function (x, y) {
  //    if (this.map[y][x] == blockEnum.STREET) {
  //        for (i in this.startReqs) {
  //            if (this.startReqs[i].x == x && this.startReqs[i].y == y)
  //                return true;
  //        }
  //    }
  //    return false;
  //}

    //Map.prototype.isPickup = function(x, y) {
  //  var elem = this.map[y][x];
  //  if (elem in this.startReqs) {
  //    return true;
  //  } else {
  //    return false;
  //  }
  //}


  /**
   * Returns the name of the pickup
   */
  //Map.prototype.getPickupName = function(x, y) {
  //  var elem = this.map[y][x];
  //  if (elem in this.startReqs) {
  //    return elem;
  //  }
  //  return null;
  //}

  /**
   * Checks if the location is a taxi
   */
  Map.prototype.isValidStart = function(x, y) {
    return x == this.deliveryHq.x && y == this.deliveryHq.y;
  }

  /**
   * Checks if the location is a street
   */
  Map.prototype.isValidStreet = function(x, y) {
    var elem = this.map[y][x];
    return elem == blockEnum.STREET;
  }

  /**
   * Returns whether the dropoff is the right location for a given symbol
   * If it returns false, it should throw an error
   */


  Map.prototype.isDropoff = function (x, y, id) {
      if (id in this.endReqs) {
          if (this.endReqs[id].x == x && this.endReqs[id].y == y)
              return true;
      }
      return false;
  }

  Map.prototype.getRequests = function () {
      return this.reqIds;
  }


  //Map.prototype.isDropoff = function (x, y) {
  //    if (this.map[y][x] == blockEnum.STREET) {
  //        for (i in this.endReqs) {
  //            if (this.endReqs[i].x == x && this.endReqs[i].y == y)
  //                return true;
  //        }
  //    }
  //    return false;
  //}



  //Map.prototype.isDropoff = function(x, y) {
  //  var elem = this.map[y][x];
  //  if (elem in this.endReqs) {
  //    return true;
  //  }
  //  return false;
  //}


  /**
   * Creates a new 2D array
   */
  function initialize2DArray(length) {
    var array = new Array(length);
    for (var i=0; i<length; i++) {
      array[i] = new Array(length);
    }
    return array;
  }

  function isInt(value) {
    return !isNaN(value) &&
           parseInt(Number(value)) == value &&
           !isNaN(parseInt(value, 10));
  }

  var blockEnum = {
    STREET: ' ',
    BUILDING: 'X',
    START: 'T',
  };

  return Map;
});
