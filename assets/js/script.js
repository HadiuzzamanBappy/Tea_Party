const name_person = document.getElementById('name_person');
var userName = localStorage.getItem('userName');

const present_time = document.getElementById('present_time');
const futureTimeElement = document.getElementById('selected_time');
const countdownElement = document.getElementById('countdown_timer');
const logout_btn = document.getElementById('logout_btn');

const yesButton = document.getElementById('yes-btn');
const noButton = document.getElementById('no-btn');
const listButton = document.getElementById('list-btn');
const unsubsribeButton = document.getElementById('unsubsribe-btn');
const btn_hint = document.getElementById('action_hint');

const cta_action = document.getElementById('cta_action');
const cta_action_text = document.getElementById('cta_action_text');
const cta_text_name = document.getElementById('cta_text_name');

var i = 0;
var i_vis = 0

const options_24 = {
    timeZone: 'Asia/Dhaka',
    hour12: false, // Use 24-hour clock format
    hour: '2-digit', // Display hour in 2-digit format
    minute: '2-digit', // Display minute in 2-digit format
};
const options_12 = {
    timeZone: 'Asia/Dhaka',
    hour12: true, // Use 24-hour clock format
    hour: '2-digit', // Display hour in 2-digit format
    minute: '2-digit', // Display minute in 2-digit format
};

function askName(){
    if (userName) {
        name_person.textContent = userName;
    } else {
        // Prompt user to enter their name
        var name = prompt("Enter your name:");
        name = capitalizeWords(name);
        if (name !== null && name !== "") {
            localStorage.setItem('userName', name);
            name_person.textContent = name;
            document.location.reload();
        }
        else{
            askName();
        }
    }
    logout_btn.style.display = 'block';
}

function startCountdown(timeLeft) {
    const countdownInterval = setInterval(() => {
        timeLeft -= 1000; // Decrement by 1 second

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        if (days != 0) {
            countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
        else {
            if (hours != 0) {
                countdownElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
            }
            else {
                if (minutes != 0) {
                    countdownElement.textContent = `${minutes}m ${seconds}s`;
                }
                else {
                    countdownElement.textContent = `${seconds}s`;
                }
            }
        }

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            countdownElement.textContent = "Time's up!";
        }
    }, 1000);
}

function setAllTime(){
    // Fetch existing data from data.json
    fetch('http://localhost:3000/getData')
        .then(response => response.json())
        .then(jsonData => {
            var dbDate = jsonData.next_session.date;
            var dbTime = jsonData.next_session.time;
            var dateStr = dbDate + " " + dbTime;

            const fixedDate = new Date(dateStr);
            var showDate = fixedDate.toLocaleString('en-US', {month: 'short',day: '2-digit'});
            var showTime = fixedDate.toLocaleTimeString('en-US', options_12);
            futureTimeElement.textContent = showDate + ", " + showTime;

            const currentDate = new Date();
            var showCurrDate = fixedDate.toLocaleString('en-US', {month: 'short',day: '2-digit'});
            const timeComponents = currentDate.toLocaleTimeString('en-US', options_12);
            present_time.textContent = showCurrDate + ", " + timeComponents;

            var diffTime = fixedDate - currentDate;
            startCountdown(diffTime);
        }
    );
}

function capitalizeWords(str) {
    const words = str.split(' ');
    const capitalizedWords = words.map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    return capitalizedWords.join(' ');
}

function inArray(needle, haystack) {
    //console.log(needle,haystack);
    for (let i = 0; i < haystack.length; i++) {
        if (haystack[i] === needle) {
            return true;
        }
    }
    return false;
}

function getRandomPosition() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const buttonWidth = noButton.offsetWidth;
    const buttonHeight = noButton.offsetHeight;

    const minX = buttonWidth; // Avoid placing it on the left edge
    const maxX = windowWidth - buttonWidth;
    const minY = buttonHeight; // Avoid placing it on the top edge
    const maxY = windowHeight - buttonHeight;

    return {
        x: Math.floor(Math.random() * (maxX - minX + 1) + minX),
        y: Math.floor(Math.random() * (maxY - minY + 1) + minY)
    };
}

function sendDataToServer(data) {
    fetch('http://localhost:3000/updateData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                console.log('Data updated successfully');
            } else {
                console.error('Failed to update data');
            }
        }).catch(error => console.error('Error updating data:', error)
    );
}

function saveData() {
    // Fetch existing data from data.json
    fetch('http://localhost:3000/getData')
        .then(response => response.json())
        .then(scheduleData => {
            // Set default value for datetime input
            var dbDate = scheduleData.next_session.date;
            var dbTime = scheduleData.next_session.time;

            var presentName = localStorage.getItem('userName');

            const sessionDates = Object.keys(scheduleData);
            if (inArray(dbDate, sessionDates)) {
                const sessionTimes = Object.keys(scheduleData[dbDate]);
                if (inArray(dbTime, sessionTimes)) {
                    if (!inArray(presentName, scheduleData[dbDate][dbTime]['list'])) {
                        scheduleData[dbDate][dbTime]['list'].push(presentName);
                    } else {
                        console.log("Already Added!");
                    }
                } else {
                    scheduleData[dbDate][dbTime] = {
                        'active' : true,
                        "list" : [presentName]
                    };
                }
            } else {
                scheduleData[dbDate] = {
                    [dbTime] : {
                        'active' : true,
                        "list" : [presentName]
                    }
                };
            }
            // Once data is fetched, send it to the server for storage
            sendDataToServer(scheduleData);
        }).catch(error => console.error('Error fetching data:', error)
    );
}

logout_btn.addEventListener("click",function (event) {
    localStorage.removeItem('userName');
    window.location.reload()
})

yesButton.addEventListener("click", function (event) {
    event.preventDefault();
    saveData();
});

noButton.addEventListener('mouseover', () => {
    const newPosition = getRandomPosition();
    noButton.style.position = 'absolute';
    noButton.style.left = `${newPosition.x}px`;
    noButton.style.top = `${newPosition.y}px`;
    ++i;
    if (i > 5) {
        btn_hint.style.opacity = 1;
        ++i_vis;
        if (i_vis > 2) {
            i = 0;
        }
    }
    else {
        btn_hint.style.opacity = 0;
    }
});

listButton.addEventListener("click",function (event) {
    event.preventDefault();
    window.location.href = "participants.html";
})

unsubsribeButton.addEventListener("click",function (event) {
    // Fetch existing data from data.json
    fetch('http://localhost:3000/getData')
    .then(response => response.json())
    .then(jsonData => {
        // Set default value for datetime input
        var dbDate = jsonData.next_session.date;
        var dbTime = jsonData.next_session.time;

        const userList = jsonData[dbDate][dbTime]['list'];
        var presentName = localStorage.getItem('userName');

        const index = userList.indexOf(presentName);
        if (index !== -1) {
            userList.splice(index, 1);
        }
        jsonData[dbDate][dbTime]['list'] = userList;

        sendDataToServer(jsonData);
    });
})

function checkAndUpdate(scheduleData){
    // Set default value for datetime input
    var dbDate = scheduleData.next_session.date;
    var dbTime = scheduleData.next_session.time;

    const sessionDates = Object.keys(scheduleData);
    if (inArray(dbDate, sessionDates)) {
        const sessionTimes = Object.keys(scheduleData[dbDate]);
        if (inArray(dbTime, sessionTimes)) {
            if(inArray(userName, scheduleData[dbDate][dbTime]['list'])){
                found = true;
            }
        }
    }
    if(found){
        cta_text_name.textContent = userName;
        cta_action.classList.add('hide');
        cta_action_text.classList.remove('hide');
    }else{
        cta_action.classList.remove('hide');
        cta_action_text.classList.add('hide');
    }
}

setAllTime();
askName();

window.onload = function() {
    var found = false;
    // Fetch existing data from data.json
    fetch('http://localhost:3000/getData')
    .then(response => response.json())
    .then(scheduleData => {
        checkAndUpdate(scheduleData);
    });
};
