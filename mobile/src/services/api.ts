const API_URL = 'http://10.0.2.2:3000/api';

export async function getKampovi() {
  const response = await fetch(`${API_URL}/kampovi`);

  if (!response.ok) {
    throw new Error('Greška pri dohvaćanju kamp mjesta.');
  }

  return await response.json();
}