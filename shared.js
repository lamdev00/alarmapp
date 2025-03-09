// Weather and readout functionality
async function readWeather() {
    try {
        // Get current weather data from selected location
        const weatherData = await WeatherService.getCurrentWeather();
        
        // Get current date info
        const now = new Date();
        const today = now.getDate();
        const month = now.getMonth();
        const year = now.getFullYear();
        
        // Create the speech text with location
        let speechText = `Good morning! Today is ${monthNames[month]} ${today}, ${year}. `;
        
        if (weatherData) {
            speechText += `In ${weatherData.location}, the current temperature is ${weatherData.currentTemp} degrees Fahrenheit. 
                          Today's high will be ${weatherData.highTemp} and the low will be ${weatherData.lowTemp} degrees. 
                          Current conditions are ${weatherData.conditions}.`;
        } else {
            speechText += "I'm unable to fetch the weather information at this moment.";
        }

        // Get today's events from AppData
        const todayEvents = [];
        for (let hour = 0; hour < 24; hour++) {
            const eventKey = AppData.calendar.getEventKey(year, month, today, hour);
            if (AppData.calendar.eventsData[eventKey]) {
                todayEvents.push({
                    hour,
                    ...AppData.calendar.eventsData[eventKey]
                });
            }
        }

        // Add events to speech if there are any
        if (todayEvents.length > 0) {
            speechText += " Here are your events for today: ";
            todayEvents.forEach(event => {
                let displayHour = event.hour;
                const period = displayHour >= 12 ? 'PM' : 'AM';
                if (displayHour > 12) displayHour -= 12;
                if (displayHour === 0) displayHour = 12;
                
                speechText += `At ${displayHour} ${period}, ${event.title}. `;
                if (event.details && event.details !== 'No details provided') {
                    speechText += `Details: ${event.details}. `;
                }
            });
        } else {
            speechText += " You have no events scheduled for today.";
        }

        speechText += " Have a great day!";

        // Create speech synthesis
        const msg = new SpeechSynthesisUtterance(speechText);
        msg.rate = 1;
        msg.pitch = 1;
        
        // Speak the weather and events
        window.speechSynthesis.speak(msg);
    } catch (error) {
        console.error('Error in readWeather:', error);
        // Fallback speech if there's an error
        const msg = new SpeechSynthesisUtterance("I'm having trouble getting the weather information. Please check your connection and try again.");
        window.speechSynthesis.speak(msg);
    }
}

// Add monthNames if not already defined
const monthNames = ["January", "February", "March", "April", "May", "June", 
                   "July", "August", "September", "October", "November", "December"];

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