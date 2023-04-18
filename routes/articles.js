import express from 'express'
import {runQuery, packetToJSON} from '../db/databaseHandler.js'

let router = express.Router()

// Route at http://localhost:8000/articles/allarticles
// Gets all the articles stored in the database
router.get('/allarticles', (req, res) => {
    runQuery('SELECT article_id,name,img_reference FROM articles ORDER BY date_published DESC', [], (err, result) => {
        if (err) {
            console.log('Error: ', err)
            res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
            res.end()
            return
        }

        res.send(result)
        res.end()
    })
})

// Route at http://localhost:8000/articles/searchname/[term]
// Gets all the articles stored in the database that contain [term]
// somewhere in them
router.get('/searchname/:term', (req, res) => {
    const term = "%"+req.params.term+"%"
    runQuery("SELECT article_id,name,img_reference FROM articles WHERE name LIKE ? ORDER BY date_published DESC", [term], (err, result) => {
        if (err) {
            console.log('Error: ', err)
            res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
            res.end()
            return
        }

        res.send(result)
        res.end()
    })
})

// Route at http://localhost:8000/articles/getarticle/[id]
// Fetch the information and content of a specific article
router.get('/getarticle/:id', (req, res) => {
    const id = req.params.id
    runQuery("SELECT name,img_reference,date_published,content FROM articles WHERE article_id=(?)", [id], (err, result) => {
        if (err) {
            console.log('Error: ', err)
            res.send({success: false, error: {code: 0, message: 'Error when executing SQL statement'}})
            res.end()
            return
        }

        res.send(result)
        res.end()
    })
})

export default router