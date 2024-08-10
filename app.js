const API_BASE_URL = 'https://pokeapi.co/api/v2';
const pokemonList = document.getElementById('pokemon-list');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

async function fetchPokemonList(limit = 20, offset = 0) {
    try {
        const response = await fetch(`${API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching Pokemon list:', error);
    }
}

async function fetchPokemonDetails(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Pokemon details:', error);
    }
}

function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h3>${pokemon.name}</h3>
        <p>ID: ${pokemon.id}</p>
    `;
    return card;
}

async function displayPokemonList() {
    const pokemons = await fetchPokemonList();
    pokemonList.innerHTML = '';
    
    for (const pokemon of pokemons) {
        const details = await fetchPokemonDetails(pokemon.url);
        const card = createPokemonCard(details);
        pokemonList.appendChild(card);
    }
}

function searchPokemon() {
    const searchTerm = searchInput.value.toLowerCase();
    const pokemonCards = pokemonList.getElementsByClassName('pokemon-card');
    
    for (const card of pokemonCards) {
        const name = card.querySelector('h3').textContent.toLowerCase();
        if (name.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    }
}

searchButton.addEventListener('click', searchPokemon);
searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        searchPokemon();
    }
});

// Initial Pokemon list display
displayPokemonList();