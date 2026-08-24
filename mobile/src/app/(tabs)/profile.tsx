import { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router, useFocusEffect } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { logout } from '@/services/auth';
import {
  deactivateProfile,
  getProfile,
} from '@/services/api';


type Korisnik = {
  id: number;
  ime_prezime: string;
  email: string;
  uloga: string;
};


export default function ProfileScreen() {

  const [korisnik, setKorisnik] =
    useState<Korisnik | null>(null);

  const [loading, setLoading] =
    useState(true);


  async function ucitajKorisnika() {

  try {

    const token =
      await AsyncStorage.getItem('token');

    if (!token) {

      setKorisnik(null);

      return;
    }


    const data =
      await getProfile(token);


    setKorisnik(
      data.korisnik
    );


  } catch (error) {

    console.error(
      'Greška pri učitavanju profila:',
      error
    );

    setKorisnik(null);

  } finally {

    setLoading(false);

  }
}


  useFocusEffect(
    useCallback(() => {

      ucitajKorisnika();

    }, [])
  );


  async function odjava() {

    await logout();

    setKorisnik(null);

    Alert.alert(
      'Odjava',
      'Uspješno ste odjavljeni.'
    );

  }

  async function deaktivirajProfil() {

  Alert.alert(
    'Deaktivacija računa',
    'Da li ste sigurni da želite deaktivirati svoj račun?',
    [
      {
        text: 'Odustani',
        style: 'cancel',
      },

      {
        text: 'Deaktiviraj',
        style: 'destructive',

        onPress: async () => {

          try {

            const token =
              await AsyncStorage.getItem('token');

            if (!token) {

              Alert.alert(
                'Greška',
                'Niste prijavljeni.'
              );

              return;
            }


            await deactivateProfile(token);


            // Brišemo podatke prijavljenog korisnika
            await logout();


            setKorisnik(null);


            Alert.alert(
              'Račun deaktiviran',
              'Vaš korisnički račun je uspješno deaktiviran.'
            );


            router.replace('/login');

          } catch (error: any) {

            Alert.alert(
              'Greška',
              error.message ||
              'Nije moguće deaktivirati račun.'
            );

          }

        },
      },
    ]
  );
}


  if (loading) {

    return (
      <View style={styles.container}>

        <ActivityIndicator size="large" />

      </View>
    );

  }


  if (!korisnik) {

    return (
      <View style={styles.container}>

        <Text style={styles.title}>
          Moj profil
        </Text>


        <Text style={styles.message}>
          Niste prijavljeni.
        </Text>


        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.push('/login')
          }
        >

          <Text style={styles.buttonText}>
            PRIJAVA
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            router.push('/register')
          }
        >

          <Text style={styles.secondaryButtonText}>
            REGISTRACIJA
          </Text>

        </TouchableOpacity>

        

      </View>
    );

  }


  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Moj profil
      </Text>


      <View style={styles.profileInfo}>

        <Text style={styles.name}>
          {korisnik.ime_prezime}
        </Text>


        <Text style={styles.info}>
          {korisnik.email}
        </Text>


        <Text style={styles.info}>
          Uloga: {korisnik.uloga}
        </Text>

      </View>

      {korisnik.uloga === 'admin' && (
  <TouchableOpacity
    style={styles.adminButton}
    onPress={() => router.push('/admin')}
  >
    <Text style={styles.adminButtonText}>
      ADMIN PANEL
    </Text>
  </TouchableOpacity>
)}


      <TouchableOpacity
        style={styles.button}
        onPress={odjava}
      >

        <Text style={styles.buttonText}>
          ODJAVA
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
  style={styles.deleteButton}
  onPress={deaktivirajProfil}
>
  <Text style={styles.deleteButtonText}>
    DEAKTIVIRAJ RAČUN
  </Text>
</TouchableOpacity>

    </View>
  );
}


const styles = StyleSheet.create({

  adminButton: {
  width: '80%',
  height: 50,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 10,
  borderWidth: 1,
},

adminButtonText: {
  fontSize: 16,
  fontWeight: 'bold',
},

  deleteButton: {
  width: '80%',
  height: 50,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 20,
  borderWidth: 1,
},

deleteButtonText: {
  fontSize: 16,
  fontWeight: 'bold',
},

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },

  message: {
    fontSize: 18,
    marginBottom: 25,
  },

  profileInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },

  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  info: {
    fontSize: 16,
    marginBottom: 5,
  },

  button: {
    width: '80%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  secondaryButton: {
    width: '80%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },

  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

});