async function homepageWeather() {
    
    // Check to see if the user is logged in
    let loggedIn = await checkLogin()
    if (!loggedIn) {
        let items = document.querySelector('.right-container').children

        // Remove the initial contents of the page till only the 2 needed are left
        while (items.length != 2) {
            items[2].remove()
        }

        // Create a new header to display in the box
        let newHeader = document.createElement('h2')
        newHeader.innerText = 'Please log in or create an account to access this feature.'
        newHeader.style.textAlign = 'center'
        document.querySelector('.right-container').appendChild(newHeader)
        return
    }

    // Get users default location data
    let defaultLocation = await postData(
        'http://localhost:8000/accountdata/defaultlocation',
        {accountID: loggedIn}
    )

    // If the user hasn't got a default location set, then the homepage updates to reflect it
    if (defaultLocation.ID == 0) {
        let items = document.querySelector('.right-container').children

        while (items.length != 2) {
            items[2].remove()
        }

        let newHeader = document.createElement('h2')
        newHeader.innerText = 'Please select a default location from the settings.'
        newHeader.style.textAlign = 'center'
        document.querySelector('.right-container').appendChild(newHeader)
        return
    }

    // Get the current weather in the users default location
    let currentWeatherData = await getDataExternal(
        `https://api.openweathermap.org/data/2.5/weather?lat=${defaultLocation.lat}&lon=${defaultLocation.long}&units=metric&appid=ba1de23f53638f2cde9dcee0bbb8a657`
        )
    
    // Update the current weather display to reflect the current weather conditons
    document.querySelector('.cw-place-name').innerText = currentWeatherData.name
    document.querySelector('#cw-number').innerText = `${currentWeatherData.main.temp}°C`
    document.querySelector('.cw-weather').style.backgroundImage = `url('https://openweathermap.org/img/wn/${currentWeatherData.weather[0].icon}@4x.png')`

    let getForecast = await getDataExternal(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${defaultLocation.lat}&lon=${defaultLocation.long}&units=metric&cnt=4&appid=ba1de23f53638f2cde9dcee0bbb8a657`
    )

    // Populate the small grid with the upcoming weather for the next 12 hours (3 hour jumps)
    let forecastTempalte = document.querySelector('.forecast-section')
    let forecastContainer = document.querySelector('.weather-hour-forecast')
    getForecast.list.forEach(element => {
        let weatherItem = forecastTempalte.cloneNode(true)
        weatherItem.style.display = 'inline-flex'
        let weatherIm = weatherItem.querySelector('img')
        weatherIm.src = `https://openweathermap.org/img/wn/${element.weather[0].icon}@4x.png`
        let weatherDesc = element.weather[0].description
        weatherIm.title = weatherDesc[0].toUpperCase() + weatherDesc.slice(1)

        weatherItem.children[1].innerText = `${element.main.temp}°C`

        // Create a new date object to get the time
        // dt multiplied by 1000 to get the time in ms
        let weatherDate = new Date(element.dt * 1000)
        weatherItem.children[2].innerText = `${weatherDate.getHours()}:00`

        forecastContainer.appendChild(weatherItem)
    });
}