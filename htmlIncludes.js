// Really wishing there was something built into HTML itself that would do includes... iframes don't count

function includeFeedbackTab()
{
	document.getElementById('feedbackTab').innerHTML = '<a href=\"http://haystac.uservoice.com\"><div class=\"icon\">[?]</div>Feedback</a>';
}

function includeNavigation()
{
	var arrLinks = new Array();
	var linkPrefix = '<a href=\"';
	//var linkSuffix = '">';
	var parentDirPrefix = '../';
	arrLinks['index'] = 'index.htm';
	arrLinks['about'] = 'about.htm';
	arrLinks['developers'] = 'developers.htm';
	arrLinks['support'] = 'support.htm';
	arrLinks['press'] = 'press.htm';
	arrLinks['contact'] = 'contact.htm';
	arrLinks['search'] = 'alpha/search.htm';

	// ghettooooooo
	if (window.location.pathname.indexOf('alpha/') != -1)
	{
		arrLinks['index'] = [parentDirPrefix,'../index.htm'].join('');
		arrLinks['about'] = [parentDirPrefix,'about.htm'].join('');
		arrLinks['developers'] = [parentDirPrefix,'developers.htm'].join('');
		arrLinks['support'] = [parentDirPrefix,'support.htm'].join('');
		arrLinks['press'] = [parentDirPrefix,'press.htm'].join('');
		arrLinks['contact'] = [parentDirPrefix,'contact.htm'].join('');
		arrLinks['search'] = 'search.htm';
	}
	
	// Concatenating string in JS is slower than turtles...
	var arrNav = [linkPrefix, arrLinks['index'], '\"><img src=\"logo_small.png\" alt=\"Home\" /></a><br /><br />'
		, '<div class=\"contentNavigation\">'
		, linkPrefix, arrLinks['about'], '\">&nbsp; about &nbsp;</a><br /><br />'
		, '<a href=\"http://hayproj.tumblr.com/\" target=\"_new\">&nbsp; blog &nbsp;</a><br /><br />'
		, linkPrefix, arrLinks['developers'], '\">&nbsp; developers &nbsp;</a><br /><br />'
		, linkPrefix, arrLinks['support'], '\">&nbsp; support &nbsp;</a><br /><br />'
		, linkPrefix, arrLinks['press'], '\">&nbsp; press &nbsp;</a><br /><br />'
		, linkPrefix, arrLinks['contact'], '\">&nbsp; contact &nbsp;</a><br /><br />'
		, linkPrefix, arrLinks['search'], '\">&nbsp; web search &nbsp;</a><br /><br />'
		, '</div>'
		, '<div>'
		, '<a href=\"https://twitter.com/hayproj\"><img src=\"twitter.png\" class=\"socialMediaIcon\" /></a>'
		, '<a href=\"https://www.facebook.com/haystac\"><img src=\"facebook.png\" class=\"socialMediaIcon\" /></a>'
		, '<a href=\"http://haystac.tumblr.com\"><img src=\"tumblr.png\" class=\"socialMediaIcon\" /></a>'
		, '</div>'];
	
	document.getElementById('navigationLeftCol').innerHTML = arrNav.join('');
}