// Elements //
var currentCity = $("#current-city");
var currentTemperature = $("#current-temp");
var currentHumidity = $("#current-humidity");
var currentWindSpeed = $("#current-wind-speed");
var UVindex = $("#uv-index");
var weatherInfo = $("#weather-info");
var searchHistoryList = $('#search-history-list');
var searchCityInput = $("#search-city");
var searchCityButton = $("#search-city-button");
var clearHistoryButton = $("#clear-history");

// OpenWeather API Key //
var APIkey = "9a93c4c585899839fba10682b09452c3";

// Access to Data //
var cityData = [];

var currentDate = moment().format('L');
$("#current-date").text("(" + currentDate + ")");

startHistory();
showClear();

$(document).on("submit", function(){
    event.preventDefault();

    var searchVal = searchCityInput.val().trim();

    currentConditions(searchVal)
    locateHistory(searchVal);
    searchCityInput.val(""); 
});

searchCityButton.on("click", function(event){
    event.preventDefault();

    var searchVal = searchCityInput.val().trim();

    currentConditions(searchVal)
    locateHistory(searchVal);    
    searchCityInput.val(""); 
});

clearHistoryButton.on("click", function(){
    cityData = [];

    InfoArray();
    
    $(this).addClass("hide");
});


searchHistoryList.on("click","li.city-btn", function(event) {

    var value = $(this).data("value");
    currentConditions(value);
    locateHistory(value); 

});

function currentConditions(searchVal) {
    
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + searchVal + "&units=imperial&appid=" + APIkey;
    
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response){
        console.log(response);
        currentCity.text(response.name);
        currentCity.append("<small class='text-muted' id='current-date'>");
        $("#current-date").text("(" + currentDate + ")");
        currentCity.append("<img src='https://openweathermap.org/img/w/" + response.weather[0].icon + ".png' alt='" + response.weather[0].main + "' />" )
        currentTemperature.text(response.main.temp);
        currentTemperature.append("&deg;F");
        currentHumidity.text(response.main.humidity + "%");
        currentWindSpeed.text(response.wind.speed + "MPH");

        var lat = response.coord.lat;
        var lon = response.coord.lon;
        

        var UVurl = "https://api.openweathermap.org/data/2.5/uvi?&lat=" + lat + "&lon=" + lon + "&appid=" + APIkey;

        $.ajax({
            url: UVurl,
            method: "GET"
        }).then(function(response){
            UVindex.text(response.value);
        });

        var countryCode = response.sys.country;
        var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?&units=imperial&appid=" + APIkey + "&lat=" + lat +  "&lon=" + lon;
        
        $.ajax({
            url: forecastURL,
            method: "GET"
        }).then(function(response){
            console.log(response);
            $('#five-day-forecast').empty();
            for (var i = 1; i < response.list.length; i+=8) {

                var forecastDateString = moment(response.list[i].dt_txt).format("L");
                console.log(forecastDateString);

                var forecastCol = $("<div class='col-12 col-md-6 col-lg forecast-day mb-3'>");
                var forecastData = $("<div class='data'>");
                var forecastDataBody = $("<div class='data-body'>");
                var forecastDate = $("<h5 class='data-title'>");
                var forecastIcon = $("<img>");
                var forecastTemp = $("<p class='data-text mb-0'>");
                var forecastHumidity = $("<p class='data-text mb-0'>");


                $('#five-day-forecast').append(forecastCol);
                forecastCol.append(forecastData);
                forecastData.append(forecastDataBody);

                forecastDataBody.append(forecastDate);
                forecastDataBody.append(forecastIcon);
                forecastDataBody.append(forecastTemp);
                forecastDataBody.append(forecastHumidity);
                
                forecastIcon.attr("src", "https://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png");
                forecastIcon.attr("alt", response.list[i].weather[0].main)
                forecastDate.text(forecastDateString);
                forecastTemp.text(response.list[i].main.temp);
                forecastTemp.prepend("Temp: ");
                forecastTemp.append("&deg;F");
                forecastHumidity.text(response.list[i].main.humidity);
                forecastHumidity.prepend("Humidity: ");
                forecastHumidity.append("%");
            }
        });

    });

    

};

function locateHistory(searchVal) {
    if (searchVal) {
        if (cityData.indexOf(searchVal) === -1) {
            cityData.push(searchVal);

            InfoArray();
            clearHistoryButton.removeClass("hide");
            weatherInfo.removeClass("hide");
        } else {
            var removeIndex = cityData.indexOf(searchVal);
            cityData.splice(removeIndex, 1);
            cityData.push(searchVal);

            InfoArray();
            clearHistoryButton.removeClass("hide");
            weatherInfo.removeClass("hide");
        }
    }
}

function InfoArray() {
    searchHistoryList.empty();
    cityData.forEach(function(city){
        var searchHistoryItem = $('<li class="list-group-item city-btn">');
        searchHistoryItem.attr("data-value", city);
        searchHistoryItem.text(city);
        searchHistoryList.prepend(searchHistoryItem);
    });
    localStorage.setItem("cities", JSON.stringify(cityData));
}

function startHistory() {
    if (localStorage.getItem("cities")) {
        cityData = JSON.parse(localStorage.getItem("cities"));
        var lastIndex = cityData.length - 1;
        InfoArray();

        if (cityData.length !== 0) {
            currentConditions(cityData[lastIndex]);
            weatherInfo.removeClass("hide");
        }
    }
}

function showClear() {
    if (searchHistoryList.text() !== "") {
        clearHistoryButton.removeClass("hide");
    }
}