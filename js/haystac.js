"use strict";

var haystac = {
  currentSearchTerms: [],
  currentClickThroughRealURLs: [],
  // Random number in range (inclusive)
  randomNumberBetween: function (minNumber, maxNumber) {
    var buf = new Uint8Array(1);
    window.crypto.getRandomValues(buf);
    
    var byteOrdinal = (buf[0] / 256);
    var wildcard = byteOrdinal * (maxNumber - minNumber);
    var ranNum = Math.round(minNumber + wildcard);
    
    return ranNum;
  },
  // randomized sorting method for array.sort()
  shuffle: function () { // Formerly "randomness"
    var ranNum = parseInt(randomNumberBetween(1,9));
    var oddOrEven = ranNum % 2;
    var posOrNeg = ranNum > 5 ? 1 : -1;
    
    // Return -1, 0, or +1
    return( oddOrEven * posOrNeg );
  },
  randomDate: function (minDate, maxDate) {
    // Start with today's date
    var ranDate = new Date();
    var minMonth = minDate.getMonth();
    var minDay = minDate.getDate();
    var minYear = minDate.getFullYear();
    var maxMonth = maxDate.getMonth();
    var maxDay = maxDate.getDate();
    var maxYear = maxDate.getFullYear();
    
    var ranYear = this.randomNumberBetween();
    var ranMonth;
    var ranDay;

    if (ranYear === minYear) {
      ranMonth = randomNumberBetween(minMonth, 11);
    }
    else if (ranYear === maxYear) {
      ranMonth = randomNumberBetween(0, maxMonth);
    }
    else {
      ranMonth = randomNumberBetween(0, 11);
    }

    // Figure out number of days in selected month
    var ranMonthDayCount = 32 - new Date(ranYear, ranMonth, 32).getDate();

    if (ranYear === minYear && ranMonth === minMonth) {
      ranDay = randomNumberBetween(minDay, ranMonthDayCount);
    }
    else if (ranYear === maxYear && ranMonth === maxMonth) {
      ranDay = randomNumberBetween(1, maxDay);
    }
    else {
      ranDay = randomNumberBetween(1, ranMonthDayCount);
    }

    ranDate.setFullYear(ranYear);
    ranDate.setMonth(ranMonth);
    ranDate.setDate(ranDay);
    
    return ranDate;
  },
  normalizeSearchTerm: function (searchTerm) { // formerly "sanitizeSearchPhrase"
    var searchTermWords = searchTerm.split(' ');
    var normalizedSearchTerm = '';

    for (var x=0; x < searchTermWords.length; x++) {
      if (x === (searchTermWords.length -1)) {
        normalizedSearchTerm += searchTermWords[x].toLowerCase();
      }
      else {
        normalizedTermPhrase += searchTermWords[x].toLowerCase() + '+';
      }
    }

    return normalizedTermPhrase;
  },
  displaySearchBurst: function (terms) {
    document.getElementById('pnlTerms').innerHTML = '';
    var termList = document.createElement('ol');

    for (var x=0; x < terms.length; x++) { 
      var termItem = document.createElement('li');

      if (terms[x] === userTerm) {
        termItem.className = 'hoomanSearchTerm';
      }
      else {
        termItem.className = 'cylonSearchTerm';
      }

      termItem.innerHTML = terms[x];
      termList.appendChild(termItem);
    }

    document.getElementById('pnlTerms').appendChild(termList);
  },
  setTerms: function(termSauce) {
    // Reset previous terms and clickthroughs...
    this.currentSearchTerms = [];
    this.currentClickThroughURLs = [];

    if (termSauce) {
      // TODO: display overlay with cows and chickens moving hay around
      // brb generating terms
      var fakeTerms = ghtSearchTerms(termSauce.responseText, randomNumberBetwixt(5, 20));

      for (var z=0; z < fakeTerms.length; z++) {
        this.currentSearchTerms.push(fakeTerms[z]);
      }
    }

    if (currentSourceIndex < 2) {
      var ghtDate = randomDate(ghtMinDate, new Date());
      var ghtUrl = 'http://www.google.com/trends/hottrends?date=' + ghtDate.getFullYear() + '-' + ghtDate.getMonth() + '-' + ghtDate.getDate();

      GM_xmlhttpRequest({ // REPLACE WIF CHROOOOME
            method: 'GET'
            ,url: ghtUrl
            ,headers: {'User-Agent': navigator.userAgent}
            ,onload:setTerms // my heard hurts
      });

      currentSourceIndex++;
    }
    else {
      // cows and chikins back in the barn nao
      try {
        // This is a direct reference to webSearch in memory rather than in the DOM;
        this.setTimeout(this.webSearch, randomNumberBetween(60000, 300000)); // 1 minute to 5 minutes
      }
      catch(exception) {
        console.log('[automated] webSearch FAIL: ' + exception.message);
      }
    }
  },
  // ~*JUST GOOGLE THINGS*~ BELOW
  // This function does what rwt() does in Google's search results page
  gUrl: function (realUrl,oi,cad,ct,cd,usg,sig2,ved,ei) {
    var trackingUrl = ['http://www.google.com/url?sa=t','\x26source\x3dweb'
      ,oi?'&oi='+encodeURIComponent(oi) : ''
      ,cad?'&cad='+encodeURIComponent(cad) : ''
      ,'&ct=',encodeURIComponent(ct||'res')
      ,'&cd=',encodeURIComponent(cd)
      ,'&ved=',encodeURIComponent(ved)
      ,'&url=',encodeURIComponent(realUrl).replace(/\+/g,'%2B')
      ,'&ei=',ei
      ,usg?'&usg=' + usg : '', sig2].join('');

    return trackingUrl;
  },
  gResultLinks: function (resultsPageSource) {
    // TODO: adjust regex to look for clk (not logged in) results or if clk's parms are too diff, write a whole seperate thing for it...
    var arrResultLinkAttribs = resultsPageSource.match(/<[^>]*rn rwt[^>]*>/g);
    var arrRealLinks = new Array();
    // grab ei var from window.google defintion: ,ei:"desu"
    var eiValMatches = resultsPageSource.match(/ei:\"[^\"]*\"/g);
    var eiVal = eiValMatches[0].substring(4,eiValMatches[0].length-1);

    for (var x=0; x<arrResultLinkAttribs.length; x++) {
      var realUrl = arrResultLinkAttribs[x].match(/ref=\"[^\"]*\"/g)[0]; // this will failwhale is no match is found... 
      // remove leading ref=" and trailing "
      var realRealUrl = realUrl.substring(5,realUrl.length-1);

      arrRealLinks.push(realRealUrl);
    }
    // TODO: Also need an array for google.com href's that don't use rwt, like links to youtube clips, blogger, etc...
    // yo dawg, we heard you liek arrays...
    var arrLinkParms = new Array();

    for (var x=0; x<arrResultLinkAttribs.length; x++) {
      var firstParen = arrResultLinkAttribs[x].indexOf('(');
      var lastParen = arrResultLinkAttribs[x].lastIndexOf(')');
      var arrParms = arrResultLinkAttribs[x].substring(firstParen + 1, lastParen).split(',');
      arrLinkParms.push(arrParms);
    }

    var clickThruUrls = new Array();

    // go through the array of rwt parameter arrays and replace the 'this' parm with the real link and add ei
    for (var x=0; x<arrLinkParms.length; x++) {
      arrLinkParms[x][0]=arrRealLinks[x]; // this will epically failwhale if the two regexes aren't getting the same link infoz
      arrLinkParms[x].push(eiVal);
      // also remove leading and trailing single quotes in the parms extracted from the rwt call...
      var clickThruUrl = gUrl(arrLinkParms[x][0]
        ,arrLinkParms[x][1].substring(1,arrLinkParms[x][1].length-1)
        ,arrLinkParms[x][2].substring(1,arrLinkParms[x][2].length-1)
        ,arrLinkParms[x][3].substring(1,arrLinkParms[x][3].length-1)
        ,arrLinkParms[x][4].substring(1,arrLinkParms[x][4].length-1)
        ,arrLinkParms[x][5].substring(1,arrLinkParms[x][5].length-1)
        ,'&' + arrLinkParms[x][6].substring(6,arrLinkParms[x][6].length-1) // sig2 has an & that gets encoded when rendered on the page, so we're removing "'&amp;" ... and decodeURIComponent() is being teh dumbz
        ,arrLinkParms[x][7].substring(1,arrLinkParms[x][7].length-1)
        ,arrLinkParms[x][8]);

      clickThruUrls.push(clickThruUrl);
    }

    return clickThruUrls;
  },
  ghtSearchTerms: function(ghtSource, termTotal) {
    var arrRawTerms = ghtSource.match(/class=num>\d{1,3}\.{1}.*a/g);
    arrRawTerms.sort(shuffle);
    var arrProcessedTerms = new Array(termTotal);

    for (var x=0; x < termTotal; x++) {
      var keyWord;
      keyWord = arrRawTerms[x].substring(arrRawTerms[x].lastIndexOf('>') + 1, arrRawTerms[x].lastIndexOf('<'));
      arrProcessedTerms[x] = keyWord;
    }

    return arrProcessedTerms;
  }
};

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('search').addEventListener('click', function() { 
    try {
      haystac.webSearch(null);
    }
    catch(exception) {
      console.log('webSearch FAIL: ' + exception.message);
    }
  }, false);

  document.getElementById('search-term').addEventListener('keydown', function (ev) {
    // Search by pressing Enter key
    if (ev.keyCode === 13) {
      try {
        haystac.webSearch(null);
      }
      catch(exception) {
        console.log('webSearch FAIL: ' + exception.message);
      }
    }
  }, false);
});