// Call onDeviceReady when Cordova is loaded.
//
// At this point, the document has loaded but cordova-2.2.0.js has not.
// When Cordova is loaded and talking with the native device,
// it will call the event `deviceready`.
//

function onLoad() {
  document.addEventListener("deviceready", onDeviceReady, false);

  var debugURL = authURL + "/api/Device/Debug?param=AndroidDeviceReadyEventListener";
  fetch( debugURL ).then( response => {
    console.log( 'API DEBUG RESPONSE: ', response );
  }).catch(function(err) {
    console.log( 'API DEBUG ERROR: ', err );
  });
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
  document.getElementById("iframe").src = "about:blank";
}


function onResume() {
  document.getElementById("iframe").src = "https://cniga.com";
}