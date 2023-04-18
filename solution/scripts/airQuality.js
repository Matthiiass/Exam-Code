// Array of information for colours and displays
const COLOUR_INDEX = [
    {colour: '#75d661', name: 'Good', desc: 'It is safe for all people to go outdoors.'},
    {colour: '#e6c63a', name: 'Fair', desc: 'It is safe for most people to go outdoors.'},
    {colour: '#e9872c', name: 'Moderate', desc: 'People with breathing issues may want to stay indoors.'},
    {colour: '#ee3d3d', name: 'Poor', desc: 'It is not advised for people to go outdoors. Only leave if you need to.'},
    {colour: '#e15fe6', name: 'Very Poor', desc: 'It is not safe to go outdoors. Stay safe and keep inside.'}
]

// Returns to index of `COLOUR_INDEX` for the air quality entered
// Just a really long switch statement with ifs in them
function matchQualityWithIndex(quality, type) {
    switch(type) {
        case 'co':
            if ( quality < 4400) {
                return 0
            } else if (quality < 9400) {
                return 1
            } else if (quality < 12400) {
                return 2
            } else if (quality < 15400) {
                return 3
            } else {
                return 4
            }
        case 'o3':
            if ( quality < 60) {
                return 0
            } else if (quality < 100) {
                return 1
            } else if (quality < 140) {
                return 2
            } else if (quality < 180) {
                return 3
            } else {
                return 4
            }
        case 'pm2_5':
            if ( quality < 10) {
                return 0
            } else if (quality < 25) {
                return 1
            } else if (quality < 50) {
                return 2
            } else if (quality < 75) {
                return 3
            } else {
                return 4
            }
        case 'pm10':
            if ( quality < 20) {
                return 0
            } else if (quality < 50) {
                return 1
            } else if (quality < 100) {
                return 2
            } else if (quality < 200) {
                return 3
            } else {
                return 4
            }
        case 'no2':
            if ( quality < 40) {
                return 0
            } else if (quality < 70) {
                return 1
            } else if (quality < 150) {
                return 2
            } else if (quality < 200) {
                return 3
            } else {
                return 4
            }
        case 'so2':
            if ( quality < 20) {
                return 0
            } else if (quality < 80) {
                return 1
            } else if (quality < 250) {
                return 2
            } else if (quality < 350) {
                return 3
            } else {
                return 4
            }
        default:
            return 0
    }
}

// Function that runs when the user wants to get the air quality
async function getAirQuality() {
    // ------------------
    // This is the same as the start of the `getWeather()` function in
    // weatherdash.js
    // See that file for commenting
    let dataRequest;
    let location = document.querySelector('#location-menu').value
    let latInp = document.querySelector('#latInp').value
    let longInp = document.querySelector('#longInp').value

    if (latInp != "" && longInp != "") {
        dataRequest = await getDataExternal(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${latInp}&lon=${longInp}&appid=ba1de23f53638f2cde9dcee0bbb8a657`)
    }
    else if (location != "none") {
        let coords = await getData(`http://localhost:8000/locations/locationcordsbyid/${location}`)
        if (!coords.success) {
            console.log('Error when fetching coordinates')
            return
        }
        dataRequest = await getDataExternal(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${coords.data.lat}&lon=${coords.data.lon}&appid=ba1de23f53638f2cde9dcee0bbb8a657`)
    }
    else {
        console.log('Attempted to get location without a location, cancelling')
        return
    }

    if (dataRequest.hasOwnProperty('cod')) {
        console.log('Invalid Request')
        return
    }
    // ------------------

    // Changes the main ring based on the overall air quality in the area
    let dataFromList = dataRequest.list[0]
    let mainRing = document.body.querySelector('.main-display')
    mainRing.querySelector('div').style.backgroundColor = COLOUR_INDEX[dataFromList.main.aqi-1].colour
    mainRing.querySelector('.quality-title').innerHTML = COLOUR_INDEX[dataFromList.main.aqi-1].name
    mainRing.querySelector('h3').innerHTML = COLOUR_INDEX[dataFromList.main.aqi-1].desc

    // Edits each ring to display the correct value and colour
    for (const i in dataFromList.components) {
        let relatedComp = document.querySelector(`#${i}`)
        if (relatedComp == null) {
            continue
        }
        relatedComp = relatedComp.querySelector('.quality-rating')
        relatedComp.querySelector('h2').innerText = dataFromList.components[i]
        relatedComp.style.backgroundColor = COLOUR_INDEX[matchQualityWithIndex(dataFromList.components[i], i)].colour
    }

    // Make the container visible if its not already
    document.querySelector('.quality-container').style.display = 'flex'
}