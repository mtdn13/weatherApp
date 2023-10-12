const DEFAULT_CITY = "Kyiv";
class App {
    constructor(city) {
        this.city = city.toLowerCase();
        this.url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=283d8e7b9d630c5a5a260b6336ab4426&units=metric`;
        this.forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=283d8e7b9d630c5a5a260b6336ab4426&units=metric`;
    }

    renderDailyForecast (url) {
        fetch(url)
            .then(response => response.json())
            .then(json => {
                let dayTime = json.list.filter(item => item.dt_txt.includes("12:00:00"));
                let nightTime = json.list.filter(item => item.dt_txt.includes("00:00:00"));
                let data = [];
                for (let i = 0; i < 5; i++) {
                    data.push(
                        new WeatherListItem(
                            `${Math.round((dayTime[i].main.temp + nightTime[i].main.temp) / 2)}\xB0C`,
                            `https://openweathermap.org/img/wn/${dayTime[i].weather[0].icon}@2x.png`,
                            new Date(nightTime[i].dt_txt),
                        )
                    )
                }
                return data;
            })
            .then(dataArr => {
                document.querySelector(".forecast-list").innerHTML = "";
                dataArr.forEach(item => {
                    item.render(document.querySelector(".forecast-list"))
                })
            });
    }
    renderHourlyForecast (url) {
        fetch(url)
            .then(response => response.json())
            .then(json => {
                let data = [];
                for (let i = 0; i < 7; i++) {
                    data.push(
                        new WeatherCard(
                            `${new Date(json.list[i].dt_txt).getUTCHours()}:00`,
                            `https://openweathermap.org/img/wn/${json.list[i].weather[0].icon}@2x.png`,
                            `${Math.round(json.list[i].main.temp)}\xB0C`,
                            `${Math.round(json.list[i].wind.speed)} m/s`,
                        ))
                }
                return data;
            })
            .then(dataArr => {
                document.querySelector(".detailed-container").innerHTML = "";
                dataArr.forEach(item => {
                    if (parseInt(item.time) > 3 && parseInt(item.time) < 21) {
                        item.class = "daytime-bg"
                    } else {
                        item.class = "nighttime-bg"
                    }
                    item.render(document.querySelector(".detailed-container"))
                })
            });
    }
    renderDetailedWeather (url) {
        fetch(url)
            .then(response => response.json())
            .then(json => {
                return new WeatherMainCard(
                    `${Math.round(json.main.temp)}\xB0C`,
                    `${Math.round(json.main.feels_like)}\xB0C`,
                    (new Date(json.sys.sunrise * 1000)),
                    (new Date(json.sys.sunset * 1000)),
                    `https://openweathermap.org/img/wn/${json.weather[0].icon}@2x.png`,
                    `${json.weather[0].main}`,
                    `${json.weather[0].description}`,
                    `${json.main.humidity}%`,
                    `${Math.round(json.wind.speed)} m/s`,
                    `${json.main.pressure} hPa`,
                    `${json.visibility} m`,
                )
            })
            .then(obj => {
                obj.render(document.querySelector(".weather-details"));
            });
    }
    renderTimeAndDate(name) {
        let city = new City(name);
        city.render()
    }

    renderAll() {
        this.renderTimeAndDate(this.city);
        this.renderDetailedWeather(this.url);
        this.renderDailyForecast(this.forecastUrl);
        this.renderHourlyForecast(this.forecastUrl);
    }

}
class Helper {
    constructor() {
    }

    getDayName(date) {
        let names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return names[date.getDay()];
    }
    getMonthName(date) {
        let names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return names[date.getMonth()];
    }
    getTime(date) {
        let hours = date.getHours() < 10 ? `0${date.getHours()}` : `${date.getHours()}`;
        let minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : `${date.getMinutes()}`;
        return `${hours}:${minutes}`;
    }


}
class City extends Helper {
    constructor(city) {
        super();
        this.city = city[0].toUpperCase() + city.slice(1);
        this.time = this.getTime(new Date());
        this.day = this.getDayName(new Date());
        this.date = `${new Date().getDate()}`;
        this.month = this.getMonthName(new Date());
    }
    render() {
        let div = document.querySelector(".info");
        div.innerHTML = `
            <h2 class="info-city">${this.city}</h2>
            <p class="info-time">${this.time}</p>
            <p class="info-date">${this.day}, ${this.date} ${this.month}</p>
        `
    }
}
class WeatherMainCard extends Helper {
    constructor(temp, feelTemp, sunriseTime, sunsetTime, iconUrl, weatherMain, weatherDesc,
                humidity, wind, pressure, visibility) {
        super();
        this.temp = temp;
        this.feelTemp = feelTemp;
        this.sunrise = this.getTime(sunriseTime)
        this.sunset = this.getTime(sunsetTime)
        this.iconUrl = iconUrl;
        this.weatherMain = weatherMain;
        this.weatherDesc = weatherDesc;
        this.humidity = humidity;
        this.wind = wind;
        this.pressure = pressure;
        this.visibility = visibility;
    }
    render(anchor) {
        let divMain = document.querySelector(".weather-details-main");
        divMain.innerHTML = `
            <div class="main-temp">${this.temp}</div>
            <div class="feel-temp">
                <span>Feels like:</span>
                <span class="feel-temp-value">${this.feelTemp}</span>
            </div>
            <div class="sunrise">
                <p class="sunrise-name">Sunrise</p>
                <p class="sunrise-value">${this.sunrise} AM</p>
            </div>
            <div class="sunset">
                <p class="sunset-name">Sunset</p>
                <p class="sunset-value">${this.sunset} AM</p>
            </div>
        `;
        let divSec = document.querySelector(".weather-details-secondary");
        divSec.innerHTML = `
            <img src=${this.iconUrl} class="weather-image" alt="weather-icon" width="250" height="250">
                <p class="weather-main-desc">${this.weatherMain}</p>
                <p class="weather-extra-desc">${this.weatherDesc}</p>
        `
        let divExtra = document.querySelector(".weather-details-extra");
        divExtra.innerHTML = `
            <div class="weather-humidity">
                <p class="humidity-value">${this.humidity}</p>
                <p class="extra-name">Humidity</p>
            </div>
                <div class="weather-wind">
                <p class="wind-value">${this.wind}</p>
                <p class="extra-name">Wind Speed</p>
            </div>
            <div class="weather-pressure">
                <p class="pressure-value">${this.pressure}</p>
                <p class="extra-name">Pressure</p>
            </div>
            <div class="weather-visibility">
                <p class="visibility-value">${this.visibility}</p>
                <p class="extra-name">Visibility</p>
            </div>
        `
        anchor.append(divMain);
        anchor.append(divSec);
        anchor.append(divExtra);
    }
}
class WeatherCard extends Helper {
    class;
    constructor(time, iconUrl, temp, wind) {
        super();
        this.time = time;
        this.iconUrl = iconUrl;
        this.temp = temp;
        this.wind = wind;

    }
    render(anchor) {
        let div = document.createElement("div");
        div.classList.add("detailed-card", `${this.class}`);
        div.innerHTML = `
            <h3 class="detailed-time">${this.time}</h3>
                <img src=${this.iconUrl} alt="weather-icon" class="detailed-img">
                <p class="detailed-temp">${this.temp}</p>
                <img src="./assets/img/nav.png" alt="wind-icon" class="wind-img">
                <p class="detailed-wind">${this.wind}</p>`
        anchor.append(div);
    }
}
class WeatherListItem extends Helper {
    constructor(temp, iconUrl, date) {
        super();
        this.temp = temp;
        this.iconUrl = iconUrl;
        this.date = date;
        this.formattedDate = `${this.getDayName(date)}, ${date.getDate()} ${this.getMonthName(date)}`;
    }

    render(anchor) {
        let div = document.createElement("div");
        div.classList.add("forecast-item");
        div.innerHTML = `
            <img src=${this.iconUrl} alt="weather-icon" class="forecast-img" width="80" height="80">
            <p class="forecast-temp">${this.temp}</p>
            <p class="forecast-date">${this.formattedDate}</p>
        `
        anchor.append(div);
    }
}



window.addEventListener("load", function () {
    new App(DEFAULT_CITY).renderAll();
});

document.querySelector(".submit").addEventListener("click", function () {
    new App(document.querySelector(".searchBar").value).renderAll();
    document.querySelector(".searchBar").value = "";
})

document.querySelector(".searchBar").addEventListener("keyup", function (ev) {
    if (ev.code === "Enter") {
        new App(document.querySelector(".searchBar").value).renderAll();
        document.querySelector(".searchBar").value = "";
    }
})



