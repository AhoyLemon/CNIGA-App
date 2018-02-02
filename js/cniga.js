// jshint -W117
// jshint -W119

//@prepros-prepend partials/_functions.js

var windowHeight = window.innerHeight;

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

    checkEmail: function() {
      var self = this
      var emailURL = 'http://204.232.242.150:8008/api/Registration/ValidateEmailAddressAndSendEmailToMember?emailAddress='+ encodeURIComponent(self.my.email);

      self.loginStatus = "checking";

      fetch (emailURL).then(function(res) { return res.json()})
        .then(function(content){
        console.log(content);
        if (content.success) {
          self.loginStatus = 'validating';
        } else {
          self.loginStatus = 'error';
        }
      })
        .then(function() {
          console.log( "second success" );
        })
        .catch(function(err) {
          console.log( err );
        })
    },

    checkLoginCode: function() {
      var self = this
      var m = self.my.loginCode.toUpperCase();
      var verifyURL = 'http://204.232.242.150:8008/api/Registration/VerifyRegistrationCodeAndCreateUser?emailAddress=' + encodeURIComponent(self.my.email) +'&registrationCode=' + encodeURIComponent(m);
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
          console.log(error)
        })
    },

    newAlert: function(text) {
      alert(text);
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
      /*self.news.forEach(function(element) {
        if (!element.read) {
          self.my.unreadItems++;
        }
      });*/
    },
    bindEvents: function() {
      console.log('Bind Events');
      document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
      var self = this;
      self.deviceready = true;
      console.log('Received Device Ready Event');
      console.log('calling setup push');
      app.setupPush();
    },
    setupPush: function() {
      var self = this;
      console.log('calling push init');
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
        console.log('registration event: ' + data.registrationId);
        console.log('Device Type: ' + data.registrationType);
        var deviceType = data.registrationType === 'FCM' ? 1 : 2
        fetch('http://204.232.242.150:8008/api/Device/UpdateMemberDeviceInfo?authToken=' + self.my.authToken + '&deviceType=' + deviceType + '&deviceId=' + data.registrationId)
        .then(function(){
          console.log('Device added to database')
        })
        .catch(function(e){
          console.log(e)
        })
        var oldRegId = localStorage.getItem('registrationId');
        if (oldRegId !== data.registrationId) {

          // Save new registration ID
          // Call update API method
          localStorage.setItem('registrationId', data.registrationId);
          // Post registrationId to your app server as the value has changed
          // NOTE: ONLY SEND DEVICE ID TO SERVER IF THE USER IS LOGGED IN
          // I.E. USE THE CHECK LOGIN CODE METHOD
        }
      });

      push.on('error', function(e) {
        console.log("push error = " + e.message);
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
    },
    getContent: function(){
      var self = this;
      fetch('https://circle.red/cniga/')
        .then(function(res){ return res.json()})
        .then(function(content){
        self.schedule = content.schedule;
        self.news = content.news;
        self.countUnreadNews();
      }).catch(function(err){
        console.log(err);
        self.countUnreadNews();
      })
    },
    getBills: function(){
      var self = this;
      //fetch('http://localhost/cniga/legislation')

      fetch('https://circle.red/cniga/legislation')
        .then(function(res){ return res.json()})
        .then(function(content){
        self.stateSupport = content.billssupporting
        self.stateOppose = content.billsopposing
        self.stateMonitor = content.billsmonitoring
        self.billsLoading = false
      }).catch(function(err){
        console.log(err)
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

      req.onsuccess = function(evt) {
        var cursor = evt.target.result;
        if (cursor) {
          self.my = cursor.value;
          var myToken = JSON.stringify(self.my.authToken, null, 2);
          myToken = myToken.replace(/"/g,"");
          fetch('http://204.232.242.150:8008/api/Registration/VerifyToken?token=' + encodeURIComponent(myToken))
            .then(function(res){
              return res.json()
            })
            .then(function(verification){
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
              console.log("Error" + err)
            })
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
      var self = this
      if(self.my.contactChoice === 'form'){
        var subject = "Form request from " + self.my.email
      } else if(self.my.contactChoice === 'question'){
        var subject = "Question from " + self.my.email
      }
      var email = new FormData()
      email.append('subject', subject)
      email.append('message', self.my.contactEmail)
      email.append('sender', self.my.email)
      fetch('https://circle.red/cniga/mail.php', { method: 'POST',body: email,})
      .then(function(response) {
        console.log(response)
      }).catch(function(error) {
        console.error(error)
      })
      //self.my.contactChoice = false;
      //self.my.contactEmail = "";

    }
  },
  mounted: function () {
    var self = this;
    var request = indexedDB.open("CNIGAApp", 3);

    request.onerror = function(event) {
      self.indexed = "Can't use IndexedDB";
    };
    request.onsuccess = function(event) {
      self.db = this.result;
      self.getMyData();
      //self.my.view = "news";
      //self.my.view = "welcome";
      //alert(self.my.view);
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
