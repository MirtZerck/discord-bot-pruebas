export async function obtenerMeme(){
    const url = 'https://api.imgflip.com/get_memes'
    const respuesta = await fetch(url)
    const data = await respuesta.json();
    console.log(data);
    return data;
} 
