// jshint -W117
// jshint -W119

//@prepros-prepend partials/_functions.js

var windowHeight = window.innerHeight;

var app = new Vue({
  el: '#app',
  data: {
    my: {
      view: 'news',
      contactChoice: false,
      unreadItems: 0,
    },
    news: [
      {
        title: 'Here is an urgent piece of news',
        body:  "Morbi posuere enim non ligula congue posuere. Morbi augue sem, interdum vitae ligula ac, cursus ultrices mi. Aenean ornare diam in erat gravida, ac interdum sapien varius. In sit amet volutpat arcu, in feugiat elit. Etiam dictum, risus sit amet cursus molestie, nibh elit tincidunt dui, in eleifend mauris odio nec magna. Nulla ultrices velit ac magna gravida imperdiet. In erat mauris, dapibus ac sem a, posuere consectetur neque. Integer finibus mi id sem tempor interdum. Sed vestibulum, turpis quis sagittis malesuada, odio libero pellentesque odio, sed interdum augue odio ac nisi.",
        expand: false,
        read: false
      },
      {
        title: 'Another piece of news',
        body:  "Sed ullamcorper dui condimentum, lacinia turpis quis, iaculis quam. Duis nec augue aliquet, vehicula ligula nec, faucibus leo.",
        expand: false,
        read: false
      }
    ],
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

  },
  methods: {
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

    /*
    beforeFromBottom: function (el) {
      el.style.translateY = windowHeight
    },
    fromBottom: function (el, done) {
      Velocity(el, { translateY: "1px", opacity:1 }, { duration: 900 })
    },
    toBottom: function (el, done) {
      Velocity(el, { translateY: windowHeight, opacity:0 }, { duration: 400 })
    }
    */
    openLink: function(destination, target){
      if(typeof(cordova.InAppBrowser) !== 'undefined'){
          window.open = cordova.InAppBrowser.open;
      }
      window.open(destination, target)
    },
    emailLink: function(emailTitle,emailBody){
      return "mailto:?subject=" + emailTitle + "&body=" + emailBody;
    },

    countUnreadNews: function(){
      var self = this;
      self.my.unreadItems = 0;
      self.news.forEach(function(element) {
        if (!element.read) {
          self.my.unreadItems++;
        }
      });
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
                "senderID": "XXXXXXXX"
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
            document.getElementById("regId").innerHTML = data.registrationId;
            var oldRegId = localStorage.getItem('registrationId');
            if (oldRegId !== data.registrationId) {
                // Save new registration ID
                localStorage.setItem('registrationId', data.registrationId);
                // Post registrationId to your app server as the value has changed
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
      fetch('http://localhost/cniga-content/')
      //fetch('https://circle.red/cniga/')
        .then(function(res){ return res.json()})
        .then(function(content){
          self.stateSupport = content.billssupporting
          self.stateOppose = content.billsopposing
          self.stateMonitor = content.billsmonitoring
          self.schedule = content.schedule
        })
    }
  },
  mounted: function () {
    var self = this;
    self.countUnreadNews();
    self.bindEvents();
    self.getContent();
  }
});
