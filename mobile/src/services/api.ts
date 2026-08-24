const API_URL = 'http://10.0.2.2:3000/api';

import { handleUnauthorized } from '@/services/auth';


async function obradiResponse(
  response: Response
) {

  if (response.status === 401) {

    await handleUnauthorized();

    throw new Error(
      'Sesija je istekla. Molimo prijavite se ponovo.'
    );

  }


  const data = await response.json();

  if (!response.ok) {

    throw new Error(
      data.error ||
      `HTTP greška: ${response.status}`
    );

  }

  return data;

}


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

export async function createReservation(
  kamp_id: number,
  datum_prijave: string,
  datum_odjave: string,
  token: string
) {
  try {
    const response = await fetch(
      `${API_URL}/rezervacije`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },

        body: JSON.stringify({
          kamp_id,
          datum_prijave,
          datum_odjave,
        }),
      }
    );

   return await obradiResponse(response);

  } catch (error) {

    console.error(
      'Greška createReservation:',
      error
    );

    throw error;
  }
}

export async function getMojeRezervacije(token: string) {
  try {
    const response = await fetch(
      `${API_URL}/rezervacije/moje`,
      {
        method: 'GET',

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        'Greška pri učitavanju rezervacija.'
      );
    }

    return data;

  } catch (error) {

    console.error(
      'Greška getMojeRezervacije:',
      error
    );

    throw error;
  }
}

export async function cancelReservation(
  rezervacijaId: string,
  token: string
) {
  try {

    const response = await fetch(
      `${API_URL}/rezervacije/${rezervacijaId}`,
      {
        method: 'DELETE',

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        'Greška pri otkazivanju rezervacije.'
      );
    }

    return data;

  } catch (error) {

    console.error(
      'Greška cancelReservation:',
      error
    );

    throw error;
  }
}

export async function getWishlist(token: string) {
  try {
    const response = await fetch(
      `${API_URL}/wishlist`,
      {
        method: 'GET',

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        'Greška pri učitavanju liste želja.'
      );
    }

    return data;

  } catch (error) {

    console.error(
      'Greška getWishlist:',
      error
    );

    throw error;
  }
}

export async function addToWishlist(
  kampId: number,
  token: string
) {
  try {

    const response = await fetch(
      `${API_URL}/wishlist/${kampId}`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        'Greška pri dodavanju u listu želja.'
      );
    }

    return data;

  } catch (error) {

    console.error(
      'Greška addToWishlist:',
      error
    );

    throw error;
  }
}

export async function removeFromWishlist(
  kampId: number,
  token: string
) {
  try {

    const response = await fetch(
      `${API_URL}/wishlist/${kampId}`,
      {
        method: 'DELETE',

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        'Greška pri uklanjanju iz liste želja.'
      );
    }

    return data;

  } catch (error) {

    console.error(
      'Greška removeFromWishlist:',
      error
    );

    throw error;
  }
}

export async function deactivateProfile(token: string) {
  try {
    const response = await fetch(
      `${API_URL}/auth/profile`,
      {
        method: 'DELETE',

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        'Nije moguće deaktivirati korisnički profil.'
      );
    }

    return data;

  } catch (error) {

    console.error(
      'Greška deactivateProfile:',
      error
    );

    throw error;
  }
}

export async function registerUser(
  ime_prezime: string,
  email: string,
  lozinka: string
) {
  try {

    const response = await fetch(
      `${API_URL}/auth/register`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          ime_prezime,
          email,
          lozinka,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        'Greška pri registraciji.'
      );
    }

    return data;

  } catch (error) {

    console.error(
      'Greška registerUser:',
      error
    );

    throw error;
  }
}


export async function getProfile(token: string) {
  try {

    const response = await fetch(
      `${API_URL}/auth/profile`,
      {
        method: 'GET',

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return await obradiResponse(response);

  } catch (error) {

    console.error(
      'Greška getProfile:',
      error
    );

    throw error;
  }
}

export async function getReservationById(
  rezervacijaId: string,
  token: string
) {
  try {

    const response = await fetch(
      `${API_URL}/rezervacije/${rezervacijaId}`,
      {
        method: 'GET',

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        'Nije moguće učitati detalje rezervacije.'
      );
    }

    return data;

  } catch (error) {

    console.error(
      'Greška getReservationById:',
      error
    );

    throw error;
  }
}

export async function createCamp(
  kamp: {
    naziv: string;
    opis: string;
    cijena_po_noci: number;
    karakteristike: {
      wifi: boolean;
      struja: boolean;
      parking: boolean;
    };
    latitude: number | null;
    longitude: number | null;
  },
  token: string
) {

  try {

    const response = await fetch(
      `${API_URL}/kampovi`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },

        body: JSON.stringify(kamp),
      }
    );


    return await obradiResponse(response);


  } catch (error) {

    console.error(
      'Greška createCamp:',
      error
    );

    throw error;

  }
}
export async function updateCamp(
  id: number,
  podaci: {
    naziv: string;
    opis: string;
    cijena_po_noci: number;
    karakteristike: {
      wifi: boolean;
      struja: boolean;
      parking: boolean;
    };
    latitude: number | null;
    longitude: number | null;
  },
  token: string
) {

  try {

    const response = await fetch(
      `${API_URL}/kampovi/${id}`,
      {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },

        body: JSON.stringify(podaci),
      }
    );


    return await obradiResponse(response);


  } catch (error) {

    console.error(
      'Greška updateCamp:',
      error
    );

    throw error;

  }

}
export async function deleteCamp(
  id: number,
  token: string
) {
  try {

    const response = await fetch(
      `${API_URL}/kampovi/${id}`,
      {
        method: 'DELETE',

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return await obradiResponse(response);

  } catch (error) {

    console.error(
      'Greška deleteCamp:',
      error
    );

    throw error;
  }
}
export async function getAllReservations(
  token: string
) {
  try {

    const response = await fetch(
      `${API_URL}/rezervacije/admin/sve`,
      {
        method: 'GET',

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        'Greška pri učitavanju svih rezervacija.'
      );
    }

    return data;

  } catch (error) {

    console.error(
      'Greška getAllReservations:',
      error
    );

    throw error;
  }
}
export async function updateReservationStatus(
  rezervacijaId: number,
  status: string,
  token: string
) {
  try {

    const response = await fetch(
      `${API_URL}/rezervacije/admin/${rezervacijaId}/status`,
      {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },

        body: JSON.stringify({
          status,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        'Greška pri promjeni statusa rezervacije.'
      );
    }

    return data;

  } catch (error) {

    console.error(
      'Greška updateReservationStatus:',
      error
    );

    throw error;
  }
}