import express from 'express'
import { runQuery, packetToJSON } from "../db/databaseHandler.js";

let router = express.Router()

// Route at http://localhost:8000/locations/locationnames
// Route that fetches all the locations in the database with their associated IDs
router.get('/locationnames', (req, res) => {
    runQuery('SELECT location_id,name FROM locations', [], (err, result) => {
        if (err) {
            console.error('Error: ', err)
            res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
            res.end()
            return
        }
        res.send({success: true, data: result})
        res.end()
    })
})

// Route at http://localhost:8000/locations/locationcordsbyid/[id]
// Route that fetches the coordinates of a location by passing through its ID
router.get('/locationcordsbyid/:id', (req, res) => {
    let id = req.params.id
    runQuery('SELECT lat, lon FROM locations WHERE location_id=(?)', [id], (err, result) => {
        if (err) {
            console.error('Error: ', err)
            res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
            res.end()
            return
        }
        res.send({success: true, data: result[0]})
        res.end()
    })
})

export default router