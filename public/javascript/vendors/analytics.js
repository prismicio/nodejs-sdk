var prismic = prismic || {};
prismic.nodeutils = {
  // https://developer.mozilla.org/en-US/docs/DOM/document.cookie
  cookies: {
    getItem: function(sKey) {
      return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*\"?([^;]*)\"?.*$)|^.*$"), "$1")) || null;
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
      if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
      var sExpires = "";
      if (vEnd) {
        switch (vEnd.constructor) {
          case Number:
          sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
          break;
          case String:
          sExpires = "; expires=" + vEnd;
          break;
          case Date:
          sExpires = "; expires=" + vEnd.toUTCString();
          break;
        }
      }
      document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
      return true;
    }
  }
}

function sendAnalyticsEvent(category, type, label) {
  ga('send', 'event', category, type, label,
  {
    'hitCallback': function() {
      prismic.nodeutils.cookies.setItem(category + "_" + label, true);
    }
  });
}

function runEvent (category) {
  var label = "run";
  var type = "run";
  if(!prismic.nodeutils.cookies.getItem(category + '_' + label)) {
    sendAnalyticsEvent(category, type, label);
  }
}

function doneEvent (category) {
  $('img').map(function(index, node) {
    var isPrismic = new RegExp("^https:\/\/prismic-io.s3.amazonaws.com\/.*$").test($(node).attr('src'));
    if(isPrismic) {
      var label = "done";
      var type = "done";
      if(!prismic.nodeutils.cookies.getItem(category + '_' + label)) {
        sendAnalyticsEvent(category, type, label);
      }
    }
  });
}

prismic.analytics = function() {
  if(prismic.endpoint) {
    var matches = prismic.endpoint.match(new RegExp("(https?://(.*?)/)")) || [];
    var baseURL = matches[1].replace(/\.cdn\.prismic\.io/, ".prismic.io");
    $.ajax({
      url: baseURL + 'app/authenticated',
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true
    })
    .then(function(data) {
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
      ga('create', 'UA-43699356-1', {'cookieDomain': 'none'});
      ga('set', '&uid', data.userId);
      ga('set', 'dimension1', data.userId);
      ga('send', 'pageview');

      var category = "tutorial-quickstart";
      runEvent(category);
      doneEvent(category);
    });
  }
}

$(document).ready(function() {
  prismic.analytics();
});
