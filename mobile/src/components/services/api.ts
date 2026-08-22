const API_URL = 'http://10.0.2.2:3000/api';

export async function getKampovi() {

  try {

    console.log('Šaljem zahtjev na:', `${API_URL}/kampovi`);

    const response = await fetch(
      `${API_URL}/kampovi`
    );

    console.log('HTTP status:', response.status);

    const text = await response.text();

    console.log('Odgovor servera:', text);

    if (!response.ok) {
      throw new Error(
        `HTTP greška: ${response.status}`
      );
    }

    return JSON.parse(text);

  } catch (error) {

    console.error(
      'Greška u getKampovi():',
      error
    );

    throw error;
  }
}