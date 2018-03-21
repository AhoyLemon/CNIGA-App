// Call onDeviceReady when Cordova is loaded.
//
// At this point, the document has loaded but cordova-2.2.0.js has not.
// When Cordova is loaded and talking with the native device,
// it will call the event `deviceready`.
//

function onLoad() {
  document.addEventListener("deviceready", onDeviceReady, false);
  new Audio('audio/ready.mp3').play();
  alert('this is version 5! (full system, but with alerts)');
}

onLoad();

// Cordova is loaded and it is now safe to make calls Cordova methods
function onDeviceReady() {
  document.addEventListener("pause", onPause, false);
  document.addEventListener("resume", onResume, false);
}

// Handle the pause event
//
function onPause() {
  //new Audio('audio/ready.mp3').play();
  alert('on pause event start');
  document.getElementById("iframe").src = "about:blank";
  alert('on pause event end');
}


function onResume() {
  //new Audio('audio/ready.mp3').play();
  alert('on resume event start');
  document.getElementById("iframe").src = "https://cniga.com";
  alert('on resume event end');
}