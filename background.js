chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('search.htm', {
    'bounds': {
      'width': 400,
      'height': 500
    }
  });
});