export async function obtenerMeme(){
    const url = 'https://api.imgflip.com/get_memes'
    const respuesta = await fetch(url)
    const data = await respuesta.json();
    return data.data.memes[0];
} 
