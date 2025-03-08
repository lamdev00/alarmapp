// Set the initial countdown time (10 minutes)
let countdownTime = 600; // 10 minutes in seconds

// Function to update the countdown timer
function updateCountdown() {
    const minutes = Math.floor(countdownTime / 60);
    const seconds = countdownTime % 60;
    document.getElementById('countdown').textContent = `Next update in: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    countdownTime--;

    if (countdownTime < 0) {
        countdownTime = 600; // Reset countdown
        readWeather(); // Read the weather
    }
}

// Function to fetch and read the weather
function readWeather() {
    const apiKey = '9de076eaea6bcf189c10ffff80944544'; // Your OpenWeatherMap API key
    const lat = 33.680984; // Latitude of your city
    const lon = -117.170700; // Longitude of your city
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const now = new Date();
            const greeting = `Good ${now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'}.`;
            const date = now.toLocaleDateString();
            const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const temperature = Math.round(data.main.temp);
            const tempHigh = Math.round(data.main.temp_max);
            const tempLow = Math.round(data.main.temp_min);
            const condition = data.weather[0].description;
            const message = `${greeting} Today is ${date}, and the current time is ${time}. The current temperature is ${temperature} degrees. The high for today is ${tempHigh} degrees, the low is ${tempLow} degrees, and the weather condition is ${condition}.`;
            speak(message);
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

// Function to use the Web Speech API to read out the message
function speak(message) {
    const speech = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(speech);
}

// Test function to manually trigger speech synthesis
function testSpeak() {
    speak("This is a test message to check if speech synthesis is working.");
}

// Start the countdown timer
setInterval(updateCountdown, 1000);

// Function to schedule a readout at a specific time
function scheduleReadout() {
    const timeInput = document.getElementById('scheduleTime').value;
    if (!timeInput) {
        alert('Please select a time.');
        return;
    }

    const [hours, minutes] = timeInput.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (scheduledTime <= now) {
        alert('Scheduled time must be in the future.');
        return;
    }

    const timeUntilReadout = scheduledTime - now;
    setTimeout(() => {
        readWeather();
        alert('Scheduled weather readout completed.');
    }, timeUntilReadout);

    alert(`Weather readout scheduled for ${timeInput}.`);
} 