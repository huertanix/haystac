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