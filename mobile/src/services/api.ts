const API_URL = 'http://10.0.2.2:3000/api';

export async function getKampovi() {
  try {
    console.log(
      'Šaljem zahtjev:',
      `${API_URL}/kampovi`
    );

    const response = await fetch(
      `${API_URL}/kampovi`
    );

    console.log(
      'HTTP status:',
      response.status
    );

    if (!response.ok) {
      throw new Error(
        `HTTP greška: ${response.status}`
      );
    }

    const data = await response.json();

    console.log(
      'Kampovi:',
      data
    );

    return data;

  } catch (error) {

    console.error(
      'Greška getKampovi:',
      error
    );

    throw error;
  }
}

export async function getKampById(id: number) {
  try {
    const response = await fetch(
      `${API_URL}/kampovi/${id}`
    );

    if (!response.ok) {
      throw new Error(
        `HTTP greška: ${response.status}`
      );
    }

    return await response.json();

  } catch (error) {

    console.error(
      'Greška getKampById:',
      error
    );

    throw error;
  }
}