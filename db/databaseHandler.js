import mysql from "mysql"

let connection;

// Handles starting a connection with the database and connecting to it
// Called when the application first starts
export function bootDB() {
    connection = mysql.createConnection({
        'host': 'localhost',
        'user': 'root',
        'password': 'Fareham141',
        'database': 'health'
    })

    connectDB()
}

// Function to connect to the database
// Called when first connecting and if the database disconnects for whatever reason
function connectDB() {
    connection.connect((err) => {
        if (err) {
            console.error('Error when connecting: ', err)
            connectDB()
        }
        else {
            console.log('Successfully connected to database: health')
        }
    })
}

// Runs a SQL statement on the database
// Returns either the content on an error if it happens
export async function runQuery(query, objects, callback) {
    try {
        return connection.query(query, objects, callback)
    }
    catch (err) {
        console.error('Error when executing SQL statement: ', err)
        return null
    }
}

// Function to convert query results into json so that they
// can be properly read
export function packetToJSON(packet) {
    var jsonObj =  JSON.parse(JSON.stringify(packet))
    if (jsonObj.length == 1) {
        return jsonObj[0]
    }
    return jsonObj
}