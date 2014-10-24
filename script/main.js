define(['jquery'],function ($) {
    $(function() {

    	$("#submit").click(function() {

    		// Get csv string from taxi locations
    		var file = document.getElementById("taxi_locations_csv").files[0];
			var taxiLocationReader = new FileReader();
			taxiLocationReader.onload = loadTaxiLocationHandler;
			taxiLocationReader.readAsText(file);
		});

	  	var loadTaxiLocationHandler = function(event) {
    		var text = event.target.result;
    		var dataArray = JSON.parse(text);

    		var map = {start:{'x':0,'y':1}};
    		//map = new Map()
    		
    		// Holds previous taxi coordinates
    		var prevCoord = null;

    		// Taxi state if has person or not
    		// Can add more properties if required.
    		var state = {hasPerson: false};


    		for(var i = 0; i < dataArray.length; i++){

    			var data = dataArray[i];

    			if(data.hasOwnProperty('action'))
    			{
    				if(data.action === 'pickup')
    				{
    					if(state.hasPerson)
    					{
    						console.log("Can't start new transaction, when you're in the middle of transaction (At index "+ i );
    						return;
    					}
    					state.hasPerson = true;
    				}
    				else if(data.action === 'dropoff')
    				{

    					if(!state.hasPerson)
    					{
    						console.log("Can't end transaction, when you have no one in the cab (At index "+ i );
    						return;
    					}
    					state.hasPerson = false;
    				}

    				continue;

    			}
    			else if(data.hasOwnProperty('x') && data.hasOwnProperty('y'))
    			{
    				coord = data;

    			}
    			else
    			{
    				console.log("Data at index" +i+ "has an invalid property");
    				return;
    			}

    			// Make sure start state is valid
    			if(prevCoord == null){

    				if(!map.isStart(coord.x,coord.y)){
    					console.log("Wrong start coordinates");
    					return;
    				}
    				prevCoord = coord;

    			}
    			else if(map.isStreet(coord.x,coord.y))
				{
					if((abs(coord.x - prevCoord.x) === 1
						&& abs(coord.y - prevCoord.y) === 0)
						|| (abs(coord.x - prevCoord.x) === 0
						&& abs(coord.y - prevCoord.y) === 1))
					{
						prevCoord = coord;
					}
					else
					{
						console.log("Taxi can't travel more than 1 unit horizontal or vertical " + i + "in data");
						return;
					}
				}
				else
				{
					console.log("Not valid coordinate at index " + i + "in data at coordinate (" +x+ "," + "y"+")");
					return;
				}
			}

    		alert("Good to go!");
  		};
    });
});
