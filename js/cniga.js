// jshint -W117
// jshint -W119

//@prepros-prepend partials/_functions.js

var windowHeight = window.innerHeight;

var app = new Vue({
  el: '#app',
  data: {
    my: {
      view: 'news',
      contactChoice: false
    },
    news: [
      {
        title: 'Here is an urgent piece of news',
        body:  "Morbi posuere enim non ligula congue posuere. Morbi augue sem, interdum vitae ligula ac, cursus ultrices mi. Aenean ornare diam in erat gravida, ac interdum sapien varius. In sit amet volutpat arcu, in feugiat elit. Etiam dictum, risus sit amet cursus molestie, nibh elit tincidunt dui, in eleifend mauris odio nec magna. Nulla ultrices velit ac magna gravida imperdiet. In erat mauris, dapibus ac sem a, posuere consectetur neque. Integer finibus mi id sem tempor interdum. Sed vestibulum, turpis quis sagittis malesuada, odio libero pellentesque odio, sed interdum augue odio ac nisi.",
        expand: false
      },
      {
        title: 'Another piece of news',
        body:  "Sed ullamcorper dui condimentum, lacinia turpis quis, iaculis quam. Duis nec augue aliquet, vehicula ligula nec, faucibus leo.",
        expand: false
      }
    ]
  },
  computed: {
    // Nothing yet
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
    
    
    beforeFromBottom: function (el) {
      el.style.translateY = windowHeight
    },
    fromBottom: function (el, done) {
      Velocity(el, { translateY: "1px", opacity:1 }, { duration: 900 })
    },
    toBottom: function (el, done) {
      Velocity(el, { translateY: windowHeight, opacity:0 }, { duration: 400 })
    }
  }
});