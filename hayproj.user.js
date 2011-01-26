// ==UserScript==
// @name           Hayst.ac Search Obfuscator
// @namespace      http://www.hayst.ac
// @description    Creates fake searches and clickthroughs for search terms generated by the Hayst.ac web search tool 
// @version        0.1.5
// @author         David Huerta
// @license        AGPL
// @include        http://*.haystackproject.org/alpha/search.htm*
// @include        http://*.haystackproject.com/alpha/search.htm*
// @include        http://*hayst.ac/alpha/search.htm*
// @include        https://*hayst.ac/alpha/search.htm*
// @include        http://haystackproject.org/alpha/search.htm*
// @include        http://haystackproject.com/alpha/search.htm*
// @include        http://hayst.ac/alpha/search.htm*
// @include        https://hayst.ac/alpha/search.htm*
// ==/UserScript==

(function(){
	
	// These randomization functions were moved in from randomCore.js so it would no longer need the require
	// This will allow it work with Firefox 4 (in beta as of Jan. 2011) and GreaseMonkey 0.9.0.
	// This would have eventually have to have been done to make it work as a Chrome extention as well...
	
	// Get a random date between two dates
	function randomDate(minDate, maxDate)
	{
		// Start with today's date
		var ranDate = new Date();

		var minMonth = minDate.getMonth();
		var minDay = minDate.getDate();
		var minYear = minDate.getFullYear();

		var maxMonth = maxDate.getMonth();
		var maxDay = maxDate.getDate();
		var maxYear = maxDate.getFullYear();

		var ranYear = randomNumberBetwixt(minYear, maxYear);
		var ranMonth;
		var ranDay;

		if (ranYear == minYear)
		{
			ranMonth = randomNumberBetwixt(minMonth, 11);
		}
		else if (ranYear == maxYear)
		{
			ranMonth = randomNumberBetwixt(0, maxMonth);
		}
		else
		{
			ranMonth = randomNumberBetwixt(0, 11);
		}

		// Figure out number of days in selected month
		var ranMonthDayCount = 32 - new Date(ranYear, ranMonth, 32).getDate();

		if (ranYear == minYear 
			&& ranMonth == minMonth)
		{
			ranDay = randomNumberBetwixt(minDay, ranMonthDayCount);
		}
		else if (ranYear == maxYear
			&& ranMonth == maxMonth)
		{
			ranDay = randomNumberBetwixt(1, maxDay);
		}
		else
		{
			ranDay = randomNumberBetwixt(1, ranMonthDayCount);
		}

		// ...
		ranDate.setFullYear(ranYear);
		ranDate.setMonth(ranMonth);
		ranDate.setDate(ranDay);

		//alert(ranDate.toString());

		return ranDate;
	}

	// Random number in range (inclusive)
	function randomNumberBetwixt(minNumber, maxNumber) // maybe fail?
	{
		var wildcard = Math.random() * (maxNumber - minNumber);
		wildcard = Math.round(minNumber + wildcard);

		return wildcard;
	}

	// Get random ordinal
	function randomness()
	{
		return (Math.round(Math.random()) - 0.5);
	}
	
	// Disable no-userscript warning, because its obviously installed already.
	document.getElementById('failOverlay').style.visibility='hidden';
	
	// This has to be accessed all over, so here it is
	var userTerm ='';
	var currentUrlIndex = 0;
	var currentSourceIndex = 0;
	//var termSourceUrls = ['http://www.google.com/trends/hottrends?date=2010-06-03', 'http://www.google.com/trends/hottrends?date=2010-06-02']; // DEBUG
	
	var ghtMinDate = new Date();
	// Set the first date that GHT terms are available... this might change periodically...
	ghtMinDate.setFullYear(2007);
	ghtMinDate.setMonth(4);
	ghtMinDate.setDate(15);
	window.currentSearchTerms = [];
	window.currentClickThroughRealURLs = [];
	
	window.webSearch = function(resultsPage)
	{
		var searchTerm = document.getElementById('txtSearchBox').value;
		var randomWordOrder = document.getElementById('chkReorderPhrase').checked;
		var includeTypos = document.getElementById('chkIncludeTypos').checked;
		var searchEngine = document.getElementById('ddlSearchEngine').value;
		var withUserTerm;
		
		if (searchTerm)
		{
			withUserTerm = true;
		}
		else
		{
			withUserTerm = false;	
		}
		
		// Eventually add something to check for what kind of source (ght, werdpress) mining is needed
		var terms = window.currentSearchTerms; //ghtSearchTerms(resultsPage.responseText, randomNumberBetwixt(5, 20));
		
		if (randomWordOrder)
		{
			userTerm = '';	
			var userTermWords = searchTerm.split(' ');
			
			userTermWords.sort(randomness);
			
			for (var x=0; x<userTermWords.length; x++)
			{
				userTerm += userTermWords[x] + ' ';
			}
			
			for (var x=0; x<terms.length; x++)
			{
				var fakeTermWords = terms[x].split(' ');
				var fakeTerm = '';
				
				fakeTermWords.sort(randomness);
				
				for (var y=0; y<fakeTermWords.length; y++)
				{
					fakeTerm += fakeTermWords[y] + ' ';
				}
				
				terms[x] = fakeTerm;
			}
		}
		else
		{
			userTerm = searchTerm;	
		}
		
		if (includeTypos)
		{
			// TODO: Write artifical misspelling function
		}
		
		if (withUserTerm == true)
		{
			terms.push(userTerm);
		}
			
		terms.sort(randomness);
			
		displaySearchBurst(terms);
		
		switch(searchEngine)
		{
			case 'g': // google
				for (var x=0; x < terms.length; x++)
				{	
					(function(searchTerm, isUserTerm)
					{
						var gSearchPhrase = sanitizeSearchPhrase(searchTerm);
						var gSearchUrl = 'http://www.google.com/search?q=';
					
						if (isUserTerm)
						{
							// NOTE: No clickthrough obfuscation on user searches; Overlapping clickthroughs could indicate whether it was human generated; Plus the results page would have to be fetched twice, adding another red forensic flag
							window.open(gSearchUrl + gSearchPhrase);
						}
						else
						{
							GM_xmlhttpRequest({
					    		method: 'GET',
					    		url: gSearchUrl + gSearchPhrase,
					    		headers: {
					       	 		'User-agent': navigator.userAgent //e.g. 'Mozilla/4.0 (compatible) Greasemonkey',
					    		},
					    		onload: function(responseDetails) 
					    		{
					    			var clickThroughUrls = gResultLinks(responseDetails.responseText);
	
								clickThroughUrls.sort(randomness);
								// the more things the user can click on, the greater the chance the number of clickthroughs will be abnormally large...
								var tossedClickThruUrls;
								
								// Add a bias for < ~5
								if (randomness() > 0.3)
								{
									var pieSliceWidth = randomNumberBetwixt(3,6);
									var pieSlices = randomNumberBetwixt(0, Math.round(clickThroughUrls.length / pieSliceWidth));
									
									tossedClickThruUrls = new Array(pieSlices);
								}
								else
								{
									tossedClickThruUrls = new Array(randomNumberBetwixt(0, clickThroughUrls.length));	
								}
								
								for (var y=0; y < tossedClickThruUrls.length; y++)
								{
									tossedClickThruUrls[y] = clickThroughUrls[y];
								}
	
								for (var y=0; y<tossedClickThruUrls.length; y++)
								{	
									// extract real URL... again
									var realUrl = tossedClickThruUrls[y].match(/url=[^\&]*\&/g)[0]; // this will failwhale if no match is found...	
									// remove leading url= and trailing &
									var realRealUrl = realUrl.substring(4,realUrl.length-1);
									
									// Check for duplicates...
									if (window.currentClickThroughRealURLs.indexOf(realRealUrl) == -1)
									{
										window.currentClickThroughRealURLs.push(realRealUrl);
										
										(function(clickThroughUrl)
										{
											GM_xmlhttpRequest({
									    		method: 'GET',
									    		url: clickThroughUrl,
									    		headers: {
									       	 		'User-agent': navigator.userAgent
									    		},
									    		onload: function(responseDetails) 
									    		{
									    			// we're done here...
									    		}
											});
										})(tossedClickThruUrls[y]);
									}
								}	
					    		}
							});
						}
					})(terms[x], terms[x]==userTerm);
				}
			break;
			
			case 'yb': // yauba
				for (var x=0; x < terms.length; x++)
				{
					(function(searchTerm, isUserTerm)
					{
						var ybSearchPhrase = sanitizeSearchPhrase(searchTerm);
						var ybSearchUrl = 'http://www.yauba.com/?target=all&q=';
						
						if (isUserTerm)
						{
							window.open(ybSearchUrl + ybSearchPhrase);
						}
						else
						{
							GM_xmlhttpRequest({
					    		method: 'GET',
					    		url: ybSearchUrl + ybSearchPhrase,
					    		headers: {
					       	 		'User-agent': navigator.userAgent //e.g. 'Mozilla/4.0 (compatible) Greasemonkey',
					    		},
					    		onload: function(responseDetails) 
					    		{
					    			// No need for clickthrough obfuscation, 'cause yauba don't log clickthroughs!
					    		}
							});
						}
					})(terms[x], terms[x]==userTerm);
				}	
			
			break;
			
			case 'c': // cuil
				for (var x=0; x < terms.length; x++)
				{
					(function(searchTerm, isUserTerm)
					{
						var cSearchPhrase = sanitizeSearchPhrase(searchTerm);
						var cSearchUrl = 'http://www.cuil.com/search?q=';
						
						if (isUserTerm)
						{
							window.open(cSearchUrl + cSearchPhrase);
						}
						else
						{
							GM_xmlhttpRequest({
					    		method: 'GET',
					    		url: cSearchUrl + cSearchPhrase,
					    		headers: {
					       	 		'User-agent': navigator.userAgent //e.g. 'Mozilla/4.0 (compatible) Greasemonkey',
					    		},
					    		onload: function(responseDetails) 
					    		{
					    			// No need for clickthrough obfuscation, 'cause cuil don't log clickthroughs!
					    		}
							});
						}
					})(terms[x], terms[x]==userTerm);
				}
			break;
			
			case 'yh': // yahoo
				// clickthrough example for search for "otter pops" (stored in the puddle)
				// http://rds.yahoo.com/_ylt=A0oGdHEZHQJMDwoAv1xXNyoA;_ylu=X3oDMTEzbXAxN2V1BHNlYwNzcgRwb3MDMgRjb2xvA3NrMQR2dGlkA0Y3NTVfMTE1/SIG=11plvrrg5/EXP=1275293337/**http%3a//www.otterpopstars.com/mtb.html
				for (var x=0; x < terms.length; x++)
				{
					(function(searchTerm, isUserTerm)
					{
						var yhSearchPhrase = sanitizeSearchPhrase(searchTerm);
						var yhSearchUrl = 'http://search.yahoo.com/search?ei=UTF-8&p=';
						
						if (isUserTerm)
						{
							window.open(yhSearchUrl + yhSearchPhrase);
						}
						else
						{
							GM_xmlhttpRequest({
					    		method: 'GET',
					    		url: yhSearchUrl + yhSearchPhrase,
					    		headers: {
					       	 		'User-agent': navigator.userAgent //e.g. 'Mozilla/4.0 (compatible) Greasemonkey',
					    		},
					    		onload: function(responseDetails) 
					    		{
					    			// No need for clickthrough obfuscation, 'cause yahoo don't log clickthroughs (on their servers)!
					    		}
							});
						}
					})(terms[x], terms[x]==userTerm);
				}
			break;
			
			case 'b': // binge
				
			break;
			
			case 'a': // ask
				for (var x=0; x < terms.length; x++)
				{
					(function(searchTerm, isUserTerm)
					{
						var aSearchPhrase = sanitizeSearchPhrase(searchTerm);
						var aSearchUrl = 'http://www.ask.com/web?q=';
						
						if (isUserTerm)
						{
							window.open(aSearchUrl + aSearchPhrase);
						}
						else
						{
							GM_xmlhttpRequest({
					    		method: 'GET',
					    		url: aSearchUrl + aSearchPhrase,
					    		headers: {
					       	 		'User-agent': navigator.userAgent //e.g. 'Mozilla/4.0 (compatible) Greasemonkey',
					    		},
					    		onload: function(responseDetails) 
					    		{
					    			// No need for clickthrough obfuscation, 'cause ask don't log clickthroughs!
					    		}
							});
						}
					})(terms[x], terms[x]==userTerm);
				}
			break;
			
			case 'dg': // duck duck go
				for (var x=0; x < terms.length; x++)
				{
					(function(searchTerm, isUserTerm)
					{
						var dgSearchPhrase = sanitizeSearchPhrase(searchTerm);
						var dgSearchUrl = 'http://duckduckgo.com/?q=';
						
						if (isUserTerm)
						{
							window.open(dgSearchUrl + dgSearchPhrase);
						}
						else
						{
							GM_xmlhttpRequest({
					    		method: 'GET',
					    		url: dgSearchUrl + dgSearchPhrase,
					    		headers: {
					       	 		'User-agent': navigator.userAgent //e.g. 'Mozilla/4.0 (compatible) Greasemonkey',
					    		},
					    		onload: function(responseDetails) 
					    		{
					    			// No need for clickthrough obfuscation, 'cause yauba don't log clickthroughs!
					    		}
							});
						}
					})(terms[x], terms[x]==userTerm);
				}	
			break;
			
			case 'bk': // blekko
				for (var x=0; x < terms.length; x++)
				{
					(function(searchTerm, isUserTerm)
					{
						var bkSearchPhrase = sanitizeSearchPhrase(searchTerm);
						var bkSearchUrl = 'http://blekko.com/ws/';
						
						if (isUserTerm)
						{
							window.open(bkSearchUrl + bkSearchPhrase);
						}
						else
						{
							GM_xmlhttpRequest({
					    		method: 'GET',
					    		url: bkSearchUrl + bkSearchPhrase,
					    		headers: {
					       	 		'User-agent': navigator.userAgent //e.g. 'Mozilla/4.0 (compatible) Greasemonkey',
					    		},
					    		onload: function(responseDetails) 
					    		{
					    			// No need for clickthrough obfuscation, 'cause blekko don't log clickthroughs!
					    		}
							});
						}
					})(terms[x], terms[x]==userTerm);
				}	
			break;
		}
	
		// No moar URLs
		currentSourceIndex = 0; // Might want to put this inside setTerms... somehow...
		try
		{
			setTerms(null);
		}
		catch (exception)
		{
			GM_log('setTerms FAIL: ' + exception.message);
			window.location = 'http://www.haystackproject.org/fail.htm';
		}
		
		// clear out term so that its not searched again by the next artificial search burst
		document.getElementById('txtSearchBox').value = "";
		document.getElementById('txtSearchBox').focus();
	}
	
	function setTerms(termSauce)
	{
		// Reset previous terms and clickthroughs...
		window.currentSearchTerms = [];
		window.currentClickThroughURLs = [];
		
		if (termSauce)
		{
			// TODO: display overlay with cows and chickens moving hay around
			// brb generating terms
			var fakeTerms = ghtSearchTerms(termSauce.responseText, randomNumberBetwixt(5, 20));
				
			for (var z=0; z < fakeTerms.length; z++)
			{
				window.currentSearchTerms.push(fakeTerms[z]);
			}
		}
	
		if (currentSourceIndex < 2)
		{
			var ghtDate = randomDate(ghtMinDate, new Date());
			var ghtUrl = 'http://www.google.com/trends/hottrends?date=' + ghtDate.getFullYear() + '-' + ghtDate.getMonth() + '-' + ghtDate.getDate();
	
			GM_xmlhttpRequest({
	    			method: 'GET'
	    			,url: ghtUrl
	    			,headers: { 'User-Agent': navigator.userAgent }
	    			,onload:setTerms // my heard hurts
			});
	
			currentSourceIndex++;
		}
		else
		{
			// check for latest version
			try
			{
				checkHayProjVersion();
			}
			catch(exception)
			{
				GM_log('checkHayProjVersion FAIL: ' + exception.message);
				window.location = 'http://www.haystackproject.org/fail.htm';
			}
			
			// cows and chikins back in the barn nao
			document.getElementById('notificationOverlay').style.visibility='hidden';
			
			try
			{
				// This is a direct reference to webSearch in memory rather than in the DOM;
				window.setTimeout(window.webSearch, randomNumberBetwixt(60000, 300000)); // 1 minute to 5 minutes
			}
			catch(exception)
			{
				GM_log('[automated] webSearch FAIL: ' + exception.message);
				window.location = 'http://www.haystackproject.org/fail.htm';
			}
		}
	}
	
	if (document.getElementById('failOverlay').style.visibility == 'hidden')
	{
		try 
		{
			window.onload = setTerms(null);
		}
		catch (exception)
		{
			GM_log('setTerms FAIL: ' + exception.message);
			window.location = 'http://www.haystackproject.org/fail.htm';
		}
	}
	
	// set up an event listener so that the GS function can be accessed
	var btnSearch = document.getElementById('btnSearch');
	var txtSearch = document.getElementById('txtSearchBox');
	btnSearch.addEventListener('click', function(){ 
		try
		{
			webSearch(null);
		}
		catch(exception)
		{
			GM_log('webSearch FAIL: ' + exception.message);
			window.location = 'http://www.haystackproject.org/fail.htm';
		} 
	}, false);
	txtSearch.addEventListener('keydown', keyPressWebSearch, true);
	
	function keyPressWebSearch(ev)
	{
		if (ev.keyCode == 13) 
		{
			try
			{
				webSearch(null);	
			}
			catch(exception)
			{
				GM_log('webSearch FAIL: ' + exception.message);
				window.location = 'http://www.haystackproject.org/fail.htm';
			}
		}
	}
	
	function gResultLinks(resultsPageSource)
	{
		// TODO: adjust regex to look for clk (not logged in) results or if clk's parms are too diff, write a whole seperate thing for it...
		var arrResultLinkAttribs = resultsPageSource.match(/<[^>]*rn rwt[^>]*>/g);
	    
		var arrRealLinks = new Array();
		// grab ei var from window.google defintion: ,ei:"desu"
		var eiValMatches = resultsPageSource.match(/ei:\"[^\"]*\"/g);
	   	var eiVal = eiValMatches[0].substring(4,eiValMatches[0].length-1);
	    
		for (var x=0; x<arrResultLinkAttribs.length; x++)
		{
			var realUrl = arrResultLinkAttribs[x].match(/ref=\"[^\"]*\"/g)[0]; // this will failwhale is no match is found...	
			// remove leading ref=" and trailing "
			var realRealUrl = realUrl.substring(5,realUrl.length-1);
	    	
			arrRealLinks.push(realRealUrl);
		}
	    
	    	// TODO: Also need an array for google.com href's that don't use rwt, like links to youtube clips, blogger, etc...
	    
		// yo dawg, we heard you liek arrays...
		var arrLinkParms = new Array();
		    
		for (var x=0; x<arrResultLinkAttribs.length; x++)
		{
			var firstParen = arrResultLinkAttribs[x].indexOf('(');
			var lastParen = arrResultLinkAttribs[x].lastIndexOf(')');
	
		    	var arrParms = arrResultLinkAttribs[x].substring(firstParen + 1, lastParen).split(',');
		    	
		    	arrLinkParms.push(arrParms);
		    }
	
		    var clickThruUrls = new Array();
		    
		    // go through the array of rwt parameter arrays and replace the 'this' parm with the real link and add ei
		    for (var x=0; x<arrLinkParms.length; x++)
		    {
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
	}
	
	// This function does what rwt() does in Google's search results page
	function gUrl(realUrl,oi,cad,ct,cd,usg,sig2,ved,ei)
	{
		var obeseSisterUrl = ['http://www.google.com/url?sa=t','\x26source\x3dweb'
			,oi?'&oi='+encodeURIComponent(oi):''
			,cad?'&cad='+encodeURIComponent(cad):''
			,'&ct=',encodeURIComponent(ct||'res')
			,'&cd=',encodeURIComponent(cd)
			,'&ved=',encodeURIComponent(ved)
			,'&url=',encodeURIComponent(realUrl).replace(/\+/g,'%2B')
			,'&ei=',ei
			,usg?'&usg='+usg:'',sig2].join('');
			
		return obeseSisterUrl;
	}
	
	function displaySearchBurst(terms)
	{
		var htmlTerms = '<ol>';
		
		for (var x=0; x < terms.length; x++)
		{ 
			if (terms[x] == userTerm)
			{
				htmlTerms += '<li class=\'hoomanSearchTerm\'>';
			}
			else
			{
				htmlTerms += '<li class=\'cylonSearchTerm\'>';
			}
			
			htmlTerms += terms[x] + '</li>';
		}
		
		htmlTerms += '</ol>';
		
		document.getElementById('pnlTerms').innerHTML = htmlTerms;
	}
	
	function ghtSearchTerms(ghtSource, termTotal)
	{
		var arrRawTerms = ghtSource.match(/class=num>\d{1,3}\.{1}.*a/g);
	
		arrRawTerms.sort(randomness);
		var arrProcessedTerms = new Array(termTotal);
	
		for (var x=0; x < termTotal; x++)
		{
			var keyWord;
	
			keyWord = arrRawTerms[x].substring(arrRawTerms[x].lastIndexOf('>') + 1, arrRawTerms[x].lastIndexOf('<'));
	
			arrProcessedTerms[x] = keyWord;
		}
		
		return arrProcessedTerms;
	}
	
	function sanitizeSearchPhrase(searchPhrase)
	{
		var searchPhraseWords = searchPhrase.split(' ');
		var sanitizedSearchPhrase = '';
	
		for (var x=0; x < searchPhraseWords.length; x++)
		{
			if (x == (searchPhraseWords.length -1))
			{
				sanitizedSearchPhrase += searchPhraseWords[x].toLowerCase();
			}
			else
			{
				sanitizedSearchPhrase += searchPhraseWords[x].toLowerCase() + '+';
			}
		}
		
		return sanitizedSearchPhrase;
	}
	
	function checkHayProjVersion()
	{
		// Reset update notification visibility
		document.getElementById('updateNotification').style.display='none';
		
		if (document.getElementById('hdnCurrentVersion').value != null)
		{
			var arrLatestVersion = document.getElementById('hdnCurrentVersion').value.split('.');
			// The internet does not know how to access @version, it seems...
			var arrThisVersion = [0,1,5]; // This will have to updated on *every* release... </emo>
			
			if (parseInt(arrLatestVersion[0]) > arrThisVersion[0])
			{
				// Notify user to update the userscript...
				document.getElementById('updateNotification').style.display='block';
			}
			else if (parseInt(arrLatestVersion[0]) == arrThisVersion[0])
			{
				if (parseInt(arrLatestVersion[1]) > arrThisVersion[1])
				{
					document.getElementById('updateNotification').style.display='block';
				}
				else if (parseInt(arrLatestVersion[1]) == arrThisVersion[1])
				{
					if (parseInt(arrLatestVersion[2]) > arrThisVersion[2])
					{
						// Notify user to update the userscript...
						document.getElementById('updateNotification').style.display='block';
					}
				}
			}
		}
		else
		{
			// FAIL
			GM_log('checkHayProjVersion FAIL: I accidentally the version number');
			window.location = 'http://www.haystackproject.org/fail.htm';
		}
	}
	
})();