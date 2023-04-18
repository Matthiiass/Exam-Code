// Function that adds the different options to the select menu
// when the page first loads
// Allows for dynamic updating as a new location just needs to be added
// to the database
async function populateDefaultLocationMenu(){
    // Fetch all the locations
    let locationNames = await getData('http://localhost:8000/locations/locationnames')
    let locationSelect = document.querySelector('#default-location')

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

// Check to see if the user is logged in when the page first loads
// If they're not, redirect them to the home page
async function checkUser() {
    userID = await checkLogin()
    if (!userID) {
        window.location.href = "index.html"
    }
    usersEmail = await getData(`http://localhost:8000/accountdata/getuseremail/${userID}`)
    document.querySelector('#users-email').innerHTML = usersEmail.email
}

// Save the new default location by sending a request to the backend
async function saveDefault() {
    const locationValue = document.querySelector('#default-location').value
    dataRequest = await postData(
        'http://localhost:8000/accountdata/updatedefaultlocation',
        {
            location: (locationValue == "none") ? 0 : parseInt(locationValue),
            id: await checkLogin()
        }
    )

    console.log('Updated')
}

// Log the user out by requesting their cookie be deleted then redirecting them to a different page
async function logOut() {
    let cookieArray = document.cookie.split(';')
    let loginToken = cookieArray[0].split('=')[1]

    deleteCookieStore = await postData(
        'http://localhost:8000/accounts/logout',
        {
            token: loginToken
        }    
    )

    if (deleteCookieStore.success) {
        window.location.href = 'index.html'
        return
    }
    console.log('Something went wrong when trying to logout!')
}

let conf = false
async function deleteAccount() {
    if (conf != true) {
        conf = true
        document.querySelector('#confDel').style.visibility = 'visible'
        return
    }
    let id = await checkLogin()
    let cookieArray = document.cookie.split(';')
    let loginToken = cookieArray[0].split('=')[1]

    deleteCookieStore = await postData(
        'http://localhost:8000/accounts/logout',
        {
            token: loginToken
        }    
    )

    if (!deleteCookieStore.success) {
        console.log('Something went wrong when trying to delete cookies')
        return
    }

    account = await postData(
        'http://localhost:8000/accounts/deleteaccount',
        {
            id: id
        }
    )

    if (!account.success) {
        console.log('Something went wrong when trying to delete account')
        return
    }

    window.location.href = 'index.html'
}