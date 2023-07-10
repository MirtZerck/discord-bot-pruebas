export async function obtenerDatoCurioso() {
  const url = "https://catfact.ninja/fact";
  const respuesta = await fetch(url);
  const data = await respuesta.json();
  return data.fact;
}
