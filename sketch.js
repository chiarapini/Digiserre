var deviceID = config.deviceID; //Photon's Device ID
var accessToken = config.accessToken; // Photon's Access Token

var now = new Date();

//data variables
var sunset, sunrise;
var lightval, lightvals = new Array();
var temperature, temperatures = new Array();
var humidity, humidities = new Array();
var moisture;

//dashboard variables
var reqLight;
var weather;
var salut;
var ledFeedback;
var daytrue = false;
var tempSet = 20;
var fanState;
var pumpState;
var minutes;

//Count Time (corriger?)
var countTime = false; // "timer" 
var countLight = 0;
var requiredHours = 5; // light needed (hours)
var requiredLight = requiredHours * 60 * 60 * 1000;//light needed (millis)
var missingLight;

//graph variables
var light_graph;
var temp_graph;
var humidity_graph;
var time, times = new Array(); //array time pour le x axis du graph
var val, valPrec; // measured values to draw the line graph
var step = 50;
var w, h = 200; //graph width/height
var margin = 50;
var size = h + margin;
var padding = 10;

function setup() {
  createCanvas(windowWidth, 1000);
  
  setInterval(control, 1000);
  setInterval(loadData,1000);
  setInterval(dashboard,1000);
  setInterval(drawGraph,1000*60); //Draw graph data every minute
 
  w = windowWidth - 100; //responsive graph width

  // new object: graphs
  light_graph = new Graph(0, 0, 2300, 100, "light",230,230,0);
  temp_graph = new Graph(0, 1 * (h + 2 * margin), 40, 110, "temperature",255,50,0);
  humidity_graph = new Graph(0, 2 * (h + 2 * margin), 100+"%", 60, "humidity",0,0,230);
  
  //display graphs when the window is loaded
  light_graph.display();
  temp_graph.display();
  humidity_graph.display();

  //HTML BUTTON CONTROL
  var required_time = select('#submit'); // choose your time (for testing)
  required_time.mousePressed(function() {
    now.setHours(parseInt(select('#set_desired_time').value()))
  })

  var reset_time = select('#resettime_s');// reset time (for testing)
  reset_time.mousePressed(function() {
    now = new Date();
  })

  var required_light = select('#send_desired_light'); // required light amount
  required_light.mousePressed(function() {
    requiredHours = parseInt(select('#set_desired_light').value());
    requiredLight = requiredHours * 60 * 60 * 1000;
  })

  var tempSwitch = select('#sendtemp');// optimal temperature setting
  tempSwitch.mousePressed(function() {
    tempSet = select('#set_desired_temp').value();
    httpPost('https://api.particle.io/v1/devices/'+deviceID+'/tempSwitch?access_token='+accessToken, 
    {args: tempSet},"text")
  })
}

//make it responsive
function windowResized() {
  resizeCanvas(windowWidth, 1000);
  w = windowWidth - 100;
}

function dashboard() {
  //Dinamic greetings condition
  if (now.getHours()<14) {salut= "Good morning";}
  else if (now.getHours()>=14 && now.getHours()<18){salut ="Good afternoon";}
  else if (now.getHours()>=18 && now.getHours()<23) {salut ="Good evening";}
  else {salut ="Good night";}
  
  if (moisture<30){pumpState="ON";}else if (moisture>80){pumpState="OFF";} //Pump state
  
  fanState = ((tempSet<temperature)?"ON":"OFF");//Fan state
  
  //Missing light 
  var missingLight_minutes = (missingLight/1000/60)%60
  if (
    missingLight_minutes < 10) { missingLight_minutes = "0"+missingLight_minutes;}
  reqLight = ((missingLight<=3600000)?int (missingLight_minutes) +" minutes":int(missingLight/1000/60/60)+" hours and "+int(missingLight_minutes) +" minutes")
  console.log(missingLight);
  //Luminosity conditions
  if (lightval>1000) { weather = str("very bright");} else if (lightval>600 && lightval<1000){weather = str("bright");}
    else {weather = str("dark");}
  
  //LED light feedback  
  if (daytrue==true){
    ledFeedback = str("is getting sunlight");}
  if (daytrue==false){ 
    if (missingLight>0){
      ledFeedback = str("needs more light");} 
      else {
      ledFeedback = str("had enough light");}
    }
  // 13:09 instead of 13:9 = add a zero when minutes are < 10
  if (now.getMinutes()<10){
    minutes="0";
  } else {minutes="";}  
    
  //Dinamic ID Elements
  document.getElementById("salut").innerHTML = str(salut);
  document.getElementById("now").innerHTML = now.getHours() +":"+minutes+now.getMinutes();
  document.getElementById("temp").innerHTML = temperature + "°C";
  document.getElementById("weather").innerHTML = weather;
  document.getElementById("reqLight").innerHTML = reqLight;
  document.getElementById("fanState").innerHTML = str(fanState);
  document.getElementById("tempReq").innerHTML = tempSet + "°C";
  document.getElementById("moisture").innerHTML = moisture + " %";
  document.getElementById("pumpState").innerHTML = str(pumpState);
  document.getElementById("ledFeedback").innerHTML = ledFeedback;
  now=new Date();
}

function drawGraph() {
  light_graph = new Graph(lightval, lightvals, 0, 0, 2300, 100, "light",230,230,0);
  temp_graph = new Graph(temperature, temperatures, 0, 1 * (h + 2 * margin), 40, 110, "temperature",255,50,0);
  humidity_graph = new Graph(humidity, humidities, 0, 2 * (h + 2 * margin), 100, 60, "humidity",0,0,230);
  
  background(255);
  //Draw graph structure for each loop
  light_graph.display();
  temp_graph.display();
  humidity_graph.display();
}

function control() {

  if (now >= sunrise && now <= sunset) { //day/night depending on current time and sunset/sunrise
    isDay(); 
  } else if (now < sunrise || now > sunset) {
    isNight();
  }
  missingLight = requiredLight - countLight;
}

function isDay() {
  daytrue=true;
  lightOff(); //turn off the lights if they're on
  countTime =((lightval < 400) ? false : true); // stop count if lightval is les than 400 during the day, else restart
  ((countTime == true) ? countLight = countLight + 1000 : null);
 // console.log('IS DAY, light: ' + lightval + ', humidity: ' + humidity+","+ moisture + '%, temperature: ' + temperature + '°C, missing light: ' + missingLight);
}

function isNight() {
  daytrue=false;
  if (countLight < requiredLight) {
    lightOn(); //can I put the content of the function below directly here??
    countLight = countLight + 1000;
  } else {
    lightOff();
  }
//((isNight() && countLight < requiredLight)? lightOn():lightOff()) + add in lightOn countlight=++
  //console.log('IS NIGHT, light: ' + lightval + ', humidity: '+ humidity+"," + moisture + '%, temperature: ' + temperature + '°C,missing light' + (requiredLight - countLight));
}

//LED light control via HttpPost
function lightOn() {
  document.getElementById("ledOn").innerHTML = "ON";
  httpPost('https://api.particle.io/v1/devices/'+deviceID+'/led?access_token='+accessToken, {
    args: 'on'});
}

function lightOff() {
  document.getElementById("ledOn").innerHTML = "OFF";
  httpPost('https://api.particle.io/v1/devices/'+deviceID+'/led?access_token='+accessToken, {
    args: 'off'
  });
}
