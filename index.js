import express from "express"
import cors from "cors"
import { bootDB } from "./db/databaseHandler.js"

import accountsRoute from "./routes/accountsRoute.js"
import accountDataRoute from "./routes/accountData.js"
import locationRoute from "./routes/location.js"
import articleRoute from "./routes/articles.js"

// Start the database
bootDB()

// Create the app
var app = express()

// Allow for passing of JSON in the body
// Allow for cross-origin requests
// Link route handling files to app
app.use(express.json())
app.use(cors({'credentials': true, 'origin': true}))
app.use('/accounts', accountsRoute)
app.use('/accountdata', accountDataRoute)
app.use('/locations', locationRoute)
app.use('/articles', articleRoute)

// Start the app on localhost:8000
app.listen(8000, () => {
    console.log('App is running on port 8000')
})