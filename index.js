/*-- CONSTANTS --*/

// google maps API
const API_KEY ="AIzaSyC0HTI1ZBcWCdA-VxGzRMVvu2vrhn4vgBs";

// Neighborhood Names GIS DataSet
const URL_NEIGHNAMES = "https://data.cityofnewyork.us/api/views/xyye-rtrs/rows.json?accessType=DOWNLOAD";

//NY Districts geoshapes DataSet
const URL_GEOSHAPES = "http://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson";

//crimes in NY DataSet (API_TOKEN is for making quick queries from socrata)
const URL_CRIMES = "https://data.cityofnewyork.us/resource/9s4h-37hy.json";
const API_TOKEN = "4kcyEmNUO5eMPS726UXOmtBPF";

// Housing in NY DataSet
const URL_HOUSING = "https://data.cityofnewyork.us/api/views/hg8x-zxpr/rows.json?accessType=DOWNLOAD";

/*-- GLOBAL VARIABLES --*/

//Global map
var map;

//Initial coords n' marker for NYU Stern school of business
var nyu_coordinates = {lat:40.729055, lng:-73.996523};
var nyu_marker;

// global object for saving district info

  // The following format will be used to encode district information:
  //
  // districtObject = {
  //   borough:"string",                 MN: manhattan, BX:bronx, BK: brooklyn, QN: queens, SI:statenIsland
  //   district:"number",                districts enumerated from 1, acording to Housing in NY dataSet
  //   units:"number",                   maximum low income units in the district acording to housing in NY dataSet
  //   safety:"number",                  # of crimes comitted on 12/31/2015 on the district, acording to crimes in NY dataSet
  //   distance:"number",                distance from the center of the district to Purdue school of business
  //   districtShape:"arrOfCoordinates", points for making the perimeter of the district acording to geoShapes dataSet
  //   polygon: "google maps polygon",   polygon or array of polygons
  //   neighborhoods:"arrOfCoordinates"  coordinates of the neighborhoods inside the district
  // };
  //
  // Each habitable district will have one of this object, they will be added to their corresponding
  // borough on the following object:

var districtInfo = {
  manhattan: [],  // 12 districts
  bronx: [],      // 12 districts
  brooklyn: [],   // 18 districts
  queens: [],     // 14 districts
  statenIsland: []//  3 districts
}; // total districts: 59

// Array for saving crimes on 12-31-2015
var crimes = [];

// Array for saving the center of NY neighborhoods
var centroids = [];

//temp variable
var temp = [];

/*-- FUNCTIONS --*/

function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
    center: nyu_coordinates,
    zoom: 17,
    // gestureHandling: 'none'
  });

  nyu_marker = new google.maps.Marker({
    map: map,
    position: nyu_coordinates,
    title: 'N.Y.U. stern school of business',
  });

}//end of function

function getDataSets(){

  // Initialization cycles for district objects
  for(var i = 0; i < 12; i++){districtInfo.manhattan[i]={borough:"MN",district:(i+1), units:0, safety:0, distance:0, districtShape:{},polygon:[], neighborhoods:[]}};
  for(var i = 0; i < 12; i++){districtInfo.bronx[i]={borough:"BX",district:(i+1), units:0, safety:0, distance:0, districtShape:{},polygon:[], neighborhoods:[]}};
  for(var i = 0; i < 18; i++){districtInfo.brooklyn[i]={borough:"BK",district:(i+1), units:0, safety:0, distance:0, districtShape:{},polygon:[], neighborhoods:[]}};
  for(var i = 0; i < 14; i++){districtInfo.queens[i]={borough:"QN",district:(i+1), units:0, safety:0, distance:0, districtShape:{},polygon:[], neighborhoods:[]}};
  for(var i = 0; i < 3; i++){districtInfo.statenIsland[i]={borough:"SI",district:(i+1), units:0, safety:0, distance:0, districtShape:{},polygon:[], neighborhoods:[]}};

  // The following is a call back hell. Is the best I could to request data synchronously
  var dataHousing = $.get(URL_HOUSING,function(){})
  .done(function(){

    dataHousing = dataHousing.responseJSON.data;

    for (var i = 0; i < dataHousing.length; i++) {


      var boro = dataHousing[i][19].substring(0,2);
      var district = dataHousing[i][19].substring((dataHousing[i][19].length-2),(dataHousing[i][19].length));
      var district = Number(district);
      var curUnits = Number(dataHousing[i][33]);

      switch (boro){

        case "MN":

          if(curUnits >= districtInfo.manhattan[district-1].units){
            districtInfo.manhattan[district-1].units = curUnits;
          }

        break;

        case "BX":

          if(curUnits >= districtInfo.bronx[district-1].units){
            districtInfo.bronx[district-1].units = curUnits;
          }

        break;

        case "BK":

          if(curUnits >= districtInfo.brooklyn[district-1].units){
            districtInfo.brooklyn[district-1].units = curUnits;
          }

        break;

        case "QN":

          if(curUnits >= districtInfo.queens[district-1].units){
            districtInfo.queens[district-1].units = curUnits;
          }

        break;

        case "SI":

          if(curUnits >= districtInfo.statenIsland[district-1].units){
            districtInfo.statenIsland[district-1].units = curUnits;
          }

        break;

      }//end of switch

    }//end of for

    //pull geoShapes per district
    var dataGeoShapes = $.get(URL_GEOSHAPES,function(){})
    .done(function(){

      // object with polygons/multipolygons
      var temp =$.parseJSON(dataGeoShapes.responseText);
      var polArray = temp.features;


      for(var i = 0 ; i < polArray.length ; i++){

        var boroCD = polArray[i].properties.BoroCD.toString();
        var boro = boroCD.substring(0,1);
        boro = Number(boro);

        var district = boroCD.substring(1,3);
        district = Number(district);

        var geometry = polArray[i];
        var type = geometry.geometry.type;
        var pol = [];
        //console.log(geometry);
        switch(type){
          case"MultiPolygon":
            var temp = geometry.geometry.coordinates;
            for (subArray of temp) {
              var set = [];
              for (coords of subArray[0]) {
                var latLng = {lat:coords[1],lng:coords[0]};
                set.push(latLng);
              }
              var temp_pol = new google.maps.Polygon({
                paths: set,
                visible: true
              });

              pol.push(temp_pol);
              //console.log(pol);
            }
            //console.log(temp);
          break;

          case "Polygon":
            var temp_array = geometry.geometry.coordinates[0];
            var set = [];
            for (coords of temp_array) {
              var latLng = {lat:coords[1],lng:coords[0]};
              set.push(latLng);
            }

            var temp_pol = new google.maps.Polygon({
              paths: set,
              visible: true
            });

            pol.push(temp_pol);
          break;
        }

        switch(boro){

          case 1: //manhattan

            if(district <= 12){
              districtInfo.manhattan[district-1].districtShape = geometry;
              districtInfo.manhattan[district-1].polygon = pol;
            }

          break;

          case 2: //bronx

            if(district <= 12){
              districtInfo.bronx[district-1].districtShape = geometry;
              districtInfo.bronx[district-1].polygon = pol;
            }

          break;

          case 3: //brooklyn

            if(district <= 18){
              districtInfo.brooklyn[district-1].districtShape = geometry;
              districtInfo.brooklyn[district-1].polygon = pol;
            }

          break;

          case 4: //queens

            if(district <= 14){
              districtInfo.queens[district-1].districtShape = geometry;
              districtInfo.queens[district-1].polygon = pol;
            }

          break;

          case 5: //statenIsland

            if(district <= 3){
              districtInfo.statenIsland[district-1].districtShape = geometry;
              districtInfo.statenIsland[district-1].polygon = pol;
            }

          break;

        }// end of switch

      }// end of for

      $.ajax({
          url: URL_CRIMES+'?cmplnt_fr_dt=2015-12-31T00:00:00.000',
          type: "GET",
          data: {
            "$limit" : 5000,
            "$$app_token" : API_TOKEN
          }
      }).done(function(data) {
        // crimes becomes populated
        crimes = data;

        // sort crimes alphabetically by borough
        crimes.sort(function(a,b){
          if (a.boro_nm < b.boro_nm)
            return -1;
          if (a.boro_nm > b.boro_nm)
            return 1;
          return 0;
        })

        var dataHousing = $.get(URL_NEIGHNAMES, function(){})
        .done(function(){

          for (var i = 0; i < dataHousing.responseJSON.data.length; i++) {

            var n = dataHousing.responseJSON.data[i][9];
            //parse the coordinates
            var numeritos = n.substr(n.indexOf("(")+1,(n.indexOf(")")-n.indexOf("(")-1));
            var lg = numeritos.substr(0,numeritos.indexOf(" "));
            lg = Number(lg);
            var lt = numeritos.substr(numeritos.indexOf(" ")+1,n.length/2);
            lt = Number(lt);
            // get the name of neighborhood and borough
            var name = dataHousing.responseJSON.data[i][10];
            var boro = dataHousing.responseJSON.data[i][16];

            var subArray = [boro,name,lt,lg];
            //centroids becomes populated
            centroids.push(subArray);

          };//end of for

          /*SPACE FOR NEXT DATASET*/

          //This function adds the crimes comitted in each district
          addCrimes();

        })

      })

    })

  });

}

function getDistrictsInfo(){

}//end of function

function addCrimes(){

  // for (polygon of districtInfo.bronx[9].polygon) {
  //   polygon.setOptions({
  //     strokeColor: '#FF0000',
  //     strokeOpacity: 0.8,
  //     strokeWeight: 3,
  //     fillColor: '#FF0000',
  //     fillOpacity: 0.35
  //   })
  //   polygon.setMap(map);
  // }
  var crimesBr = crimes.filter(function( obj ) {
    return obj.boro_nm == "BRONX" && (obj.hasOwnProperty("latitude") && obj.hasOwnProperty("longitude"));
  });

  for(entry of crimesBr){
    var coords = new google.maps.LatLng(Number(entry.latitude), Number(entry.longitude));
    for(district of districtInfo.bronx){
      for(polygon of district.polygon){
        if(google.maps.geometry.poly.containsLocation(coords, polygon)){
          district.safety += 1;
        }
      }
    }
  }

  var crimesBk = crimes.filter(function( obj ) {
    return obj.boro_nm == "BROOKLYN" && (obj.hasOwnProperty("latitude") && obj.hasOwnProperty("longitude"));
  });

  for(entry of crimesBk){
    var coords = new google.maps.LatLng(Number(entry.latitude), Number(entry.longitude));
    for(district of districtInfo.brooklyn){
      for(polygon of district.polygon){
        if(google.maps.geometry.poly.containsLocation(coords, polygon)){
          district.safety += 1;
        }
      }
    }
  }

  var crimesMn = crimes.filter(function( obj ) {
    return obj.boro_nm == "MANHATTAN" && (obj.hasOwnProperty("latitude") && obj.hasOwnProperty("longitude"));
  });

  for(entry of crimesMn){
    var coords = new google.maps.LatLng(Number(entry.latitude), Number(entry.longitude));
    for(district of districtInfo.manhattan){
      for(polygon of district.polygon){
        if(google.maps.geometry.poly.containsLocation(coords, polygon)){
          district.safety += 1;
        }
      }
    }
  }

  var crimesQn = crimes.filter(function( obj ) {
    return obj.boro_nm == "QUEENS" && (obj.hasOwnProperty("latitude") && obj.hasOwnProperty("longitude"));
  });

  for(entry of crimesQn){
    var coords = new google.maps.LatLng(Number(entry.latitude), Number(entry.longitude));
    for(district of districtInfo.queens){
      for(polygon of district.polygon){
        if(google.maps.geometry.poly.containsLocation(coords, polygon)){
          district.safety += 1;
        }
      }
    }
  }

  var crimesSi = crimes.filter(function( obj ) {
    return obj.boro_nm == "STATEN ISLAND" && (obj.hasOwnProperty("latitude") && obj.hasOwnProperty("longitude"));
  });

  for(entry of crimesSi){
    var coords = new google.maps.LatLng(Number(entry.latitude), Number(entry.longitude));
    for(district of districtInfo.statenIsland){
      for(polygon of district.polygon){
        if(google.maps.geometry.poly.containsLocation(coords, polygon)){
          district.safety += 1;
        }
      }
    }
  }

  console.log(districtInfo);

  // for (entry of crimesBr) {
  //   var coords = new google.maps.LatLng(Number(entry.latitude), Number(entry.longitude));
  // }

  // for (district of districtInfo.bronx) {
  //
  //   var geoContainer = district.districtShape.geometry.coordinates;
  //   for (array of geoContainer) {
  //     var set = [];
  //     for (coords of array[0]) {
  //       var latLng = {lat:coords[1],lng:coords[0]};
  //       set.push(latLng);
  //     }
  //     console.log(set);
  //   }

    // if(google.maps.geometry.poly.containsLocation(coords, polygon)){
    //   //console.log("HIT!");
    //
    // }

  //}


  // var ds = districtInfo.bronx[0].districtShape.geometry.coordinates[0];
  // console.log(ds);
  // var set = [];
  // for (coords of ds) {
  //   var latLng = {lat:coords[1],lng:coords[0]};
  //   set.push(latLng);
  // }
  //
  // var polygon = new google.maps.Polygon({
  //   paths: set,
  //   visible: true
  // });
  // //polygon.setMap(map);
  //
  // console.log(centroids);
  //
  // for (entry of crimes) {
  //   if(entry.hasOwnProperty("latitude") && entry.hasOwnProperty("longitude")){
  //     var coords = new google.maps.LatLng(Number(entry.latitude), Number(entry.longitude));
  //     if(google.maps.geometry.poly.containsLocation(coords, polygon)){
  //       console.log("HIT!");
  //       temp = new google.maps.Marker({
  //         map: map,
  //         position: coords,
  //         title: entry.ofns_desc
  //       });
  //     }
  //   }
  // }

  //var list = ["BRONX","BROOKLYN","MANHATTAN","QUEENS","STATEN ISLAND"];
  /*for (boro of list) {

      var result = crimes.filter(function( obj ) {
        return obj.boro_nm == boro && (obj.hasOwnProperty("latitude") && obj.hasOwnProperty("longitude"));
      });
      console.log(result.length);

  }*/

  /*for (entry of crimes) {
    if(entry.hasOwnProperty("latitude") && entry.hasOwnProperty("longitude")){
      var coords = new google.maps.LatLng(Number(entry.latitude), Number(entry.longitude))
      temp = new google.maps.Marker({
        map: map,
        position: coords,
        title: entry.ofns_desc
      });
    }
  }*/
}

$(document).ready(function(){
  getDataSets();
  $("#test").on("click",getDistrictsInfo);
  //$("#getHousingButton").on("click",test);
})
