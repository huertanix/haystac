var relatedTerms = new Array();

// web search will use the html checkboxes and also some PHP trickery.
function webSearch(withUserTerm)
{
	var searchTerm = document.getElementById('txtSearchBox').value;
	var randomWordOrder = document.getElementById('chkReorderPhrase').checked;
	var includeTypos = document.getElementById('chkIncludeTypos').checked;
	var ghtMinDate = new Date();
	var ghtTerms1 = new Array();
	var ghtTerms2 = new Array();
	var terms;
	
	ghtMinDate.setFullYear(2007);
	ghtMinDate.setMonth(4);
	ghtMinDate.setDate(15);
	
	// Do a search burst, use the php scraper.
	// Right now only GHT
	ghtTerms1 = getTermsFromGoogleHotTrends(randomDate(ghtMinDate, new Date()), randomNumberBetwixt(5, 10));
	
	ghtTerms2 = getTermsFromGoogleHotTrends(randomDate(ghtMinDate, new Date()), randomNumberBetwixt(5, 10));// MIN DATE CHANGES. TODO: Find out how often Google changes it
	
	terms = ghtTerms1.concat(ghtTerms2);
	
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
		// under construction...
		// TODO: Write artifical misspelling function
	}
	
	if (withUserTerm == true)
	{
		terms.push(userTerm);
	}
	
	terms.sort(randomness);
	
	displaySearchBurst(terms);
	
	// reset fake result iframes
	var iFrameHtml = '';
	
	// Set up an array of iframes for fake searches -- this has to be done ahead of time since
	// adding new iframes dynamically refreshes the other iframes in the div and would run 
	// duplicate fake searches...

	for (var x=0; x<terms.length; x++) // Don't make an iframe for the user term...
	{
		iFrameHtml += '<iframe id=ifrmFakeResults' + x + ' class=\"resultFrame\">Your browser does not support iframes, because its SUCKS!</iframe>';
	}
	
	document.getElementById('pnlFrameContainer').innerHTML += iFrameHtml;
	
	for (var x=0; x<terms.length; x++)
	{
		if (terms[x] == userTerm)
		{
			googleSearch(terms[x], true, x);
		}
		else
		{
			googleSearch(terms[x], false, x);
		}	
	}
	
	setTimeout('webSearch(false);', randomNumberBetwixt(30000, 300000));
}

function googleSearch(searchTerm, isUserTerm, burstIndex)
{
	var gSearchPhrase = '';
	var gSearchUrl = 'http://www.google.com/search?q=';
	var gTerms = searchTerm.split(' ');
	
	for (var x=0; x<gTerms.length; x++)
	{
		if (x == (gTerms.length -1))
		{
			gSearchPhrase += gTerms[x].toLowerCase();
		}
		else
		{
			//gSearchPhrase += gTerms[x].toLowerCase() + '+'; // php FAIL
			gSearchPhrase += gTerms[x].toLowerCase() + '%2B';
		}
	}
	
	if (isUserTerm)
	{
		window.open(gSearchUrl + gSearchPhrase);
	}
	else
	{
		// also grab contents of the results page for clickthrough links and related term generation
		var ajaxGSearchReq;
		
		// Mozilla, Opera, and Webkit-based
	    if (window.XMLHttpRequest) 
	    {
	        ajaxGSearchReq = new XMLHttpRequest();
	    }
	    // M$
	    else if (window.ActiveXObject) 
	    {
	        ajaxGSearchReq = new ActiveXObject('Microsoft.XMLHTTP');
	    }
	    
	    ajaxGSearchReq.open('GET', 'scrapers/gSearchScrape.php?term=' + gSearchPhrase, false);
	    
	    ajaxGSearchReq.send(null);
    
	    if (ajaxGSearchReq.status == 200)
		{
		 	var contPage = ajaxGSearchReq.responseText.toString();
		 	
		 	var arrLinks = getResultLinks(contPage, 2); // TODO: Change to random number with a bias to being < 5ish
		 	
		 	document.getElementById('ifrmFakeResults' + burstIndex).src = gSearchUrl + gSearchPhrase;
		}
		else
		{
			alert('FAIL');	
		}
	}
}

function getResultLinks(resultsPage, linkTotal)
{
	var arrRawLinks = resultsPage.match(/<h3 class=r><a href=".*"/g); // This is failing quite miserably. :(
	
	arrRawLinks.sort(randomness);
	
	//alert('match: ' + arrRawLinks[0]); // DEBUG, FAIL
	
	var arrProcessedLinks = new Array(linkTotal);
	
	for (var x=0; x < linkTotal; x++)
	{
		var resultUrl;
		
		resultUrl = arrRawLinks[x].substring(arrRawLinks[x].indexOf('"'), arrRawLinks[x].lastIndexOf('"'));

		arrProcessedLinks[x] = resultUrl;
	}
	
	//alert('behold: ' +  arrProcessedLinks[0]); // DEBUG
	
	return arrProcessedLinks;
}