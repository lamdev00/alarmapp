// Central data storage
const AppData = {
    // Calendar data
    calendar: {
        eventsData: {},
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        
        // Helper functions
        getEventKey: function(year, month, day, hour) {
            return `${year}-${month}-${day}-${hour}`;
        },
        
        hasEvents: function(year, month, day) {
            const datePrefix = `${year}-${month}-${day}`;
            return Object.keys(this.eventsData).some(key => key.startsWith(datePrefix));
        }
    },

    // Alarm data
    alarms: {
        list: [],
        sounds: {
            stage1: new Audio('./sounds/1.mp3'),
            stage2: new Audio('./sounds/2.mp3')
        }
    },

    // Weather data
    weather: {
        lastUpdate: null,
        currentTemp: null,
        highTemp: null,
        lowTemp: null,
        conditions: null
    },

    // Save all data to localStorage
    saveData: function() {
        const dataToSave = {
            calendar: {
                eventsData: this.calendar.eventsData,
                currentMonth: this.calendar.currentMonth,
                currentYear: this.calendar.currentYear
            },
            alarms: {
                list: this.alarms.list
            },
            weather: this.weather
        };
        localStorage.setItem('appData', JSON.stringify(dataToSave));
    },

    // Load data from localStorage
    loadData: function() {
        const savedData = localStorage.getItem('appData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.calendar.eventsData = data.calendar.eventsData || {};
            this.calendar.currentMonth = data.calendar.currentMonth || new Date().getMonth();
            this.calendar.currentYear = data.calendar.currentYear || new Date().getFullYear();
            this.alarms.list = data.alarms.list || [];
            this.weather = data.weather || {};
        }
    },

    // Initialize audio
    initializeAudio: function() {
        this.alarms.sounds.stage1.loop = true;
        this.alarms.sounds.stage2.loop = true;
    },

    // Add event to calendar
    addEvent: function(event, date) {
        const eventKey = this.calendar.getEventKey(
            date.year,
            date.month,
            date.day,
            date.hours
        );
        
        this.calendar.eventsData[eventKey] = {
            title: event.title,
            details: event.details || 'No details provided',
            time: `${date.hours}:${date.minutes.toString().padStart(2, '0')}`
        };
        
        this.saveData();
    },

    // Add alarm
    addAlarm: function(alarm) {
        alarm.id = Date.now();
        alarm.active = true;
        alarm.stage1Triggered = false;
        alarm.stage2Triggered = false;
        alarm.stage3Triggered = false;
        
        this.alarms.list.push(alarm);
        this.saveData();
        return alarm;
    },

    // Update weather
    updateWeather: function(weatherData) {
        this.weather = {
            ...weatherData,
            lastUpdate: new Date().getTime()
        };
        this.saveData();
    },

    // Initialize the app data
    init: function() {
        this.loadData();
        this.initializeAudio();
        
        // Set up auto-save
        window.addEventListener('beforeunload', () => {
            this.saveData();
        });
    }
};

// Initialize when the script loads
AppData.init();

// Make AppData available globally
window.AppData = AppData; 