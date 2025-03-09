// Weather service configuration
const WeatherService = {
    API_KEY: '9de076eaea6bcf189c10ffff80944544',
    city: 'New York', // You can change this to your default city
    currentLat: null,
    currentLon: null,
    // Add this to persist the selected location
    selectedLocation: {
        city: 'New York',
        lat: null,
        lon: null
    },

    // Add this method to update selected location
    setSelectedLocation(city, lat, lon) {
        this.selectedLocation = { city, lat, lon };
        // Also update current location
        this.city = city;
        this.currentLat = lat;
        this.currentLon = lon;
        // Save to localStorage
        localStorage.setItem('selectedLocation', JSON.stringify(this.selectedLocation));
    },

    // Add this to initialize from localStorage
    initializeLocation() {
        const saved = localStorage.getItem('selectedLocation');
        if (saved) {
            const location = JSON.parse(saved);
            this.setSelectedLocation(location.city, location.lat, location.lon);
        }
    },

    // Fetch current weather
    async getCurrentWeather() {
        try {
            let url;
            if (this.selectedLocation.lat && this.selectedLocation.lon) {
                url = `https://api.openweathermap.org/data/2.5/weather?lat=${this.selectedLocation.lat}&lon=${this.selectedLocation.lon}&units=imperial&appid=${this.API_KEY}`;
            } else {
                url = `https://api.openweathermap.org/data/2.5/weather?q=${this.selectedLocation.city}&units=imperial&appid=${this.API_KEY}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            const weatherData = {
                currentTemp: Math.round(data.main.temp),
                highTemp: Math.round(data.main.temp_max),
                lowTemp: Math.round(data.main.temp_min),
                feelsLike: Math.round(data.main.feels_like),
                humidity: data.main.humidity,
                windSpeed: Math.round(data.wind.speed),
                conditions: data.weather[0].description,
                lastUpdate: Date.now(),
                location: this.selectedLocation.city
            };

            // Update AppData
            AppData.updateWeather(weatherData);
            return weatherData;
        } catch (error) {
            console.error('Error fetching current weather:', error);
            return null;
        }
    },

    // Fetch forecast
    async getForecast() {
        try {
            let url;
            if (this.currentLat && this.currentLon) {
                url = `https://api.openweathermap.org/data/2.5/forecast?lat=${this.currentLat}&lon=${this.currentLon}&units=imperial&appid=${this.API_KEY}`;
            } else {
                url = `https://api.openweathermap.org/data/2.5/forecast?q=${this.city}&units=imperial&appid=${this.API_KEY}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            // Process daily forecasts with high and low temps
            const dailyForecasts = {};
            data.list.forEach(item => {
                const date = new Date(item.dt * 1000);
                const day = date.toLocaleDateString('en-US', { weekday: 'long' });
                
                if (!dailyForecasts[day]) {
                    dailyForecasts[day] = {
                        temp_max: item.main.temp_max,
                        temp_min: item.main.temp_min,
                        condition: item.weather[0].description
                    };
                } else {
                    // Update high and low temperatures
                    dailyForecasts[day].temp_max = Math.max(dailyForecasts[day].temp_max, item.main.temp_max);
                    dailyForecasts[day].temp_min = Math.min(dailyForecasts[day].temp_min, item.main.temp_min);
                }
            });

            return dailyForecasts;
        } catch (error) {
            console.error('Error fetching forecast:', error);
            return null;
        }
    },

    // Set city
    setCity(newCity) {
        this.city = newCity;
        this.getCurrentWeather();
        this.getForecast();
    },

    // Geocoding method to convert city name to coordinates
    async getCityCoordinates(cityName) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${this.API_KEY}`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                return {
                    name: data[0].name,
                    state: data[0].state,
                    country: data[0].country,
                    lat: data[0].lat,
                    lon: data[0].lon
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting coordinates:', error);
            return null;
        }
    },

    // Update weather using coordinates
    async updateCityByCoordinates(lat, lon, cityName) {
        this.city = cityName;
        try {
            // Update current weather using coordinates
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${this.API_KEY}`
            );
            const data = await response.json();
            
            // Create and update weather data
            const weatherData = {
                currentTemp: Math.round(data.main.temp),
                highTemp: Math.round(data.main.temp_max),
                lowTemp: Math.round(data.main.temp_min),
                feelsLike: Math.round(data.main.feels_like),
                humidity: data.main.humidity,
                windSpeed: Math.round(data.wind.speed),
                conditions: data.weather[0].description,
                lastUpdate: Date.now()
            };

            // Update AppData
            AppData.updateWeather(weatherData);
            return weatherData;
        } catch (error) {
            console.error('Error updating city:', error);
            return null;
        }
    },

    // Add this method to WeatherService
    async searchCities(query) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${this.API_KEY}`
            );
            const data = await response.json();
            
            return data.map(city => ({
                name: city.name,
                state: city.state,
                country: city.country,
                lat: city.lat,
                lon: city.lon,
                displayName: city.state ? 
                    `${city.name}, ${city.state}, ${city.country}` : 
                    `${city.name}, ${city.country}`
            }));
        } catch (error) {
            console.error('Error searching cities:', error);
            return [];
        }
    }
};

// Initialize location when the service loads
WeatherService.initializeLocation(); 