import AsyncStorage from '@react-native-async-storage/async-storage';

import { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

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

    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* LOGO */}

        <View style={styles.logoContainer}>

          <View style={styles.logoCircle}>

            <Ionicons
              name="bonfire-outline"
              size={42}
              color="#81C784"
            />

          </View>

        </View>


        {/* NASLOV */}

        <Text style={styles.title}>
          CampingApp
        </Text>


        <Text style={styles.subtitle}>
          Dobro došli nazad!
        </Text>


        <Text style={styles.description}>
          Prijavite se na svoj račun kako biste
          mogli upravljati svojim rezervacijama.
        </Text>


        {/* EMAIL */}

        <View style={styles.inputContainer}>

          <Ionicons
            name="mail-outline"
            size={21}
            color="#81C784"
            style={styles.inputIcon}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#757575"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

        </View>


        {/* LOZINKA */}

        <View style={styles.inputContainer}>

          <Ionicons
            name="lock-closed-outline"
            size={21}
            color="#81C784"
            style={styles.inputIcon}
          />

          <TextInput
            style={styles.input}
            placeholder="Lozinka"
            placeholderTextColor="#757575"
            secureTextEntry
            value={lozinka}
            onChangeText={setLozinka}
          />

        </View>


        {/* PRIJAVA */}

        <TouchableOpacity
          style={[
            styles.loginButton,
            loading && styles.loginButtonDisabled,
          ]}
          onPress={prijava}
          disabled={loading}
          activeOpacity={0.8}
        >

          {loading ? (

            <>

              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text style={styles.loginButtonText}>
                PRIJAVA...
              </Text>

            </>

          ) : (

            <>

              <Ionicons
                name="log-in-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.loginButtonText}>
                PRIJAVA
              </Text>

            </>

          )}

        </TouchableOpacity>


        {/* REGISTRACIJA */}

        <View style={styles.registerContainer}>

          <Text style={styles.registerQuestion}>
            Nemate račun?
          </Text>


          <TouchableOpacity
            onPress={() =>
              router.push('/register')
            }
            activeOpacity={0.7}
          >

            <Text style={styles.registerText}>
              Registrujte se
            </Text>

          </TouchableOpacity>

        </View>

      </ScrollView>

    </KeyboardAvoidingView>

  );

}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 40,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },

  logoCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#1B3320',
    borderWidth: 1,
    borderColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#81C784',
    textAlign: 'center',
    marginBottom: 10,
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },

  inputContainer: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 12,
    marginBottom: 14,
  },

  inputIcon: {
    marginLeft: 15,
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 16,
    paddingRight: 15,
  },

  loginButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    gap: 9,
  },

  loginButtonDisabled: {
    backgroundColor: '#1B3320',
  },

  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  registerQuestion: {
    fontSize: 15,
    color: '#9E9E9E',
  },

  registerText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#81C784',
    marginLeft: 5,
  },

});