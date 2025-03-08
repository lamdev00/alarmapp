class DictationHandler {
    constructor() {
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        
        this.events = [];
        this.currentEvent = {};
        this.state = 'idle';
        this.questionStates = {
            PLAN: 'What do you have planned tomorrow?',
            TIME: 'What time is this event?',
            DETAILS: 'Any details you want to add to the event?',
            MORE_EVENTS: 'Any other events?',
            ALARM: 'What time do you want to wake up?'
        };
    }

    startDictation() {
        this.state = 'PLAN';
        this.askQuestion(this.questionStates.PLAN);
    }

    askQuestion(question) {
        return new Promise((resolve) => {
            const msg = new SpeechSynthesisUtterance(question);
            msg.onend = () => {
                this.startListening(resolve);
            };
            window.speechSynthesis.speak(msg);
        });
    }

    startListening(callback) {
        this.recognition.onresult = (event) => {
            const answer = event.results[0][0].transcript.toLowerCase();
            this.processAnswer(answer, callback);
        };

        this.recognition.onend = () => {
            callback();
        };

        this.recognition.start();
    }

    async processAnswer(answer, callback) {
        switch (this.state) {
            case 'PLAN':
                this.currentEvent = { title: answer };
                this.state = 'TIME';
                await this.askQuestion(this.questionStates.TIME);
                break;

            case 'TIME':
                // Convert spoken time to 24-hour format
                const timeMatch = answer.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
                if (timeMatch) {
                    let [_, hours, minutes = '00', period] = timeMatch;
                    hours = parseInt(hours);
                    if (period && period.toLowerCase() === 'pm' && hours !== 12) hours += 12;
                    if (period && period.toLowerCase() === 'am' && hours === 12) hours = 0;
                    this.currentEvent.time = `${hours.toString().padStart(2, '0')}:${minutes}`;
                }
                this.state = 'DETAILS';
                await this.askQuestion(this.questionStates.DETAILS);
                break;

            case 'DETAILS':
                this.currentEvent.details = answer;
                this.events.push({...this.currentEvent});
                this.state = 'MORE_EVENTS';
                await this.askQuestion(this.questionStates.MORE_EVENTS);
                break;

            case 'MORE_EVENTS':
                if (answer.includes('yes')) {
                    this.currentEvent = {};
                    this.state = 'PLAN';
                    await this.askQuestion(this.questionStates.PLAN);
                } else {
                    this.state = 'ALARM';
                    await this.askQuestion(this.questionStates.ALARM);
                }
                break;

            case 'ALARM':
                // Convert spoken time to alarm time
                const alarmMatch = answer.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
                if (alarmMatch) {
                    let [_, hours, minutes = '00', period] = alarmMatch;
                    hours = parseInt(hours);
                    if (period && period.toLowerCase() === 'pm' && hours !== 12) hours += 12;
                    if (period && period.toLowerCase() === 'am' && hours === 12) hours = 0;
                    const alarmTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
                    
                    // Add events to calendar using AppData
                    this.events.forEach(event => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        
                        AppData.addEvent(event, {
                            year: tomorrow.getFullYear(),
                            month: tomorrow.getMonth(),
                            day: tomorrow.getDate(),
                            hours: parseInt(event.time.split(':')[0]),
                            minutes: parseInt(event.time.split(':')[1])
                        });
                    });
                    
                    // Set alarm using AppData
                    const alarm = {
                        time: alarmTime,
                        id: Date.now(),
                        active: true,
                        stage1Triggered: false,
                        stage2Triggered: false,
                        stage3Triggered: false
                    };
                    
                    AppData.alarms.list.push(alarm);
                    AppData.saveData();
                    
                    // Force UI updates
                    if (window.updateAlarmsList) {
                        window.updateAlarmsList();
                    }
                    if (window.generateCalendar) {
                        window.generateCalendar(AppData.calendar.currentMonth, AppData.calendar.currentYear);
                    }
                    
                    // Confirmation message
                    const msg = new SpeechSynthesisUtterance(
                        `I've added your events to tomorrow's calendar and set your wake-up alarm for ${this.formatTimeForSpeech(alarmTime)}.`
                    );
                    window.speechSynthesis.speak(msg);
                }
                this.state = 'idle';
                break;
        }
    }

    // Helper method to format time for speech
    formatTimeForSpeech(time) {
        const [hours, minutes] = time.split(':').map(Number);
        let period = 'AM';
        let displayHours = hours;
        
        if (hours >= 12) {
            period = 'PM';
            displayHours = hours === 12 ? 12 : hours - 12;
        }
        if (hours === 0) {
            displayHours = 12;
        }
        
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
}

// Create global instance
window.dictationHandler = new DictationHandler(); 