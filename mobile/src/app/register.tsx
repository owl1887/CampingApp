import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { router } from 'expo-router';

export default function RegisterScreen() {
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
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Lozinka"
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => {
          // Registraciju povezujemo sa API-jem kasnije
        }}
      >
        <Text style={styles.registerButtonText}>
          REGISTRACIJA
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
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