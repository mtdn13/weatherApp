
class App {
    static darkMode = false;
    static defaultCity = "Kyiv";
    static weatherIcons = {
        "01d": "./assets/img/day_clear_sky.png",
        "01n": "./assets/img/night_clear_sky.png",
        "02d": "./assets/img/day_few_clouds.png",
        "02n": "./assets/img/night_few_clouds.png",
        "03d": "./assets/img/day_clouds.png",
        "03n": "./assets/img/night_clouds.png",
        "04d": "./assets/img/day_clouds.png",
        "04n": "./assets/img/night_clouds.png",
        "09d": "./assets/img/shower_rain.png",
        "09n": "./assets/img/shower_rain.png",
        "10d": "./assets/img/day_rain.png",
        "10n": "./assets/img/night_rain.png",
        "11d": "./assets/img/day_thunder.png",
        "11n": "./assets/img/night_thunder.png",
        "13d": "./assets/img/day_snow.png",
        "13n": "./assets/img/night_snow.png",
        "50d": "./assets/img/mist.png",
        "50n": "./assets/img/mist.png",
    }
    init() {
        if (localStorage.getItem("lastCity")) {
            new Weather(localStorage.getItem("lastCity")).renderAll();
        } else {
            new Weather(App.defaultCity).renderAll();
        }
        if (localStorage.getItem("darkMode") === "true") {
            this.changeMode();
        }

        document.querySelector(".submit").addEventListener("click", () => {
            new Weather(document.querySelector(".searchBar").value).renderAll();
            localStorage.setItem("lastCity", document.querySelector(".searchBar").value);
            document.querySelector(".searchBar").value = "";
        })
        document.querySelector(".searchBar").addEventListener("keyup", (ev) => {
            if (ev.code === "Enter") {
                new Weather(document.querySelector(".searchBar").value).renderAll();
                localStorage.setItem("lastCity", document.querySelector(".searchBar").value);
                document.querySelector(".searchBar").value = "";
            }
        })
        document.querySelector(".mode").addEventListener("click", () => {
            App.darkMode = !App.darkMode;
            localStorage.setItem("darkMode", App.darkMode);

            this.changeMode();
        })
    }
    changeMode() {
        let widgets = [...document.querySelector(".main").children];
        let mode = document.querySelector(".mode-name");
        widgets.forEach(item => item.classList.toggle("dark-bg"));
        document.querySelector(".wrapper").classList.toggle("dark-theme");
        mode.classList.toggle("dark-mode");
        mode.innerText === "Light mode" ? mode.innerText = "Dark mode" : mode.innerText = "Light mode";
        document.querySelector(".ellipse").classList.toggle("dark-on");
        this.changeImgColor();
    }

    changeImgColor() {
        document.querySelector(".sunrise").classList.toggle("sunrise-white");
        document.querySelector(".sunset").classList.toggle("sunset-white");
        document.querySelector(".weather-humidity").classList.toggle("weather-humidity-white");
        document.querySelector(".weather-pressure").classList.toggle("weather-pressure-white");
        document.querySelector(".weather-wind").classList.toggle("weather-wind-white");
        document.querySelector(".weather-uv").classList.toggle("weather-uv-white");
    }



}
class Weather {

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
                            `${App.weatherIcons[dayTime[i].weather[0].icon]}`,
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
                            `${App.weatherIcons[json.list[i].weather[0].icon]}`,
                            `${Math.round(json.list[i].main.temp)}\xB0C`,
                            `${Math.round(json.list[i].wind.speed)} m/s`,
                        ))
                }
                return data;
            })
            .then(dataArr => {
                document.querySelector(".detailed-container").innerHTML = "";
                dataArr.forEach(item => {
                    if (parseInt(item.time) > 3 && parseInt(item.time) < 15) {
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
                    `${App.weatherIcons[json.weather[0].icon]}`,
                    `${json.weather[0].main}`,
                    `${json.weather[0].description}`,
                    `${json.main.humidity}%`,
                    `${Math.round(json.wind.speed)} m/s`,
                    `${json.main.pressure} hPa`,
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

    getImageUrl(name) {
        let img = {
            sunsetB: "../assets/img/sunset.png",
            sunriseB: "../assets/img/sunrise.png",
            humidityB: "../assets/img/humidity.png",
            windB: "../assets/img/wind.png",
            pressureB: "../assets/img/pressure.png",
            uvB: "../assets/img/uv.png",
            sunsetW: "../assets/img/sunset-white.png",
            sunriseW: "../assets/img/sunrise-white.png",
            humidityW: "../assets/img/humidity-white.png",
            windW: "../assets/img/wind-white.png",
            pressureW: "../assets/img/pressure-white.png",
            uvW: "../assets/img/uv-white.png",

        }
        return img[name];
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
                humidity, wind, pressure) {
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
        this.uv = Math.floor(Math.random() * 10);
    }
    render(anchor) {
        document.querySelector(".main-temp").textContent = this.temp;
        document.querySelector(".feel-temp-value").textContent = this.feelTemp;
        document.querySelector(".sunrise-value").textContent = this.sunrise;
        document.querySelector(".sunset-value").textContent = this.sunset;
        document.querySelector(".weather-image").src = this.iconUrl;
        document.querySelector(".weather-main-desc").textContent = this.weatherMain;
        document.querySelector(".weather-extra-desc").textContent = this.weatherDesc;
        document.querySelector(".humidity-value").textContent = this.humidity;
        document.querySelector(".wind-value").textContent = this.wind;
        document.querySelector(".pressure-value").textContent = this.pressure;
        document.querySelector(".uv-value").textContent = this.uv;
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
                <img src=${this.iconUrl} alt="weather-icon" class="detailed-img" width="80" height="80">
                <p class="detailed-temp">${this.temp}</p>
                <img src="./assets/img/wind2.png" alt="wind-icon" class="wind-img" width="50" height="50">
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
            <img src=${this.iconUrl} alt="weather-icon" class="forecast-img" width="65" height="65">
            <p class="forecast-temp">${this.temp}</p>
            <p class="forecast-date">${this.formattedDate}</p>
        `
        anchor.append(div);
    }
}


let app = new App();
app.init();








