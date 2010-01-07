// Scrapes some search terms from Google Hot Trends page for Great Justice
var ajaxGhtReq;

/*function setTermSourceFrames()
{
	var iFrameHtml = '';
	
	iFrameHtml += '<iframe id=ifrmTermSourceGthPresent class=\"resultFrame\">Your browser does not support iframes, because its SUCKS!</iframe>';
	
	iFrameHtml += '<iframe id=ifrmTermSourceGthRandom class=\"resultFrame\">Your browser does not support iframes, because its SUCKS!</iframe>';
	
	document.getElementById('pnlFrameContainer').innerHTML = iFrameHtml;
}*/

// Grab page via AJAX tomfoolery; pretend its XML if it makes you feel better
function getTermsFromGoogleHotTrends(trendDate, termCount)
{
	// Set term limit
	var arrGhtTerms = new Array(termCount);
	
    // Mozilla, Opera, and Webkit-based
    if (window.XMLHttpRequest) 
    {
        ajaxGhtReq = new XMLHttpRequest();
    }
    // M$
    else if (window.ActiveXObject) 
    {
        ajaxGhtReq = new ActiveXObject('Microsoft.XMLHTTP');
    }
    
    // e.g. http://www.google.com/trends/hottrends?date=2008-12-2
	ajaxGhtReq.open("GET", "scrapers/ghtScrape.php?date=" + trendDate.getFullYear().toString() + "-" + (trendDate.getMonth()+1).toString() + "-" + trendDate.getDate().toString(), false); // USE THIS ONE FOR WEB APP
    //ajaxGhtReq.open("GET", "http://www.google.com/trends/hottrends?date=" + trendDate.getFullYear().toString() + "-" + trendDate.getMonth().toString() + "-" + trendDate.getDate().toString(), true);
    
    // i can has search turms?
    ajaxGhtReq.send(null);
    
    if (ajaxGhtReq.status == 200)
	{
	 	var contPage = ajaxGhtReq.responseText.toString();
		
		arrGhtTerms = parseGhtPage(contPage, termCount);
	}
	else
	{
		alert('FAIL');	
	}
    
    return arrGhtTerms;
}

function parseGhtPage(pageContent, termTotal)
{
	var arrRawTerms = pageContent.match(/\d{1,3}\.{1}.*a/g);
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