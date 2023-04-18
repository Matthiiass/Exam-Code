import express from "express";
import bcrypt from "bcrypt"
import secureRandom from "secure-random"
import moment from "moment"
import { runQuery, packetToJSON } from "../db/databaseHandler.js";

var router = express.Router()

// To be registered as valid, an object must:
// - Have a length of 2 and contain both an email and password field
// OR
// - Have a length of 3 and contain an email, password and rememberMe field
function validAccountObject(obj) {
    if (Object.keys(obj).length == 2 && obj.hasOwnProperty('email') && obj.hasOwnProperty('password')) {
        return true
    }
    if (Object.keys(obj).length == 3 && obj.hasOwnProperty('email') && obj.hasOwnProperty('password') && obj.hasOwnProperty('rememberMe')) {
        return true
    }
    return true
}

// Route at http://localhost:8000/accounts/signup
// Route to create a brand new account in the database
router.post('/signup', (req, res) => {
    var JSONBody = req.body

    // Checks to see if the object passed is the correct object
    if (validAccountObject(JSONBody) == false) {
        res.send({success: false, error: {code: 1, message: 'Passed object does not meet the requirements'}})
        res.end()
        return
    }

    // Check to see if an account already has the email
    runQuery('SELECT account_id FROM accounts WHERE email=(?)', [JSONBody.email], (err, result) => {
        if (err) {
            console.error(err)
            res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
            res.end()
            return
        }

        // Turn the result into a readable object
        var queryResult = packetToJSON(result)

        // Check to see if the email exists (i.e. something was fetched)
        if (Object.keys(queryResult).length == 1) {
            res.send({success: false, error: {code: 2, message: 'Email has already been registered'}})
            res.end()
            return
        }

        // Hash the users entered password
        bcrypt.hash(JSONBody.password, 10, (err, hashedPass) => {
            // Insert the new users account into the database
            runQuery('INSERT INTO accounts VALUES (?,?,?)', [null, JSONBody.email, hashedPass], (err, result) => {
                if (err) {
                    console.error(err)
                    res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
                    res.end()
                    return
                }

                // Get the latest value inserted by the database
                runQuery('SELECT LAST_INSERT_ID()',[], (err, result) => {
                    if (err) {
                        console.error(err)
                        res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
                        res.end()
                        return
                    }
                    let res = packetToJSON(result)
                    // Add the user to the account info table
                    runQuery('INSERT INTO account_information(idaccount_information) VALUES (?)', [res['LAST_INSERT_ID()']], ()=>{})
                })

                res.send({success: true})
                res.end()
            })
        })
    })
})

// Route at http://localhost:8000/accounts/login
// Route to check a login
// Returns a token that allows for quick login
router.post('/login', (req, res) => {
    var JSONBody = req.body

    // Checks to see if the object passed is the correct object
    if (validAccountObject(JSONBody) == false) {
        res.send({success: false, error: {code: 1, message: 'Passed object does not meet the requirements'}})
        res.end()
        return
    }

    // Get the account with the associated email if it exists
    runQuery('SELECT account_id,password FROM accounts WHERE email=(?)', [JSONBody.email], (err, result) => {
        if (err) {
            res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
            res.end()
            return
        }

        // Turns the result into a readable object
        var readObject = packetToJSON(result)

        // If the email doesn't exist in the database
        if (Object.keys(readObject).length == 0) {
            res.send({success: false, error: {code: 3, message: 'Email doesn\'t exist'}})
            res.end()
            return
        }

        // Compare the inputted password and the hashed password stored in the database
        bcrypt.compare(JSONBody.password, readObject.password, (err, match) => {
            // If the passwords don't match
            if (match == false) {
                res.send({success: false, error: {code: 4, message: 'Passwords do not match'}})
                res.end()
                return
            }

            // Create a unique ID so the user can login automatically
            var cookieID = secureRandom(10).join('')
            var expiryTime = moment().add(7, 'd')
            runQuery('INSERT INTO cookies VALUES (?,?,?)', [cookieID, readObject.account_id, expiryTime.unix()], (err, result) => {
                if (err) {
                    res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
                    res.end()
                    return
                }

                res.send({success: true, loginID: cookieID, expires: expiryTime.toDate().toUTCString()})
                res.end()
            })
        })
    })
})

// Route at http://localhost:8000/accounts/tokenLogin
// Gets the associated account that a token is linked to
// Used on every page to remember login
router.post('/tokenLogin', (req, res) => {
    var JSONBody = req.body

    // Check for the required token in the cookies table
    runQuery('SELECT associatedAccountID,expiryTime from cookies WHERE cookie_id=(?)', [JSONBody.token], (err, result) => {
        if (err) {
            res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
            res.end()
            return
        }

        var readObject = packetToJSON(result)

        // Check to see if the token exists in the table
        if (readObject.length == 0) {
            res.send({success: false, error: {code: 5, message: 'Login token doesn\'t exist'}})
            res.end()
            return
        }

        // Check if the token has expired (current unix is greater then stored unix)
        if (readObject.expiryTime < moment().unix()) {
            runQuery('DELETE FROM cookies WHERE cookie_id=(?)', [JSONBody.token], (err, result) => {
                if (err) {
                    res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
                    res.end()
                    return
                }
                res.send({success: false, error: {code: 6, message: 'Login token has expired'}})
                return
            })
        }
        else {
            res.send({success: true, accountID: readObject.associatedAccountID})
            res.end()
        }
    })
})

// Route at http://localhost:8000/accounts/logout
// Logs the user out of their account by setting the
// expiry time of the cookie to 0
router.post('/logout', (req, res) => {
    let JSONBody = req.body

    runQuery('UPDATE cookies SET expiryTime=0 WHERE cookie_id=(?)', [JSONBody.token], (err, result) => {
        if (err) {
            console.log('Error: ', err)
            res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
            res.end()
            return
        }

        res.send({success: true})
        res.end()
    })
})

// Route at http://localhost:8000/accounts/deleteaccount
// Deletes a users account
router.post('/deleteaccount', (req, res) => {
    let JSONBody = req.body

    // Delete the users account information first otherwise it will error
    runQuery('DELETE FROM account_information WHERE idaccount_information=(?)', [JSONBody.id], (err, result) => {
        if (err) {
            console.log('Error: ', err)
            res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
            res.end()
            return
        }

        runQuery('DELETE FROM cookies WHERE associatedAccountID=(?)', [JSONBody.id], (err, result) => {
            if (err) {
                console.log('Error: ', err)
                res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
                res.end()
                return
            }

            // Delete the users account
            runQuery('DELETE FROM accounts WHERE account_id=(?)', [JSONBody.id], (err, result) => {
                if (err) {
                    console.log('Error: ', err)
                    res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
                    res.end()
                    return
                }
        
                res.send({success: true})
                res.end()
            })
        })
    })
})

export default router