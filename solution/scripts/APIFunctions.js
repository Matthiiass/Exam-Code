// Function that gets data from the local API (database)
async function getData(url) {
    var data = await fetch(url, {'credentials': 'include'})
    return data.json()
}

// Function that gets data from external API
// (Needs different formatting as its not a cross-origin request)
async function getDataExternal(url) {
    var data = await fetch(url)
    return data.json()
}

// Function that posts data to the local API (database)
async function postData(url, object) {
    var post = await fetch(url, {
        'method': 'POST',
        'credentials': 'include',
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify(object)
    })
    return post.json()
}