// Function that adds the different options to the select menu
// when the page first loads
// Allows for dynamic updating as a new location just needs to be added
// to the database
async function populateLocationMenu(){
    // Fetch all the locations
    let locationNames = await getData('http://localhost:8000/locations/locationnames')
    let locationSelect = document.querySelector('#location-menu')

    if(!locationNames.success) {
        console.log('Error when populating locations: ', locationNames.error.message)
        return
    }

    // Creates a new option for each location returned
    locationNames.data.forEach(element => {
        let newOption = document.createElement('option')
        newOption.value = element.location_id
        newOption.innerHTML = element.name[0].toUpperCase() + element.name.slice(1)

        locationSelect.append(newOption)
    });
}

// Ensures that a location is selected before allowing users to click
// the fetch button
// -REQUIRES EITHER-
// A location be selected in the dropdown menu
// OR
// Both a latitude and longitude coordinate be present in the inputs
async function checkValidLocation() {
    let location = document.querySelector('#location-menu').value
    let latInp = document.querySelector('#latInp').value
    let longInp = document.querySelector('#longInp').value
    let weatherButton = document.querySelector('#getWeatherButton')
    
    if (location == "none" && (latInp == "" || longInp == "")) {
        weatherButton.disabled = true
        return
    }
    else {
        weatherButton.disabled = false
    }
}

// Funtion that returns the direction of the wind based
// on the degrees
function weatherDirection(degrees) {
    if (degrees <= 22.5) {
        return 'N'
    }
    else if (degrees <= 67.5) {
        return 'NE'
    }
    else if (degrees <= 112.5) {
        return 'E'
    }
    else if (degrees <= 157.5) {
        return 'SE'
    }
    else if (degrees <= 202.5) {
        return 'S'
    }
    else if (degrees <= 247.5) {
        return 'SW'
    }
    else if (degrees <= 292.5) {
        return 'W'
    }
    else if (degrees <= 337.5) {
        return 'NW'
    }
    else {
        return 'N'
    }
}

// Function that runs when the user wants to get the weather
async function getWeather() {
    // Define the `dataRequest` variable outside so it can be accessed
    // outside the if statements
    let dataRequest;

    // Get the values of the needed selections
    let location = document.querySelector('#location-menu').value
    let latInp = document.querySelector('#latInp').value
    let longInp = document.querySelector('#longInp').value
    let weatherTitle = document.querySelector('.weatherInTitle')

    // Changes how the forecast is fetched based on what was inputted
    // Coordinates fetches the weather directly
    // Select menu gets the coordinates from the db first then fetches
    if (latInp != "" && longInp != "") {
        dataRequest = await getDataExternal(`https://api.openweathermap.org/data/2.5/forecast?lat=${latInp}&lon=${longInp}&units=metric&appid=ba1de23f53638f2cde9dcee0bbb8a657`)
        // Checks to see if the weather response is valid
        if (dataRequest.cod != 200) {
            console.log('Invalid Request')
            return
        }
        weatherTitle.innerHTML = `Weather at: ${latInp}, ${longInp}`
    }
    else if (location != "none") {
        let coords = await getData(`http://localhost:8000/locations/locationcordsbyid/${location}`)
        if (!coords.success) {
            console.log('Error when fetching coordinates')
            return
        }
        dataRequest = await getDataExternal(`https://api.openweathermap.org/data/2.5/forecast?lat=${coords.data.lat}&lon=${coords.data.lon}&units=metric&appid=ba1de23f53638f2cde9dcee0bbb8a657`)
        weatherTitle.innerHTML = `Weather in: ${document.querySelector('#location-menu option:checked').text}`
    }
    else {
        console.log('Attempted to get location without a location, cancelling')
        return
    }

    const template = document.querySelector('.weather-slot')
    const weatherContainer = document.querySelector('.weather-container')

    // Removes any existing weather from the menu
    let containerChildren = weatherContainer.children
    while (containerChildren.length != 1) {
        weatherContainer.lastElementChild.remove()
    }

    // Creates weather groups based on the day so each days weather can be
    // displayed seperatly
    weatherGroupContainer = {}
    dataRequest.list.forEach(element => {
        let newItem = template.cloneNode(true)
        let c = newItem.children
        let weatherDate = new Date(element.dt * 1000)
        c[0].src = `https://openweathermap.org/img/wn/${element.weather[0].icon}@4x.png`
        let displayDate = `${weatherDate.getDate()}/${weatherDate.getMonth()+1}`
        c[1].innerHTML = `${weatherDate.getHours()}:00`
        c[2].innerHTML = `${Math.floor(element.main.temp)}°C`
        c[4].innerHTML = `${Math.round(element.pop*100)}%`
        c[6].innerHTML = weatherDirection(element.wind.deg)
        c[7].innerHTML = `${element.wind.speed}m/s`
        newItem.style.display = 'inline-flex'
        if (weatherGroupContainer.hasOwnProperty(displayDate) == false) {
            weatherGroupContainer[displayDate] = []
        }
        weatherGroupContainer[displayDate].push(newItem)
    })
    
    // Appends all of the weather groups to the container to display
    for (const i in weatherGroupContainer) {
        let cont = document.createElement('div')
        cont.classList.add('weather-group')
        weatherGroupContainer[i].forEach(element => {
            cont.append(element)
        })
        let heading = document.createElement('h2')
        heading.innerText = i
        weatherContainer.append(heading)
        weatherContainer.append(cont)
        let li = document.createElement('hr')
        li.style.width = "90%"
        weatherContainer.append(li)
    }

    // Makes the container visible if its not
    // (its the users first time loading weather on the page)
    document.querySelector('.weather-display').style.display = 'inline-flex'
}