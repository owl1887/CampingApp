import { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { registerUser } from '@/services/api';


export default function RegisterScreen() {

  const [imePrezime, setImePrezime] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [lozinka, setLozinka] =
    useState('');

  const [loading, setLoading] =
    useState(false);


  async function registracija() {

    if (
      !imePrezime.trim() ||
      !email.trim() ||
      !lozinka
    ) {

      Alert.alert(
        'Greška',
        'Ime, email i lozinka su obavezni.'
      );

      return;
    }


    try {

      setLoading(true);


      const rezultat =
        await registerUser(
          imePrezime.trim(),
          email.trim(),
          lozinka
        );


      Alert.alert(
        'Registracija uspješna',
        rezultat.message ||
        'Korisnik je uspješno registrovan.',
        [
          {
            text: 'U redu',
            onPress: () =>
              router.replace('/login'),
          },
        ]
      );


    } catch (error: any) {

      Alert.alert(
        'Greška',
        error.message ||
        'Registracija nije uspjela.'
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
        Registracija
      </Text>


      <TextInput
        style={styles.input}
        placeholder="Ime i prezime"
        value={imePrezime}
        onChangeText={setImePrezime}
        autoCapitalize="words"
      />


      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
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
        style={styles.registerButton}
        onPress={registracija}
        disabled={loading}
      >

        {loading ? (

          <ActivityIndicator size="small" />

        ) : (

          <Text style={styles.registerButtonText}>
            REGISTRACIJA
          </Text>

        )}

      </TouchableOpacity>


      <TouchableOpacity
        onPress={() => router.back()}
        disabled={loading}
      >

        <Text style={styles.loginText}>
          Već imate račun? Prijavite se
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

  registerButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  loginText: {
    textAlign: 'center',
    marginTop: 25,
    fontSize: 16,
  },

});