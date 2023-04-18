// Function to handle checking of the user is logged in or not
async function checkLogin() {
    // Gets the login token from the users cookies (if their is one)
    let cookieArray = document.cookie.split(';')
    let loginToken = cookieArray[0].split('=')[1]
    
    // If the user hasn't got a cookie
    if (!loginToken) {
        console.log('No token found')
        return null
    }

    let req = await postData('http://localhost:8000/accounts/tokenLogin', {token: loginToken})
    // If the cookies has expired or something else goes wrong
    if (!req.success) {
        if (req.error.code == 6) {
            console.log('Cookie has expired, deleting...')
            document.cookie = 'token=' + loginToken + '; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
        }
        else {
            console.log('Server Error:', req.error.message)
        }
        return null
    }

    return req.accountID
}