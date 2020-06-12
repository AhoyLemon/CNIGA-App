// jshint -W117
function snap(array, search_term) {
  for (var i = array.length - 1; i >= 0; i--) {
    if (array[i] === search_term) {
      array.splice(i, 1);
      if (multi === true) {
        break;
      }
    }
  }
}

////////////////////////////////////////////
// Event logging
// This will report events back to Google Analytics, Piwik, or to the console, depending.
function trackEvent(c, a, l, v) {
  if (v) {
    _paq.push(['trackEvent', c, a, l, v]);
    //ga('send', 'event', { eventCategory: c, eventAction: a, eventLabel: l, eventValue:v });
    console.log('CATEGORY: '+c+', ACTION:'+a+', LABEL:'+l+', VALUE:'+v);
  } else if (l) {
    _paq.push(['trackEvent', c, a, l]);
    //ga('send', 'event', { eventCategory: c, eventAction: a, eventLabel: l });
    console.log('CATEGORY: '+c+', ACTION:'+a+', LABEL:'+l);
  } else {
    _paq.push(['trackEvent', c, a]);
    //ga('send', 'event', { eventCategory: c, eventAction: a });
    console.log('CATEGORY: '+c+', ACTION:'+a);
  }
}

var _paq = _paq || [];
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
window.onload =  function() {
  var u="https://circle.red/stats/";
  _paq.push(['setTrackerUrl', u+'piwik.php']);
  _paq.push(['setSiteId', '2']);
  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
};

// jshint -W117
// jshint -W119

//@prepros-prepend partials/_functions.js

var windowHeight = window.innerHeight;
var authURL = "http://204.232.242.136:8008";

var app = new Vue({
  el: '#app',
  data: {
    my: {
      userType: 'guest',
      view: 'welcome',
      contactChoice: false,
      contactEmail: "",
      readItems: [],
      unreadItems: 0,
      sentBills: [],
      expandedBills: [],
      email: '',
      loginCode: '',
      authToken: ''
    },
    loginStatus: 'guest',
    news: [],
    conference: {},
    billsLoading: true,
    stateSupport: {},
    stateSupportShow: false,
    stateOppose: {},
    stateOpposeShow: false,
    stateMonitor: {},
    stateMonitorShow:false,
    schedule: {},
    scheduleShow: false
  },
  computed: {
    myNews: function(){
      var self = this;
      return self.news.map(function(story){
       if(self.my.readItems.indexOf(story.slug) !== -1)
         story.read = true;
        return story;
     })
    }
  },
  methods: {
    debugToApi: function( param ){
      // uncomment when needing to debug and send params to the server for logging
      var debugURL = authURL + "/api/Device/Debug?param="+ encodeURIComponent( param );

      console.log('API DEBUG: ', debugURL);

      // need extra then step to transform it to JSON
      fetch( debugURL ).then( response => {
        console.log( 'API DEBUG RESPONSE: ', response );
      }).catch(function(err) {
        console.log( 'API DEBUG ERROR: [' + param + ']', err );
      });
    },

    checkEmail: function() {
      var self = this;
      var emailURL = authURL + "/api/Registration/ValidateEmailAddressAndSendEmailToMember?emailAddress="+ encodeURIComponent(self.my.email);

      console.log('IOSDEBUG:  VALIDATE EMAIL URL: ', emailURL);
      alert( 'IOSDEBUGALERT: ' + emailURL );
      self.loginStatus = "checking";


      // need extra then step to transform it to JSON
      fetch( emailURL ).then( response => response.json() ).then( data => {
        
        alert( 'GOT FETCH: ' + JSON.stringify(data) );
        // data = JSON transformed data
        // data = { "success":true/false, "emailRecipient": "email@email.com", "errorMessage": "" }
        if ( data.success ) {
          self.loginStatus = 'validating';
        }
        else {
          self.loginStatus = 'error';
        }
      }).catch(function(err) {
        console.log( 'IOSDEBUG:  Validate Email Error: ' + err );
        alert( 'FETCH ERROR: ' + JSON.stringify(err) );
        self.loginStatus = 'error';

        self.debugToApi( 'CHECK EMAIL ERROR' );
      });

      console.log( 'IOSDEBUG: finished check email but nothing: ' + self.loginStatus );
      alert( 'IOSDEBUGALERT: finished check email but nothing: ' + self.loginStatus );
    },

    checkLoginCode: function() {
      var self = this
      var m = self.my.loginCode.toUpperCase();
      var verifyURL = authURL + "/api/Registration/VerifyRegistrationCodeAndCreateUser?emailAddress=" + encodeURIComponent(self.my.email) +"&registrationCode=" + encodeURIComponent(m);
      fetch (verifyURL).then(function(res){ return res.json()})
        .then(function(content){
          if (content.success) {
            self.loginStatus = 'member';
            self.my.userType = 'member';
            self.my.view = 'news';
            self.my.authToken = content.cnigaAuthToken;
            self.countUnreadNews();
            self.bindEvents();
            self.getContent();
            self.getBills();
          } else {
            self.loginStatus = 'validateError';
          }
        })
        .catch(function(error){
          console.log(error);

          // set to error
          self.loginStatus = 'validateError';
        })
    },


    beforeEnter: function (el) {
      el.style.opacity = 0
    },
    slideDown: function (el, done) {
      Velocity(el, 'slideDown', {duration: 500})
      //-Velocity(el, 'fadeIn', {duration: 300})
      //Velocity(el, { opacity: 1, fontSize: '1.4em' }, { duration: 300 })
      //Velocity(el, { fontSize: '1em' }, { complete: done })
    },
    slideUp: function (el, done) {
      Velocity(el, 'slideUp', {duration: 300})
    },

    openLink: function(destination, target){
      if(typeof(cordova) !== 'undefined'){
        window.open = cordova.InAppBrowser.open;
      }
      window.open(destination, target)
    },
    emailLink: function(emailTitle,emailBody){
      return "mailto:?subject=" + emailTitle + "&body=" + emailBody;
    },
    markNewsRead: function(item){
      var self = this;
      if(self.my.readItems.indexOf(item) === -1)
        self.my.readItems.push(item);
      self.countUnreadNews();
    },
    countUnreadNews: function(){
      var self = this;
      self.my.unreadItems = 0;
      self.news.map(function(story){
       if(self.my.readItems.indexOf(story.slug) === -1)
         self.my.unreadItems++;
     })
    },
    bindEvents: function() {
      const self = this;

      console.log('Bind Events');
      document.addEventListener( 'deviceready', this.onDeviceReady, false );

      self.debugToApi( 'BIND EVENTS' );
    },
    onDeviceReady: function() {
      var self = this;
      self.deviceready = true;

      self.debugToApi( 'IOS DEVICE READY' );
      alert( 'ON DEVICE READY' );

      app.setupPush();
    },
    setupPush: function() {
      var self = this;
      console.log('IOS SETUP PUSH: calling push init');

      // for ios devices - implement Pushy
      Pushy.listen();

      try{
        Pushy.register( function( err, deviceToken ){
          if( err ){
            // log
            self.debugToApi( 'PUSHY REGISTERED ERROR: ' + err );
          }
          else{
            // success - get token and set up listeners
            self.debugToApi( 'PUSHY REGISTERED SUCCESSFULLY. TOKEN: ' + deviceToken );

            // save token to db
            // deviceType:
            // 1 = Android
            // 2 = iOS
            // 3 = Pushy
            fetch( authURL+'/api/Device/UpdateMemberDeviceInfo?authToken=' + self.my.authToken + '&deviceType=3&deviceId=' + deviceToken )
              .then(function(){
                self.debugToApi( 'PUSHY TOKEN SAVED TO DATABASE. TOKEN: ' + deviceToken );
              })
              .catch( function( e ){
                self.debugToApi( 'PUSHY TOKEN SAVED TO DATABASE ERROR. TOKEN: ' + deviceToken + ' -- ERROR: ' + e );
              });

              var oldRegId = localStorage.getItem( 'registrationId' );
              if ( oldRegId !== deviceToken ) {
                localStorage.setItem( 'registrationId', deviceToken );
                // Post registrationId to your app server as the value has changed
                // NOTE: ONLY SEND DEVICE ID TO SERVER IF THE USER IS LOGGED IN
                // I.E. USE THE CHECK LOGIN CODE METHOD
              }
            }
        });

        Pushy.setNotificationListener( function ( data ){
          navigator.notification.alert(
            data.message,         // message
            null,                 // callback
            data.title,           // title
            'Ok'                  // buttonName
          );
        });
      }
      catch( ex ){
        self.debugToApi( 'PUSHY TRY CATCH ERROR: ' + err );
      }





      /*
      var push = PushNotification.init({
        "android": {
          "icon": "white",
          "iconColor": "#f26c51",
          "senderID": "1098348384269"
        },
        "browser": {},
        "ios": {
          "sound": true,
          "vibration": true,
          "badge": true
        },
        "windows": {}
      });
      console.log('after init');

      push.on('registration', function(data) {
        console.log( 'REGISTRATION DATA: ', JSON.stringify(data));
        console.log( 'Device ID: ' + data.registrationId );
        console.log( 'Device Type: ' + data.registrationType );

        
        // for iOS apps - for some reason it doesn't get the correct token so instead - get the UUID and attempt to send push notification
        var devicePlatform = device.platform;
        var uuId = device.uuid;

        console.log( 'DEVICE PLATFORM: ', devicePlatform);
        console.log( 'DEVICE ID: ', uuId);

        self.debugToApi( 'DEVICE PLATFORM - ' + devicePlatform );
        self.debugToApi( 'DEVICE UUID - ' + uuId );

        var apiDeviceId = data.registrationId;
        
        // 1 = Android
        // 2 = iOS
        var deviceType = data.registrationType === 'FCM' ? 1 : 2;

        if( devicePlatform.toUpperCase() == 'IOS' ){
          deviceType = 2;
        }

        fetch( authURL+'/api/Device/UpdateMemberDeviceInfo?authToken=' + self.my.authToken + '&deviceType=' + deviceType + '&deviceId=' + apiDeviceId )
        .then(function(){
          console.log('Device added to database');
        })
        .catch(function(e){
          console.log(e);
        });

        var oldRegId = localStorage.getItem('registrationId');
        if ( oldRegId !== apiDeviceId ) {

          // Save new registration ID
          // Call update API method
          localStorage.setItem( 'registrationId', apiDeviceId );
          // Post registrationId to your app server as the value has changed
          // NOTE: ONLY SEND DEVICE ID TO SERVER IF THE USER IS LOGGED IN
          // I.E. USE THE CHECK LOGIN CODE METHOD
        }

        self.debugToApi( 'PUSH ON REGISTRATION - ' + data.registrationId );
        self.debugToApi( 'PUSH ON REGISTRATION DATA - ' + JSON.stringify( data ) );
        self.debugToApi( 'PUSH ON REGISTRATION Determine Registration Type: ' + data.registrationType );
        self.debugToApi( 'PUSH ON REGISTRATION Determine Device Type: ' + deviceType );
      });

      push.on('error', function(e) {
        console.log("push error = " + e.message);

        self.debugToApi( 'PUSH ON ERROR - ' + e.message );
      });

      push.on('notification', function(data) {
        console.log('notification event');
        navigator.notification.alert(
          data.message,         // message
          null,                 // callback
          data.title,           // title
          'Ok'                  // buttonName
        );
      });
      */
    },
    getContent: function(){
      var self = this;
      fetch('https://circle.red/cniga/')
        .then(function(res){ return res.json()})
        .then(function(content){
        self.schedule = content.schedule;
        self.news = content.news;
        self.conference = content.conference;
        self.countUnreadNews();

        console.log('IOSDEBUG:  GET CONTENT URL: https://circle.red/cniga/');
        console.log('IOSDEBUG:  GET CONTENT: ' + content);
      }).catch(function(err){
        console.log( 'IOSDEBUG:  GET CONTENT ERROR: ' + err);
        self.countUnreadNews();

        self.debugToApi( 'IOSDEBUG:  GET CONTENT ERROR' );
      })
    },
    getBills: function(){
      var self = this;

      fetch('https://circle.red/cniga/legislation')
        .then(function(res){ return res.json()})
        .then(function(content){
        self.stateSupport = content.billssupporting
        self.stateOppose = content.billsopposing
        self.stateMonitor = content.billsmonitoring
        self.billsLoading = false
      }).catch(function(err){
        console.log( 'GET BILLS ERROR: ' + err);

        self.debugToApi( 'GET BILLS ERROR' );
      })

    },
    toggleEmailSent: function(billName){
      var self = this;
      if(self.my.sentBills.indexOf(billName) === -1){
        self.my.sentBills.push(billName);
      } else {
        self.my.sentBills.splice(self.my.sentBills.indexOf(billName), 1)
      }
      trackEvent('Member marked email sent', billName)
      //console.log(self.my.sentBills);
    },
    toggleBillCollapse: function(b){
      //var self = this;
      //alert(b);
      var self = this;
      if (self.my.expandedBills.includes(b)) {
        var i = self.my.expandedBills.indexOf(b);
        if(i != -1) {
          self.my.expandedBills.splice(i, 1);
        }
        //alert('remove collapse!')
      } else {
        self.my.expandedBills.push(b);
        //alert('add collapse!');
      }
    },
    getMyData: function() {
      var self = this;
      var store = self.getObjectStore('my', 'readonly');
      var req = store.openCursor();

      //self.debugToApi( 'GET MY DATA STARTED' );

      req.onsuccess = function(evt) {
        var cursor = evt.target.result;
        if (cursor) {
          self.my = cursor.value;
          var myToken = JSON.stringify(self.my.authToken, null, 2);
          myToken = myToken.replace(/"/g,"");

          // failing because token is empty - need to check on API side since it's returning a 500 error
          if( myToken !== '' ){

            console.log('TOKEN: ', myToken);
            console.log('ENCODED TOKEN: ', encodeURIComponent(myToken));

            fetch(authURL+'/api/Registration/VerifyToken?token=' + encodeURIComponent(myToken)).then(function(res){
              return res.json()
            }).then(function(verification){

              console.log('VERIFY TOKEN RESPONSE: ', verification);
              if(verification.isValid){
                if (self.error_msg) {
                  self.my.view = 'error';
                } else {
                  self.countUnreadNews();
                  self.bindEvents();
                  self.getContent();
                  self.getBills();
                  self.my.view = 'news';
                }
              } else{
                self.loginStatus = 'guest';
                self.my.userType = 'guest';
                self.my.view = 'welcome';
              }
            })
            .catch(function(err){
              self.debugToApi( 'FETCH TOKEN ERROR - ' + myToken );

              console.log("Verify Token Error: " + err);
              
              // if there is an API error
                self.loginStatus = 'guest';
                self.my.userType = 'guest';
                self.my.view = 'welcome';
            });
          }
        }
      };
    },
    updateMyData: function(){
      var self = this;
      var store = self.getObjectStore('my', 'readwrite');

      var getCount = store.count();
      getCount.onsuccess = function(evt){
        if (evt.target.result === 0){
          try {
            var req = store.add(self.my, 0);
          } catch (e) {
            throw e;
          }
        }
        else{
          var req = store.openCursor();
          req.onsuccess = function(evt) {
            var cursor = evt.target.result;
            if(cursor){
              try {
                cursor.update(self.my);
              } catch (e) {
                throw e;
              }
            }
          };
        }
      };
    },
    getObjectStore: function(storeName, protocol){
      var self = this;
      return self.db.transaction(storeName, protocol).objectStore(storeName);
    },
    trackEvent: function(c, a, l, v) {
      if (v) {
        _paq.push(['trackEvent', c, a, l, v]);
        //ga('send', 'event', { eventCategory: c, eventAction: a, eventLabel: l, eventValue:v });
        console.log('CATEGORY: '+c+', ACTION:'+a+', LABEL:'+l+', VALUE:'+v);
      } else if (l) {
        _paq.push(['trackEvent', c, a, l]);
        //ga('send', 'event', { eventCategory: c, eventAction: a, eventLabel: l });
        console.log('CATEGORY: '+c+', ACTION:'+a+', LABEL:'+l);
      } else {
        _paq.push(['trackEvent', c, a]);
        //ga('send', 'event', { eventCategory: c, eventAction: a });
        console.log('CATEGORY: '+c+', ACTION:'+a);
      }
    },
    sendContactEmail: function(e){
      e.preventDefault()
      var self = this
      console.log(self.my.contactEmail)
      if(self.my.contactChoice === 'form'){
        var subject = "Form request from " + self.my.email
      } else if(self.my.contactChoice === 'question'){
        var subject = "Question from " + self.my.email
      }
      var email = new FormData()
      email.append('subject', subject)
      email.append('message', self.my.contactEmail)
      email.append('sender', self.my.email)

      console.log( 'IOSDEBUG:  Attempt to send contact email to mail.php' );

      fetch('https://circle.red/cniga/mail.php', { method: 'POST',body: email,})
      .then(function(response) {
        console.log(response)
      }).catch(function(error) {
        console.error( 'IOSDEBUG:  SEND CONTACT EMAIL ERROR: ' + error);
      })

      self.my.contactChoice = false;
      self.my.contactEmail = "";
      return false
    }
  },
  mounted: function () {
    var self = this;
    var request = indexedDB.open("CNIGAApp", 3);

    console.log( 'IOSDEBUG: CNIGA mounted!!!' );
    alert( 'IOSDEBUGALERT: CNIGA mounted!!!' );
    
    self.countUnreadNews();
    self.bindEvents();
    self.getContent();
    self.getBills();

    request.onerror = function(event) {
      self.indexed = "Can't use IndexedDB";
    };
    request.onsuccess = function(event) {
      self.db = this.result;

      self.getMyData();
    };
    request.onupgradeneeded = function(event) {
      var objStore = event.currentTarget.result.createObjectStore('my');
    };
  },
  updated: function() {
    var self = this;
    var request = indexedDB.open("CNIGAApp", 3);

    request.onerror = function(event) {
      self.indexed = "Can't use IndexedDB";
    };
    request.onsuccess = function(event) {
      self.db = this.result;
      self.updateMyData();
    };
    request.onupgradeneeded = function(event) {
      var objStore = event.currentTarget.result.createObjectStore('my');
    };
  }
});


//# sourceMappingURL=cniga.min.js.map