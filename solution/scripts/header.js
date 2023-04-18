// Checks to see if the user is logged in on every page
// If the user is logged in, changes the header pfp to a cow
async function updateHeader() {
    let loggedIn = await checkLogin()
    if (loggedIn) {
        let profileImage = document.querySelector('#userProfile').querySelector('img')
        profileImage.src = "../images/pfp.jpg"
        profileImage.classList.remove('noAccountImage')
        profileImage.classList.add('accountImage')
        console.log('User Found, Logging in')
    }
    else {
        document.querySelector('#settingsNav').innerHTML = 'Log In'
    }
}

// Updates the navigation bar to reflect which page the user is currently on
// Changes the link to green
async function updateNav() {
    let navTag = document.head.querySelector('meta[name="pagename"]').getAttribute('content')
    try {
        document.body.querySelector(`#${navTag}`).classList.add('selectedLink')
    }
    catch {
        console.log('Meta data doesn\'t exist')
    }
}

// Opens or closes the navigation bar based on the current status of it
async function toggleNav() {
    let menu = document.querySelector('.navigationMenu')
    if (menu.classList.contains('navigationMenu-open')) {
        menu.classList.remove('navigationMenu-open')
    }
    else {
        menu.classList.add('navigationMenu-open')
    }
}

// Changes what happens when the user clicks on the profile
// depending on if they're currently logged in or not
async function profileClick() {
    let img = document.querySelector('#userProfile').querySelector('img').classList.contains('accountImage')
    // If the user is signed in
    if (img) {
        window.location.href = "settings.html"
    }
    else {
        window.location.href = "registration.html"
    }
}

async function homeClick() {
    window.location.href = 'index.html'
}

// Navigates the user to the requested page
async function navigate(target) {
    switch(target.id) {
        case 'homeNav':
            window.location.href = 'index.html'
            break
        case 'weatherNav':
            window.location.href = 'weather.html'
            break
        case 'airQNav':
            window.location.href = 'airQuality.html'
            break
        case 'settingsNav':
            profileClick()
            break
        case 'adviceNav':
            window.location.href = "advice.html"
            break
    }
}