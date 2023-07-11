export async function obtenerMichiHablador(commandBody) {
  let commandBodyCodificado = encodeURIComponent(commandBody);
  const url = `https://cataas.com/cat/says/${commandBodyCodificado}?json=true`;
  const respuesta = await fetch(url);
  const data = await respuesta.json();
  return `https://cataas.com${data.url}`;
}
