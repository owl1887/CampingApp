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
          Kreirajte račun
        </Text>


        <Text style={styles.description}>
          Registrujte se kako biste mogli
          rezervisati kampove i dodatnu opremu.
        </Text>


        {/* IME I PREZIME */}

        <View style={styles.inputContainer}>

          <Ionicons
            name="person-outline"
            size={21}
            color="#81C784"
            style={styles.inputIcon}
          />

          <TextInput
            style={styles.input}
            placeholder="Ime i prezime"
            placeholderTextColor="#757575"
            value={imePrezime}
            onChangeText={setImePrezime}
            autoCapitalize="words"
          />

        </View>


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


        {/* REGISTRACIJA */}

        <TouchableOpacity
          style={[
            styles.registerButton,
            loading &&
              styles.registerButtonDisabled,
          ]}
          onPress={registracija}
          disabled={loading}
          activeOpacity={0.8}
        >

          {loading ? (

            <>

              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.registerButtonText
                }
              >
                REGISTRACIJA...
              </Text>

            </>

          ) : (

            <>

              <Ionicons
                name="person-add-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.registerButtonText
                }
              >
                REGISTRACIJA
              </Text>

            </>

          )}

        </TouchableOpacity>


        {/* PRIJAVA */}

        <View style={styles.loginContainer}>

          <Text style={styles.loginQuestion}>
            Već imate račun?
          </Text>


          <TouchableOpacity
            onPress={() => router.back()}
            disabled={loading}
            activeOpacity={0.7}
          >

            <Text style={styles.loginText}>
              Prijavite se
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

  registerButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    gap: 9,
  },

  registerButtonDisabled: {
    backgroundColor: '#1B3320',
  },

  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  loginQuestion: {
    fontSize: 15,
    color: '#9E9E9E',
  },

  loginText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#81C784',
    marginLeft: 5,
  },

});