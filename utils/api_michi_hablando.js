export async function obtenerMichiHablador(commandBody){
    const url = `https://cataas.com/cat/says/${commandBody}?json=true`
    const respuesta = await fetch(url)
    const data = await respuesta.json();
    return `https://cataas.com${data.url}`;
    
} 