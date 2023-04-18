
// Regex for checking if an email is valid
const EMAIL_REGEX = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

// Function that checks to see if the users login information
// meets the requirements (valid email, pass between 3-20 chars)
function checkLoginInfo() {
    let email = document.querySelector('#loginUsername').value
    let password = document.querySelector('#loginPassword').value
    let loginButton = document.querySelector('#loginButton')

    // Check for a valid email
    let validEmail = EMAIL_REGEX.test(email)
    if (!validEmail) {
        loginButton.disabled = true
        console.log('Invalid email: ', email)
        return
    }

    // Check password length
    if (password.length < 3 || password.length > 20) {
        loginButton.disabled = true
        console.log('Password bad length: ', password.length)
        return
    }

    loginButton.disabled = false
    console.log('Valid email and password')
}

// Function that checks to see if the users signup information
// meets the requirements (valid email, pass between 3-20 chars, confirm pass matches)
function checkSignupInfo() {
    let email = document.querySelector('#signUpUsername').value
    let password = document.querySelector('#signUpPassword').value
    let passwordConf = document.querySelector('#signUpPasswordConf').value
    let signUpButton = document.querySelector('#signUpButton')

    // Check for a valid email
    let validEmail = EMAIL_REGEX.test(email)
    if (!validEmail) {
        signUpButton.disabled = true
        console.log('Invalid email: ', email)
        return
    }

    // Check password length
    if (password.length < 3 || password.length > 20) {
        signUpButton.disabled = true
        console.log('Password bad length: ', password.length)
        return
    }

    // Check password match
    if (password != passwordConf) {
        signUpButton.disabled = true
        console.log('Passwords don\'t match: ', password, passwordConf)
        return
    }

    signUpButton.disabled = false
    console.log('Valid Signup Information')
}

// Function that handles logging into an account
async function login() {
    // Get the entered username or password
    let email = document.querySelector('#loginUsername').value
    let password = document.querySelector('#loginPassword').value

    let req = await postData('http://localhost:8000/accounts/login', {email: email, password: password})
    // If the login attempt failed or something went wrong
    if (!req.success) {
        // Create an error message based on the response
        let errMes = document.querySelector('#login-error-message')
        errMes.style.visibility = 'visible'
        if (req.error.code == 0) {
            errMes.innerHTML = 'Internal Error, please contact support.'
        }
        else {
            errMes.innerHTML = 'Username or Password is incorrect!'
        }

        return
    }

    // Create a token for the user so they can login instantly
    // Redirect the user to the homepage
    let cookie = 'token=' + req.loginID + '; expires=' + req.expires + '; path=/'
    document.cookie = cookie
    window.location.href = "index.html"
}

// Function that handles signing up with a new account
async function signup() {
    // Get the email and password entered
    // (confirm password not needed as its the same as the regular password)
    let email = document.querySelector('#signUpUsername').value
    let password = document.querySelector('#signUpPassword').value

    let req = await postData('http://localhost:8000/accounts/signup', {email: email, password: password})
    let errMes = document.querySelector('#register-error-message')
    // If the email has already been registed or an error occured
    if (!req.success) {
        errMes.style.visibility = 'visible'
        errMes.style.color = '#ff5353'
        if (req.error.code == 0) {
            errMes.innerHTML = 'Internal Error, please contact support.'
        }
        else {
            errMes.innerHTML = 'Email has already been registered!'
        }
        return
    }

    // Tell the user an account has been created
    errMes.style.visibility = 'visible'
    errMes.style.color = '#31e467'
    errMes.innerHTML = 'Account Created!'

}

// Function to swap the login and signup boxs
async function swapDisplay() {
    let loginBox = document.querySelector('#login-box')
    let registerBox = document.querySelector('#register-box')

    if (loginBox.style.display == "none") {
        loginBox.style.display = "inline-flex"
        registerBox.style.display = 'none'
    }
    else {
        loginBox.style.display = "none"
        registerBox.style.display = 'inline-flex'
    }
}

// Automatically redirects the user to the homepage if they are already
// logged into an account
//
// Prevents users from trying to login into another account when they are
// already signed in
async function checkAlreadyLoggedIn() {
    let check = await checkLogin()
    if (check) {
        window.location.href = "index.html"
    }
}