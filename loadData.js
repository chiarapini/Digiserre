function loadData() {
//sunset and sunrise times are defined by API data from sunrise-sunset.org
//Brussels, Belgium data: Latitude: 50.8503396 / Longitude: 4.3517103 / Time zone: Europe/Brussels
loadJSON('http://api.sunrise-sunset.org/json?lat=50.8503396&lng=4.351710300000036&formatted=0', function(data) {
    sunrise = new Date(data.results.sunrise);
    sunset = new Date(data.results.sunset);
});
  
//Loading light data
loadJSON('https://api.particle.io/v1/devices/'+deviceID+'/lightval?access_token='+accessToken,
    function(data){
      lightval = data.result;
      if (lightval != null) { // Time data for the graph
      time = new Date();
      }
    });

//Loading temperature data
loadJSON('https://api.particle.io/v1/devices/'+deviceID+'/temperature?access_token='+accessToken,
  function(data) { temperature = data.result;});

//Loading humidity data
loadJSON('https://api.particle.io/v1/devices/'+deviceID+'/humidity?access_token='+accessToken,
  function(data) {humidity = data.result;
    moisture = int(map(humidity,0,3800,0,100));
});
}