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