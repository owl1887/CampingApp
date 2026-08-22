import AsyncStorage from '@react-native-async-storage/async-storage';


export async function getToken() {

  return await AsyncStorage.getItem('token');

}


export async function removeToken() {

  await AsyncStorage.removeItem('token');

}


export async function logout() {

  await AsyncStorage.multiRemove([
    'token',
    'korisnik',
  ]);

}


/*
 * Provjerava da li je JWT token istekao.
 *
 * JWT se sastoji od tri dijela:
 *
 * header.payload.signature
 *
 * U payload dijelu se nalazi "exp"
 * koji predstavlja vrijeme isteka tokena.
 */

export function isTokenExpired(
  token: string
): boolean {

  try {

    const dijelovi =
      token.split('.');

    if (dijelovi.length !== 3) {

      return true;

    }


    const payload =
      JSON.parse(
        atob(dijelovi[1])
      );


    if (!payload.exp) {

      return true;

    }


    const trenutnoVrijeme =
      Math.floor(
        Date.now() / 1000
      );


    return payload.exp < trenutnoVrijeme;

  } catch (error) {

    console.error(
      'Greška pri provjeri tokena:',
      error
    );

    return true;

  }

}


/*
 * Provjera trenutnog tokena.
 *
 * Ako token ne postoji ili je istekao,
 * korisnik se odjavljuje.
 */

export async function isAuthenticated(): Promise<boolean> {

  const token =
    await getToken();


  if (!token) {

    return false;

  }


  if (isTokenExpired(token)) {

    await logout();

    return false;

  }


  return true;

}

export async function handleUnauthorized() {

  await logout();

}