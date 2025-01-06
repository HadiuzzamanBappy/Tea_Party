const newTime = document.getElementById('newTime');
const present_time = document.getElementById('present_time');
const selected_time = document.getElementById('selected_time');
const labelPartyTime = document.getElementById('labelPartyTime');
const partyTimeDropdown = document.getElementById('partyTime');
const userListContainer = document.getElementById('userList');

const options_12 = {
    timeZone: 'Asia/Dhaka',
    hour12: true, // Use 24-hour clock format
    hour: '2-digit', // Display hour in 2-digit format
    minute: '2-digit', // Display minute in 2-digit format
};
const options_24 = {
    timeZone: 'Asia/Dhaka',
    hour12: false, // Use 24-hour clock format
    hour: '2-digit', // Display hour in 2-digit format
    minute: '2-digit', // Display minute in 2-digit format
};

function inArray(needle, haystack) {
    //console.log(haystack[3]===needle);
    for (let i = 0; i < haystack.length; i++) {
        if (haystack[i] === needle) {
            return true;
        }
    }
    return false;
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
    })
        .catch(error => console.error('Error updating data:', error));
}

function setData(){
    // Fetch existing data from data.json
    fetch('http://localhost:3000/getData')
        .then(response => response.json())
        .then(jsonData => {
            // Set default value for datetime input
            var dbDate = jsonData.next_session.date;
            var dbTime = jsonData.next_session.time;
            var dateStr = dbDate + " " + dbTime;

            //adjust time for showing as input result
            const nextSessionTime = new Date(dateStr); // Append 'UTC' to indicate UTC time zone
            const offsetMilliseconds = nextSessionTime.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
            const nextSessionLocalTime = new Date(nextSessionTime.getTime() - offsetMilliseconds); // Adjust for local time zone
            const nextSessionTimeString = nextSessionLocalTime.toISOString().slice(0, -8); // Convert to ISO string without seconds
            newTime.value = nextSessionTimeString;

            // show the fixed tea party date and time
            const fixedDate = new Date(dateStr);
            var showFixedDate = fixedDate.toLocaleString('en-US', {month: 'short',day: '2-digit'});
            var showFixedTime = fixedDate.toLocaleTimeString('en-US', options_12);
            selected_time.textContent = showFixedDate + ", " + showFixedTime;

            // show current date and time
            const currentDate = new Date();
            var showCurrDate = currentDate.toLocaleString('en-US', {month: 'short',day: '2-digit'});
            var timeComponents = currentDate.toLocaleTimeString('en-US', options_12);
            present_time.textContent = showCurrDate + ", " + timeComponents;

            // displaying options for add a name in dropdown
            const sessionDates = Object.keys(jsonData);
            var added = false;
            sessionDates.shift(); // Remove 'next_session' key
            for (const sessionDate of sessionDates) {
                if(sessionDate === dbDate){
                    const sessionTimes = Object.keys(jsonData[sessionDate]);
                    for (const sessionTime of sessionTimes) {
                        if(jsonData[sessionDate][sessionTime]!==null){
                            if(jsonData[sessionDate][sessionTime]['active']){
                                const option = document.createElement('option');

                                var dateOption = sessionDate + " " + sessionTime;
                                sessionTimeFormatted = new Date(dateOption).toLocaleTimeString('en-US', options_12);

                                option.value = sessionTime;
                                option.textContent = sessionTimeFormatted;
                                partyTimeDropdown.appendChild(option);
                                added = true;
                            }
                        }
                    }
                }
            }
            if(!added){
                const option = document.createElement('option');
                option.value = dbTime;
                option.textContent = showFixedTime;
                partyTimeDropdown.appendChild(option);
            }

            // showing all the user list in checkboxes
            if(inArray(dbDate,sessionDates)){
                var userList = jsonData[dbDate][dbTime]['list'];
                userList.forEach(user => {
                    const checkboxDiv = document.createElement('div');
                    checkboxDiv.className = 'userDiv'
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.name = 'userlist';
                    checkbox.value = user;

                    const label = document.createElement('label');
                    label.textContent = user;

                    const br = document.createElement('br');

                    checkboxDiv.appendChild(checkbox);
                    checkboxDiv.appendChild(label);
                    userListContainer.appendChild(checkboxDiv);
                });
            }
        }).catch(error => console.error('Error fetching data:', error)
    );
}

function editPartyTime() {
    // Fetch existing data from data.json
    fetch('http://localhost:3000/getData')
        .then(response => response.json())
        .then(jsonData => {
            const newTimeInput = newTime.value;
            const newDateTime = new Date(newTimeInput);    
            // Get year, month, and date
            const year = newDateTime.getFullYear();
            const month = newDateTime.getMonth() + 1; // Months are zero-based
            const date = newDateTime.getDate();

            const dateComponents = month+'-'+date+'-'+year;
            const timeComponents = newDateTime.toLocaleTimeString('en-US', options_24);   

            console.log(dateComponents,timeComponents);

            jsonData['next_session']['date'] = dateComponents;
            jsonData['next_session']['time'] = timeComponents;

            console.log(jsonData);
            
            sendDataToServer(jsonData);
        });
}

function addUserToParty() {
    const userName = document.getElementById('userName').value;
    var partyTime = document.getElementById('partyTime').value;

    if(userName !== ""){
        // Fetch existing data from data.json
        fetch('http://localhost:3000/getData')
        .then(response => response.json())
        .then(scheduleData => {
            // Set default value for datetime input
            var dbDate = scheduleData.next_session.date;
            var dbTime = scheduleData.next_session.time;

            const sessionDates = Object.keys(scheduleData);
            if (inArray(dbDate, sessionDates)) {
                const sessionTimes = Object.keys(scheduleData[dbDate]);
                if (inArray(partyTime, sessionTimes)) {
                    if (!inArray(userName, scheduleData[dbDate][partyTime])) {
                        scheduleData[dbDate][partyTime]['list'].push(userName);
                    } else {
                        console.log("Already Added!");
                    }
                } else {
                    scheduleData[dbDate][partyTime] = {
                        'active' : true,
                        "list" : [userName]
                    };
                }
            } else {
                scheduleData[dbDate] = {
                    [partyTime] : {
                        'active' : true,
                        "list" : [userName]
                    }
                };
            }
            // Once data is fetched, send it to the server for storage
            sendDataToServer(scheduleData);
        });
    }
}

function removePartiesOnPresentDate() {
    const selectedUsers = Array.from(document.querySelectorAll('input[name="userlist"]:checked')).map(checkbox => checkbox.value);
    console.log(selectedUsers);

    // Fetch existing data from data.json
    fetch('http://localhost:3000/getData')
    .then(response => response.json())
    .then(jsonData => {
        // Set default value for datetime input
        var dbDate = jsonData.next_session.date;
        var dbTime = jsonData.next_session.time;

        const userList = jsonData[dbDate][dbTime]['list'];
        selectedUsers.forEach(user => {
            const index = userList.indexOf(user);
            if (index !== -1) {
                userList.splice(index, 1);
            }
        });
        jsonData[dbDate][dbTime]['list'] = userList;

        sendDataToServer(jsonData);
    });
}

setData();
