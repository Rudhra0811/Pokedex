const API_BASE_URL = 'https://pokeapi.co/api/v2';
const pokemonList = document.getElementById('pokemon-list');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const typeFilter = document.getElementById('type-filter');
const modal = document.getElementById('pokemon-modal');
const modalContent = modal.querySelector('.modal-content');
const modalClose = document.getElementsByClassName('close')[0];
const pokemonDetails = document.getElementById('pokemon-details');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

let currentPage = 1;
const itemsPerPage = 20;
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

async function fetchPokemonSpecies(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/pokemon-species/${id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Pokemon species:', error);
    }
}

async function fetchEvolutionChain(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching evolution chain:', error);
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

function createPokemonCard(pokemon, index) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.style.animationDelay = `${index * 50}ms`;
    card.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h3>${pokemon.name}</h3>
        <p>ID: ${pokemon.id}</p>
        <div class="type-container">
            ${pokemon.types.map(type => createTypeLabel(type.type.name)).join('')}
        </div>
    `;
    card.addEventListener('click', () => showPokemonDetails(pokemon));
    return card;
}

async function showPokemonDetails(pokemon) {
    const species = await fetchPokemonSpecies(pokemon.id);
    const evolutionChain = await fetchEvolutionChain(species.evolution_chain.url);

    const header = pokemonDetails.querySelector('.pokemon-header');
    header.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <div>
            <h2>${pokemon.name}</h2>
            <div class="type-container">
                ${pokemon.types.map(type => createTypeLabel(type.type.name)).join('')}
            </div>
        </div>
    `;

    const basicInfo = document.getElementById('basic-info');
    basicInfo.innerHTML = `
        <div class="pokemon-info">
            <p><strong>Height:</strong> ${pokemon.height / 10}m</p>
            <p><strong>Weight:</strong> ${pokemon.weight / 10}kg</p>
            <p><strong>Base Experience:</strong> ${pokemon.base_experience}</p>
            <p><strong>Abilities:</strong> ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}</p>
        </div>
    `;

    const stats = document.getElementById('stats');
    stats.innerHTML = `
        <h3>Base Stats</h3>
        <div class="pokemon-info">
            ${pokemon.stats.map(stat => `
                <p><strong>${stat.stat.name}:</strong> ${stat.base_stat}</p>
            `).join('')}
        </div>
    `;

    const moves = document.getElementById('moves');
    moves.innerHTML = `
        <h3>Moves</h3>
        <ul>
            ${pokemon.moves.slice(0, 10).map(move => `
                <li>${move.move.name}</li>
            `).join('')}
        </ul>
        <p>Showing 10 out of ${pokemon.moves.length} moves</p>
    `;

    const evolution = document.getElementById('evolution');
    evolution.innerHTML = `
        <h3>Evolution Chain</h3>
        <div class="evolution-chain">
            ${await getEvolutionChainHtml(evolutionChain.chain)}
        </div>
    `;

    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    document.querySelector('.tab-button[data-tab="basic-info"]').click();
}

async function getEvolutionChainHtml(chain) {
    let html = '';
    const pokemon = await fetchPokemonDetails(`${API_BASE_URL}/pokemon/${chain.species.name}`);
    html += `
        <div class="evolution-stage">
            <img src="${pokemon.sprites.front_default}" alt="${chain.species.name}">
            <p>${chain.species.name}</p>
        </div>
    `;
    if (chain.evolves_to.length > 0) {
        html += '<div class="evolution-arrow">→</div>';
        html += await getEvolutionChainHtml(chain.evolves_to[0]);
    }
    return html;
}

function displayPokemonList(page) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pokemonsToDisplay = filteredPokemon.slice(startIndex, endIndex);

    pokemonList.innerHTML = '';

    pokemonsToDisplay.forEach((pokemon, index) => {
        const card = createPokemonCard(pokemon, index);
        pokemonList.appendChild(card);
    });

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

function initializeTypeFilter() {
    fetchPokemonTypes().then(types => {
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type.name;
            option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1);
            typeFilter.appendChild(option);
        });
    });
}

function handleTabClick(event) {
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    event.target.classList.add('active');
    const tabId = event.target.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');
}

searchButton.addEventListener('click', filterPokemon);
searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        filterPokemon();
    }
});

typeFilter.addEventListener('change', filterPokemon);

modalClose.addEventListener('click', () => {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
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

document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', handleTabClick);
});

async function initializePokedex() {
    const pokemonList = await fetchAllPokemon();
    allPokemon = await Promise.all(pokemonList.map(pokemon => fetchPokemonDetails(pokemon.url)));
    filteredPokemon = [...allPokemon];
    initializeTypeFilter();
    displayPokemonList(currentPage);
}

function createTypeLabel(type) {
    return `<span class="type-label ${type}">${type}</span>`;
}

// Initialize the Pokedex
initializePokedex();