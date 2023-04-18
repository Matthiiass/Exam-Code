async function getArticle() {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('article')
    if (!id) {
        window.location.href = 'advice.html'
    }

    articleInfo = await getData('http://localhost:8000/articles/getarticle/'+id.slice(7))
    if (articleInfo.length == 0) {
        window.location.href = 'advice.html'
    }
    const articleInformation = articleInfo[0]

    const container = document.querySelector('.article-container')
    container.querySelector('.article-img').querySelector('img').src = `../images/ref${articleInformation.img_reference}.png`
    container.querySelector('h1').innerText = articleInformation.name

    let date = new Date(articleInformation.date_published * 1000)
    container.querySelector('h4').innerText = `Uploaded on: ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} at ${date.getHours()}:${date.getSeconds()}`

    container.querySelector('p').innerHTML = articleInformation.content
}