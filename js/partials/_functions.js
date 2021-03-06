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
