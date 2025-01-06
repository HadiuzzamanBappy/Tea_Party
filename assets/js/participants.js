var scheduleListContainer = document.getElementById("scheduleList");
const present_time = document.getElementById('selected_time'); 
const tea_time = document.getElementById('tea_time'); 
const options_12 = {
    timeZone: 'Asia/Dhaka',
    hour12: true, // Use 24-hour clock format
    hour: '2-digit', // Display hour in 2-digit format
    minute: '2-digit', // Display minute in 2-digit format
};

fetch('http://localhost:3000/getData')
    .then(response => response.json())
    .then(jsonData => {
        const currentDate = new Date();
        var showDate = currentDate.toLocaleString('en-US', {month: 'short',day: '2-digit'});
        var showTime = currentDate.toLocaleTimeString('en-US', options_12);
        present_time.textContent = showDate + ", " + showTime;

        var dbDate = jsonData.next_session.date;
        var dbTime = jsonData.next_session.time;
        var dateStr = dbDate + " " + dbTime;

        const fixedDate = new Date(dateStr);
        var selectedDate = fixedDate.toLocaleString('en-US', {month: 'short',day: '2-digit'});
        var selectedTime = fixedDate.toLocaleTimeString('en-US', options_12);
        tea_time.textContent = "Tea Time: " + selectedDate + ", " + selectedTime;

        // Iterate through each date
        for (var date in jsonData) {
            // Skip the "next_session" key
            if (date === "next_session" || date !== dbDate) {
                continue;
            }
            
            var found = false;
            // Iterate through each time slot for the date
            for (var time in jsonData[date]) {
                if(time === dbTime){
                    found = true;

                    var subtitle = document.createElement("h4");
                    subtitle.textContent = "Person who accepted proposal:";

                    // Create an unordered list for the people
                    var peopleList = document.createElement("ul");
                    
                    var personListShow = jsonData[date][time]['list'];
                    // Iterate through each person for the time slot
                    for (var i = 0; i < personListShow.length; i++) {
                        // Create a list item for the person
                        var personItem = document.createElement("li");
                        personItem.textContent = personListShow[i];
                        peopleList.appendChild(personItem);
                    }

                    // Append the time item to the schedule list container
                    scheduleListContainer.appendChild(subtitle);
                    scheduleListContainer.appendChild(peopleList);
                }
            }
            if(!found){
                // Create a list item for the time
                var timeItem = document.createElement("li");
                timeItem.textContent = "No one added till now in this " + time;

                // Append the time item to the schedule list container
                scheduleListContainer.appendChild(timeItem);
            }
        }
    }
)
.catch(error => console.error('Error fetching data:', error));