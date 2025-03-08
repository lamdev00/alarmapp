// Weather and readout functionality
function readWeather() {
    // Simulated weather data (you can replace with real API data)
    const currentTemp = Math.floor(Math.random() * (90 - 60) + 60); // Random temp between 60-90°F
    const highTemp = currentTemp + Math.floor(Math.random() * 10);
    const lowTemp = currentTemp - Math.floor(Math.random() * 10);
    const conditions = ['sunny', 'partly cloudy', 'cloudy', 'light rain', 'clear'][Math.floor(Math.random() * 5)];
    
    // Create speech synthesis
    const msg = new SpeechSynthesisUtterance();
    msg.text = `Good morning! The current temperature is ${currentTemp} degrees Fahrenheit. 
                Today's high will be ${highTemp} and the low will be ${lowTemp} degrees. 
                Current conditions are ${conditions}. Have a great day!`;
    msg.rate = 1; // Speech rate
    msg.pitch = 1; // Speech pitch
    
    // Speak the weather
    window.speechSynthesis.speak(msg);
}

// Countdown functionality
function startCountdown(duration, displayElement) {
    let timer = duration;
    
    return setInterval(() => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        
        displayElement.textContent = `Next update in: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        if (--timer < 0) {
            timer = duration;
            readWeather();
        }
    }, 1000);
} 