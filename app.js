const form = document.querySelector('#form')
const searchInput = document.querySelector('#search')
const songsContainer = document.querySelector('#songs-container')
const prevAndNextContainer = document.querySelector('#prev-and-next-container')

const apiURL = 'https://api.lyrics.ovh'

const fetchData = async url => {
    const response = await fetch(url)
    return await response.json()
}

const getMoreSongs = async url => {
    // https://cors-anywhere.herokuapp -> eh para resolver o problema do cors
    const responseBody = await fetchData(`https://cors-anywhere.herokuapp.com/${url}`)
    insertSongsIntoPage(responseBody)
}

const insertNextAndPrevButtons = ({ prev, next }) => {
    prevAndNextContainer.innerHTML = `
        ${prev ? `<button class="btn" onClick="getMoreSongs('${prev}')">Anteriores</button>`: ''}
        ${next ? `<button class="btn" onClick="getMoreSongs('${next}')">Próximas</button>`: ''}
    `
}

const insertSongsIntoPage = songsInfo => {

    /* Perceba que dentro do botao eu estou gerando minhas propriedades */
    songsContainer.innerHTML = songsInfo.data.map(song => `
        <li class="song">
            <span class="song-artist"><strong>${song.artist.name}</strong> - ${song.title}</span>
            <button class="btn" data-artist="${song.artist.name}" data-song-title="${song.title}">Ver letra</button>
        </li>`
    ).join('\n')

    // verificando se as propriedades abaixo existem
    if (songsInfo.prev || songsInfo.next) {
        insertNextAndPrevButtons(songsInfo)
        return
    }

    prevAndNextContainer.innerHTML = ''
}

const fetchSongs = async term => {
    const responseBody = await fetchData(`${apiURL}/suggest/${term}`)
    insertSongsIntoPage(responseBody)        
}

const handleFormSubmit = event => {
    event.preventDefault() // para impedir que o form seja enviado, assim a pag nao eh atualizada
    
    const searchTerm = searchInput.value.trim()
    searchInput.value = '' // limpa o input
    searchInput.focus() // faz o cursor voltar para o input
    if (!searchTerm) {
        songsContainer.innerHTML = `<li class="warning-message">Digite uma busca válida!</li>`
        return
    }

    fetchSongs(searchTerm)
}
form.addEventListener('submit', handleFormSubmit)

const insertLyricsIntoPage = ({ lyrics, artist, songTitle }) => {
    songsContainer.innerHTML = `
        <li class="lyrics-container">
            <h2><strong>${songTitle}</strong> - ${artist}</h2>
            <p class="lyrics">${lyrics}</p>
        </li>
    `
}

const fetchLyrics = async (artist, songTitle) => {
    
    const responseBody = await fetchData(`${apiURL}/v1/${artist}/${songTitle}`)
    const lyrics = responseBody.lyrics.replace(/(\r\n|\r|\n)/g, '<br>')
    // \r\n -> carriage return seguido de fim da linha
    // \r -> carriage return
    // \n -> fim da linha
    insertLyricsIntoPage({ lyrics, artist, songTitle })
}

/* dá pra pegar os eventos de click nos botões por aqui.Veja
que eh mais performatico, pq so existe uma UL. Assim nao precisamos
adicionar uma funcao em cada botao 
- Ha uma propriedade target que diz se o evento veio do botao, do span,
etc. Ou seja, da pra saber onde que o usuario apertou o botao
*/
const handleSongsContainerClick = event => {
    
    const clickedElement = event.target // pegando a referencia
    if (clickedElement.tagName === 'BUTTON') {

        const artist = clickedElement.getAttribute('data-artist') // atributo definido por mim
        const songTitle = clickedElement.getAttribute('data-song-title') // atributo definido por mim

        prevAndNextContainer.innerHTML = '' // preciso tirar os botoes de Anteriores e Proximo
        fetchLyrics(artist, songTitle)
    }
}
songsContainer.addEventListener('click', handleSongsContainerClick)