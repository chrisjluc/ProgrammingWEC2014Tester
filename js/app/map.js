define('map', ['jquery'], function($) {
  /**
   * Constructor
   */
  function Map(mapText, requestText) {
    // 2D array, each element is a blockEnum, so either STREET or BUILDING
    this.map = parseMap(mapText);
    // Map of coordinate (x, y) => name, symbol, destination
    this.pickup = parsePickup(requestText);
    // Map of coordinate(x, y) => destination
    this.dropoff = parseDropoff(this.map, requestText);
  }

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
  Map.prototype.isPickup = function(x, y) {
    var coord = (x, y);
    if (coord in this.pickup) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Returns the name of the pickup
   */
  Map.prototype.getPickupName = function(x, y) {
    var coord = (x, y);
    if (coord in this.pickup) {
      var data = this.pickup[coord];
      return data.symbol;
    }
  }

  /**
   * Checks if the location is a taxi
   */
  Map.prototype.isValidStart = function(x, y) {
    var elem = this.map[x][y];
    if (elem == blockEnum.START) {
      return true;
    }
    return false;
  }

  /**
   * Checks if the location is a street
   */
  Map.prototype.isValidStreet = function(x, y) {
    var elem = this.map[x][y];
    if (elem == blockEnum.STREET) {
      return true;
    }
    return false;
  }

  /**
   * Returns whether the dropoff is the right location for a given symbol
   * If it returns false, it should throw an error
   */
  Map.prototype.isDropoff = function(symbol, x, y) {
    var coord = (x, y);
    if (coord in this.dropoff) {
      var dropoffSymbol = this.dropoff[coord];
      for (pickup in this.pickup) {
        if (pickup.destination == dropoffSymbol && pickup.symbol == symbol) {
          return true;
        }
      }
      return false;
    } else {
      return false;
    }
  }

  /**
   * Returns a map of coord to a JSON containing data on the coordinate
   */
  function parsePickup(requestText) {
    var json = JSON.parse(requestText);
    if (typeof(json) === "undefined") {
      console.error("Undefined file");
      return;
    }
    var requests = json.requests;
    var pickup = {};
    for (var i=0; i<requests.length; i++) {
      // TODO: Coordinates will not be given in the initial file,
      // must find it ourselves
      var coord = (requests[i].x, requests[i].y);
      pickup[coord] = {
        "name": requests[i].name,
        "symbol": requests[i].symbol,
        "destination": requests[i].destination,
      };
    }
    return pickup;
  }

  /**
   * Returns a 2D array of the map
   */
  function parseMap(mapText) {
    var mapText = mapText.split("\n");
    var length = mapText.length;

    var map = new2DArray(length);
    for (var rowIndex=0; rowIndex<length; rowIndex++) {
      for (var colIndex=0; colIndex<length; colIndex++) {
        var block = mapText[rowIndex].charAt(i);
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
  }

  /**
   * Returns a map of the coordinate to the symbol of the
   * destination
   */
  function parseDropoff(map) {
    var dropoffs = {};
    for (var rowIndex=0; rowIndex<map.length; rowIndex++) {
      var row = map[rowIndex];
      for (var colIndex=0; colIndex<row.length; colIndex++) {
        if (isInt(row[colIndex])) {
          var coord = (rowIndex, colIndex);
          dropoffs[coord] = row[colIndex];
        }
      }
    }
    return dropoffs;
  }
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
