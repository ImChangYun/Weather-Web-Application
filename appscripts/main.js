const MY_API_KEY = '';


// Country Data
let ipData = {};
let currentCountryData = {};
let currentForecastData = {};
let currentHistoryData = {};

// ID References
const countryNameDisplayed = document.getElementById('countryName');
const countryDateDisplayed = document.getElementById('countryDate');
const countryTimeDisplayed = document.getElementById('countryTime');
const weatherConditionImage = document.getElementById('weatherConditionImage');
const weatherConditionText = document.getElementById('weatherConditionText');
const temperatureStat = document.getElementById('temperatureStat');
const humidityStat = document.getElementById('humidityStat');
const gustStat = document.getElementById('gustStat');
const windStat = document.getElementById('windStat');
const searchBar = document.getElementById('countrySearchBar');
const searchButton = document.getElementById('countrySearchButton');


// -------------------------------------------------------------
//                  API Initializing Functions
// -------------------------------------------------------------

// Weather API - API Key
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': MY_API_KEY,
		'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
	}
};

// IP Lookup API (Weather API)
async function ipLookupAPIResponse() {
    const ipLookupUrl = 'https://weatherapi-com.p.rapidapi.com/ip.json?q=auto%3Aip';
    try {
        const response = await fetch(ipLookupUrl, options);
        ipData = await response.json();        
        console.log(ipData);
    } catch (error) {
        console.error(error);
    }
}


// Realtime Weather API (Weather API)
async function realtimeWeatherAPIResponse(country) {
    const realtimeWeatherUrl = `https://weatherapi-com.p.rapidapi.com/current.json?q=${country}`;
    console.log(realtimeWeatherUrl);
    try {
        const response = await fetch(realtimeWeatherUrl, options);
        currentCountryData = await response.json();
        console.log(currentCountryData);
        console.log(currentCountryData.location.country);
    } catch (error) {
        console.error(error);
    }
}


// Forecast Weather API (Weather API)
async function forecastWeatherAPIResponse(country) {
    const url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${country}&days=3`;
    console.log(url);
    try {
        const response = await fetch(url, options);
        currentForecastData = await response.json();
        console.log(currentForecastData);
    } catch (error) {
        console.error(error);
    }
}

// History Weather API (Weather API)
async function historyWeatherAPIResponse(country, startDate, endDate) {
    const url = `https://weatherapi-com.p.rapidapi.com/history.json?q=${country}&dt=${startDate}&lang=en&end_dt=${endDate}`;
    console.log(url);
    try {
        const response = await fetch(url, options);
        currentHistoryData = await response.json();
        console.log(currentHistoryData);
    } catch (error) {
        console.error(error);
    }
}


// -------------------------------------------------------------
//                   Functions to use within API
// -------------------------------------------------------------

// Updates the weather data upon application load using the client information
const startupProcess = async function() {
    console.log(`startupProcess: started`)
    try {
        await ipLookupAPIResponse(); // // Updates ipData
        // Initial Load - Country Details
        countryDetailLoad(ipData, 'initial');

        await realtimeWeatherAPIResponse(countryNameDisplayed.innerHTML); // Updates currentCountryData
        weatherDataUpdate(currentCountryData);

        await forecastWeatherAPIResponse(countryNameDisplayed.innerHTML); // Updates currentForecastData
        forecastUpdater();

        await historyWeatherAPIResponse(countryNameDisplayed.innerHTML, countryRewindDate(), countryCurrentDate()); // Updates currentHistoryData
        historyUpdater();
    } catch (error) {
        console.error(error);
        console.log(`startupProcess: Error has occured`)
    }
}

// Updates the weather data using country searched by user
const appDataUpdater = async function(userInput) {
    console.log(`appDataUpdater: started`)
    try{
        await realtimeWeatherAPIResponse(userInput); // Updates currentCountryData
        countryDetailLoad(currentCountryData.location, 'user', userInput);
        weatherDataUpdate(currentCountryData);

        await forecastWeatherAPIResponse(userInput); // Updates currentForecastData
        forecastUpdater();

        await historyWeatherAPIResponse(userInput, countryRewindDate(), countryCurrentDate()); // Updates currentHistoryData
        historyUpdater();
    } catch (error) {
        console.error(error);
        console.log(`appDataUpdate: Error has occured`);
        throw error;
    }
}

// Updates the country details on page
const countryDetailLoad = function(locationDetail, state, userInput) {
    if (state === 'initial') { // loads using ipData object
        let clientCity = locationDetail.city;
        let clientCountry = locationDetail.country_name;
        // let clientLocalTime = locationDetail.localtime;
        let dateInfo = dateProcessor(locationDetail.localtime_epoch, locationDetail.tz_id);
        

        // Updating innerHTML for Country Name, Date, Time
        if (clientCity === clientCountry) {countryNameDisplayed.innerHTML = clientCountry} // Determines default load country using client country
            else {countryNameDisplayed.innerHTML = clientCity}; 
        countryDateDisplayed.innerHTML = `${dateInfo["dayOfWeek"]}, ${dateInfo["date"]} ${dateInfo["month"]}`;
        countryTimeDisplayed.innerHTML = `${dateInfo["hours"]}:${dateInfo["minutes"]} ${dateInfo["ampm"]}`;
    }
        else if (state === 'user') { // loads using currentCountryData object
            let inputCity = locationDetail.name;
            let inputCountry = locationDetail.country;
            // let inputLocalTime = locationDetail.localtime;
            let dateInfo = dateProcessor(locationDetail.localtime_epoch, locationDetail.tz_id);
            console.log(`new line countrydetail load`)
            console.log(locationDetail);
            console.log(dateInfo);
            // Updating innerHTML for Country Name, Date, Time
            if (inputCity != inputCountry) {
                if (userInput.toLowerCase() === inputCity.toLowerCase()) {countryNameDisplayed.innerHTML = inputCity}
                    else {countryNameDisplayed.innerHTML = inputCountry};
            } else {countryNameDisplayed.innerHTML = inputCountry};
            countryDateDisplayed.innerHTML = `${dateInfo["dayOfWeek"]}, ${dateInfo["date"]} ${dateInfo["month"]}`;
            countryTimeDisplayed.innerHTML = `${dateInfo["hours"]}:${dateInfo["minutes"]} ${dateInfo["ampm"]}`;
    
        }


}

// Formats timezone specific date using epoch data inputted
const dateProcessor = function(inputEpoch, inputTimeZone) {
    console.log(`dateProcessor has started`)
    let epochTime = inputEpoch;
    console.log(epochTime);

    // Create a new Date object using the epoch time value
    let dateOptions = {timeZone: inputTimeZone};
    let dateObject = new Date(epochTime * 1000);
    let formattedDate = dateObject.toLocaleString('en-US', dateOptions);
    dateObject = new Date(formattedDate);
    console.log(dateObject);

    // Get the day of the week, month and date from the date object
    let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let dayOfWeek = daysOfWeek[dateObject.getDay()];
    let month = dateObject.toLocaleString('default', {month: 'long'});
    let date = dateObject.getDate();

    // Get the hours and minutes from the date object
    let hours = dateObject.getHours();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    console.log(hours)
    hours = hours % 12;
    console.log(hours)
    hours = hours ? hours : 12; // Convert 0 to 12
    hours = hours.toString().padStart(2, '0');
    minutes = dateObject.getMinutes();
    minutes = minutes.toString().padStart(2, '0');

    // Return dictionary of essential date/time information
    let dateDictionary = {
        "dayOfWeek" : dayOfWeek,
        "month" : month,
        "date" : date,
        "hours" : hours,
        "minutes" : minutes,
        "ampm" : ampm
    }

    return dateDictionary;
}

// Updates the weather statistics of current country
const weatherDataUpdate = function(result) {
        let currentWeatherCondition = result.current.condition.text;
        let conditionImg = result.current.condition.icon;
        let currentTemperature = result.current.temp_c;
        let currentHumidity = result.current.humidity;
        let currentGust = result.current.gust_mph;
        let currentWind = result.current.wind_mph;

        // Updates all associated IDs
        weatherConditionImage.src = `https://${conditionImg.substring(2)}`; // BUG FIX: Adding https:// into the icon image website string
        weatherConditionText.innerHTML = currentWeatherCondition;
        temperatureStat.innerHTML = `${currentTemperature}\u2103`;
        humidityStat.innerHTML = `${currentHumidity}%`;
        gustStat.innerHTML = `${currentGust} mph`;
        windStat.innerHTML = `${currentWind} mph`;

        console.log(currentTemperature);
}

// Used as argument for History Weather API to set date range (End Date)
const countryCurrentDate = function() {
    let currentLocalTime = currentCountryData.location.localtime;
    let currentLocalDate = currentLocalTime.substring(0, 10);
    return currentLocalDate;
}

// Used as argument for History Weather API to set date range (Start Date)
const countryRewindDate = function() {
    let epochTime = currentCountryData.location.localtime_epoch;
    let daysToSubtract = 7;
    let date = new Date(epochTime * 1000);
    date.setDate(date.getDate() - daysToSubtract);

    let month = date.toLocaleString('default', {month: '2-digit'});
    let year = date.getFullYear();
    date = date.getDate();
    date = date.toString().padStart(2, '0');

    rewindedDate = `${year}-${month}-${date}`;
    console.log(rewindedDate); 

    return rewindedDate;
}

// Updates the Weather Forecast Section
const forecastUpdater = function() {
        for (let i = 1; i < 4; i++) {
            iconBuilder(currentForecastData, "forecastIcon", "forecastDay", "forecastTemp", i);
        }
    }

// Updates the Weather History Section
const historyUpdater = function() {
    for (let i = 1; i < 8; i++) {
        iconBuilder(currentHistoryData, "historyIcon", "historyDay", "historyTemp", i);
    }
}

// Helper Function: Makes the icons used in both Forecast and History sections
let iconBuilder = function(dataObj, id1, id2, id3, num) {
    iconID = document.getElementById(`${id1}${num}`);
    dayID = document.getElementById(`${id2}${num}`);
    tempID = document.getElementById(`${id3}${num}`);

    iconImg = dataObj.forecast.forecastday[num-1].day.condition.icon;
    date = dateProcessor(dataObj.forecast.forecastday[num-1].date_epoch, dataObj.location.tz_id);
    console.log(date);
    temp = dataObj.forecast.forecastday[num-1].day.avgtemp_c;

    // Updates using associated IDs
    iconID.src = `https://${iconImg.substring(2)}`; // BUG FIX: Adding https:// into the icon image website string
    dayID.innerHTML = date.dayOfWeek.substring(0,3);
    tempID.innerHTML = `${temp}\u2103`
}
        
// Initialize data retrieval and display upon app startup
startupProcess();

// -------------------------------------------------------------
//                   Search Bar Event Listeners
// -------------------------------------------------------------

// Events for Search Bar and Search Button
searchBar.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  });
  
  searchButton.addEventListener('click', () => {
    handleSearch();
  });

async function handleSearch() {
    try {
        console.log(`User started searching for country/city`)
        const searchText = searchBar.value;
        
        await appDataUpdater(searchText);

        searchBar.value = '';
        searchBar.blur();
        document.getElementById('searchErrorLine').innerHTML = '';
    } catch (error) {
        document.getElementById('searchErrorLine').innerHTML = `Error: Please check if you have entered a valid Country/City name.`;
    }
  }







