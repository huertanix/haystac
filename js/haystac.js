var haystac = {
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
  shuffle: function () {
    var ranNum = parseInt(randomNumberBetween(1,9));
    // Get 1 or 0, whether temp is odd or even
    var oddOrEven = ranNum % 2;
    // Get +1 or -1, depending on whether its > 5 or < 5
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