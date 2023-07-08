export async function obtenerMeme(){
    const url = 'https://ronreiter-meme-generator.p.rapidapi.com/meme'
    const respuesta = await fetch(url)
    const data = await respuesta.json();
    return data.fact;
} 
