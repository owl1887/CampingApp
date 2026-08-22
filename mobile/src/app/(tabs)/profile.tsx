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

      const korisnikPodaci =
        await AsyncStorage.getItem('korisnik');


      if (token && korisnikPodaci) {

        setKorisnik(
          JSON.parse(korisnikPodaci)
        );

      } else {

        setKorisnik(null);

      }

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


      <TouchableOpacity
        style={styles.button}
        onPress={odjava}
      >

        <Text style={styles.buttonText}>
          ODJAVA
        </Text>

      </TouchableOpacity>

    </View>
  );
}


const styles = StyleSheet.create({

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