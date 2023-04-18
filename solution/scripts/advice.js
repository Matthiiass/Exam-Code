// Function that runs whenever an article is clicked
// Redirects the user to the article page with a parameter in the header of the id
function clickListener(event) {
    let target = event.target

    // If the user doesn't click on the div directly
    if (!target.hasAttribute('id')) {
        target = target.parentElement
    }

    window.location.href = 'articles.html?article=' + target.id
}

// Loads every article when the page first loads
async function loadDefaultArticles() {
    let articles = await getData('http://localhost:8000/articles/allarticles')
    
    // Loop through all the articles and create + append it to the grid
    let articleTemp = document.querySelector('.template-article')
    let articleCont = document.querySelector('.articles')
    articles.forEach(element => {
        let newArticle = articleTemp.cloneNode(true)
        newArticle.classList.remove('template-article')

        newArticle.querySelector('.article-img').style.backgroundImage = `url('../images/ref${element.img_reference}.png')`
        newArticle.querySelector('h2').innerText = element.name
        newArticle.id = `article${element.article_id}`

        newArticle.addEventListener('click', clickListener)

        articleCont.append(newArticle)
    })
}

// Replaces all articles with the ones that match the search term
// when it changes
// If search is empty, loads all articles
async function searchArticles() {
    let searchText = document.querySelector('.search-bar').value
    let searchData;
    if (searchText == "" ) {
        searchData = await getData(`http://localhost:8000/articles/allarticles`)
    }
    else {
        searchData = await getData(`http://localhost:8000/articles/searchname/${searchText}`)
    }

    // Remove all the content inside the article container
    // aside from the template
    let articleCont = document.querySelector('.articles')
    while (articleCont.children.length > 1) {
        articleCont.children[1].remove()
    }
    
    let articleTemp = document.querySelector('.template-article')
    searchData.forEach(element => {
        let newArticle = articleTemp.cloneNode(true)
        newArticle.classList.remove('template-article')

        newArticle.querySelector('.article-img').style.backgroundImage = `url('../images/ref${element.img_reference}.png')`
        newArticle.querySelector('h2').innerText = element.name
        newArticle.id = `article${element.article_id}`

        newArticle.addEventListener('click', clickListener)

        articleCont.append(newArticle)
    })
}