import express from "express";
import { runQuery, packetToJSON } from "../db/databaseHandler.js";

let router = express.Router()

// Route at http://localhost:8000/accountdata/defaultlocation
// Fetches the location data for the users default location
router.post('/defaultlocation',(req, res) => {
    let JSONBody = req.body

    runQuery('SELECT default_location_id FROM account_information WHERE idaccount_information=(?)', [JSONBody.accountID], (err, result) => {
            if (err) {
                res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
                res.end()
                return
            }

            result = packetToJSON(result)

            // If the user has no default location
            if (result.default_location_id == 0) {
                res.send({ID: 0, name: null, long: null, lat: null})
                res.end()
                return
            }

            runQuery('SELECT name,lon,lat FROM locations WHERE location_id=(?)', [result.default_location_id], (err, result2) => {
                if (err) {
                    res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
                    res.end()
                    return
                }

                result2 = packetToJSON(result2)

                res.send({ID: result.default_location_id, name: result2.name, long: result2.lon, lat: result2.lat})
                res.end()
                return
            })
        }
    )
})

// Route at http://localhost:8000/accountdata/updatedefaultlocation
// Route that updates the users default location
router.post('/updatedefaultlocation', (req, res) => {
    const JSONBody = req.body

    runQuery('UPDATE account_information SET default_location_id=(?) WHERE idaccount_information=(?)', [JSONBody.location, JSONBody.id], (err, result) => {
        if (err) {
            console.error('Error: ', err)
            res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
            res.end()
            return
        }

        res.send({success: true})
        res.end()
    })
})

// Route at http://localhost:8000/accountdata/getuseremail/[id]
// Gets the users email from their account ID
router.get('/getuseremail/:id', (req, res) => {
    const id = req.params.id

    runQuery('SELECT email FROM accounts WHERE account_id=(?)', [id], (err, result) => {
        if (err) {
            console.error('Error: ', err)
            res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
            res.end()
            return
        }

        res.send({success: true, email: packetToJSON(result).email})
        res.end()
    })
})

export default router