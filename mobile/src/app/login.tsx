import AsyncStorage from '@react-native-async-storage/async-storage';

import { useState } from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

const API_URL = 'http://10.0.2.2:3000/api';

export default function LoginScreen() {

  const [email, setEmail] = useState('');
  const [lozinka, setLozinka] = useState('');
  const [loading, setLoading] = useState(false);


  async function prijava() {

    if (!email || !lozinka) {

      Alert.alert(
        'Greška',
        'Unesite email i lozinku.'
      );

      return;
    }


    try {

      setLoading(true);


      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            email: email,
            lozinka: lozinka,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ||
          'Prijava nije uspjela.'
        );

      }


      // Čuvanje JWT tokena
      await AsyncStorage.setItem(
        'token',
        data.token
      );


      // Čuvanje podataka o korisniku
      await AsyncStorage.setItem(
        'korisnik',
        JSON.stringify(data.korisnik)
      );


      Alert.alert(
        'Uspješna prijava',
        `Dobrodošli, ${data.korisnik.ime_prezime}!`
      );


      // Prelazak na početnu stranicu
      router.replace('/(tabs)');


    } catch (error: any) {

      console.error(
        'Greška pri prijavi:',
        error
      );


      Alert.alert(
        'Greška',
        error.message ||
        'Nije moguće izvršiti prijavu.'
      );


    } finally {

      setLoading(false);

    }

  }


  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        CampingApp
      </Text>


      <Text style={styles.subtitle}>
        Prijava
      </Text>


      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />


      <TextInput
        style={styles.input}
        placeholder="Lozinka"
        secureTextEntry
        value={lozinka}
        onChangeText={setLozinka}
      />


      <TouchableOpacity
        style={styles.loginButton}
        onPress={prijava}
        disabled={loading}
      >

        <Text style={styles.loginButtonText}>
          {loading
            ? 'PRIJAVA...'
            : 'PRIJAVA'}
        </Text>

      </TouchableOpacity>


      <TouchableOpacity
        onPress={() => router.push('/register')}
      >

        <Text style={styles.registerText}>
          Nemate račun? Registrujte se
        </Text>

      </TouchableOpacity>

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
  },

  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 40,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },

  loginButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  registerText: {
    textAlign: 'center',
    marginTop: 25,
    fontSize: 16,
  },

});