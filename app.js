// Fetching data from the Pokémon API
const fetchPokemonData = async (pokemonName) => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
  }
};

// Example usage
const pokemonName = 'pikachu';
fetchPokemonData(pokemonName)
  .then(pokemonData => {
    console.log(`Name: ${pokemonData.name}`);
    console.log(`ID: ${pokemonData.id}`);
    console.log(`Types: ${pokemonData.types.map(type => type.type.name).join(', ')}`);
    console.log(`Height: ${pokemonData.height}`);
    console.log(`Weight: ${pokemonData.weight}`);
  })
  .catch(error => console.error('Error:', error));