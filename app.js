const API_BASE_URL = 'https://pokeapi.co/api/v2';
const pokemonList = document.getElementById('pokemon-list');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const typeFilter = document.getElementById('type-filter');
const modal = document.getElementById('pokemon-modal');
const modalClose = document.getElementsByClassName('close')[0];
const pokemonDetails = document.getElementById('pokemon-details');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

let currentPage = 1;
const itemsPerPage = 20;
let totalPokemon = 0;
let allPokemon = [];
let filteredPokemon = [];

async function fetchAllPokemon() {
    try {
        const response = await fetch(`${API_BASE_URL}/pokemon?limit=1000`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching all Pokemon:', error);
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

async function fetchPokemonTypes() {
    try {
        const response = await fetch(`${API_BASE_URL}/type`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching Pokemon types:', error);
    }
}

function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h3>${pokemon.name}</h3>
        <p>ID: ${pokemon.id}</p>
        <p>Types: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
    `;
    card.addEventListener('click', () => showPokemonDetails(pokemon));
    return card;
}

function showPokemonDetails(pokemon) {
    pokemonDetails.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h2>${pokemon.name}</h2>
        <div class="pokemon-info">
            <p><strong>Height:</strong> ${pokemon.height / 10}m</p>
            <p><strong>Weight:</strong> ${pokemon.weight / 10}kg</p>
            <p><strong>Base Experience:</strong> ${pokemon.base_experience}</p>
            <p><strong>Types:</strong> ${pokemon.types.map(type => type.type.name).join(', ')}</p>
            <p><strong>Abilities:</strong> ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}</p>
            <p><strong>Base Stats:</strong></p>
        </div>
        <div class="pokemon-stats">
            ${pokemon.stats.map(stat => `
                <p>${stat.stat.name}: ${stat.base_stat}</p>
            `).join('')}
        </div>
    `;
    modal.style.display = 'block';
}

function displayPokemonList(page) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pokemonsToDisplay = filteredPokemon.slice(startIndex, endIndex);

    pokemonList.innerHTML = '';
    
    for (const pokemon of pokemonsToDisplay) {
        const card = createPokemonCard(pokemon);
        pokemonList.appendChild(card);
    }

    updatePaginationButtons();
    updatePageInfo();
}

function updatePaginationButtons() {
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === Math.ceil(filteredPokemon.length / itemsPerPage);
}

function updatePageInfo() {
    const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function filterPokemon() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value.toLowerCase();

    filteredPokemon = allPokemon.filter(pokemon => {
        const nameMatch = pokemon.name.toLowerCase().includes(searchTerm);
        const typeMatch = selectedType === '' || pokemon.types.some(type => type.type.name.toLowerCase() === selectedType);
        return nameMatch && typeMatch;
    });

    currentPage = 1;
    displayPokemonList(currentPage);
}

async function initializeTypeFilter() {
    const types = await fetchPokemonTypes();
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.name;
        option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1);
        typeFilter.appendChild(option);
    });
}

searchButton.addEventListener('click', filterPokemon);
searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        filterPokemon();
    }
});

typeFilter.addEventListener('change', filterPokemon);

modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayPokemonList(currentPage);
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < Math.ceil(filteredPokemon.length / itemsPerPage)) {
        currentPage++;
        displayPokemonList(currentPage);
    }
});

async function initializePokedex() {
    const pokemonList = await fetchAllPokemon();
    allPokemon = await Promise.all(pokemonList.map(pokemon => fetchPokemonDetails(pokemon.url)));
    filteredPokemon = [...allPokemon];
    await initializeTypeFilter();
    displayPokemonList(currentPage);
}

// Initialize the Pokedex
initializePokedex();