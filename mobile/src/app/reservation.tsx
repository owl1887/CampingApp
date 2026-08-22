import { getToken } from '@/services/auth';
import ProtectedScreen from '@/components/protected-screen';


import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { createReservation } from '@/services/api';

export default function ReservationScreen() {

  const { kampId } = useLocalSearchParams();
  const router = useRouter();

  const [datumPrijave, setDatumPrijave] = useState('');
  const [datumOdjave, setDatumOdjave] = useState('');

  const [loading, setLoading] = useState(false);

  async function potvrdiRezervaciju() {

    if (!datumPrijave || !datumOdjave) {

      Alert.alert(
        'Greška',
        'Unesite datum prijave i datum odjave.'
      );

      return;
    }

    const datumRegex = /^\d{4}-\d{2}-\d{2}$/;

if (
  !datumRegex.test(datumPrijave) ||
  !datumRegex.test(datumOdjave)
) {
  Alert.alert(
    'Greška',
    'Datum mora biti u formatu YYYY-MM-DD.'
  );

  return;
}

const prijava = new Date(`${datumPrijave}T00:00:00`);
const odjava = new Date(`${datumOdjave}T00:00:00`);

if (
  Number.isNaN(prijava.getTime()) ||
  Number.isNaN(odjava.getTime())
) {
  Alert.alert(
    'Greška',
    'Uneseni datum nije ispravan.'
  );

  return;
}

const danas = new Date();
danas.setHours(0, 0, 0, 0);

if (prijava < danas) {
  Alert.alert(
    'Greška',
    'Datum prijave ne može biti u prošlosti.'
  );

  return;
}

if (odjava <= prijava) {
  Alert.alert(
    'Greška',
    'Datum odjave mora biti nakon datuma prijave.'
  );

  return;
}

    /*
     * Privremeno uzimamo token iz AsyncStorage-a.
     *
     * Ako još nemamo AsyncStorage,
     * dodat ćemo ga u sljedećem koraku.
     */

    const token = await getToken();

if (!token) {
  Alert.alert(
    'Niste prijavljeni',
    'Morate se prijaviti prije rezervacije.'
  );

  router.push('/login');
  

  return;
}

    try {

      setLoading(true);

      const rezultat = await createReservation(
        Number(kampId),
        datumPrijave,
        datumOdjave,
        token
      );

      Alert.alert(
        'Uspješna rezervacija',
        rezultat.message ||
          'Rezervacija je uspješno kreirana.'
      );

      router.replace('/(tabs)/reservations');

    } catch (error: any) {

      Alert.alert(
        'Greška',
        error.message ||
          'Nije moguće napraviti rezervaciju.'
      );

    } finally {

      setLoading(false);

    }
  }


  return (
  <ProtectedScreen>

    <View style={styles.container}>

      <Text style={styles.title}>
        Rezervacija
      </Text>

      <Text style={styles.label}>
        Kamp ID
      </Text>

      <Text style={styles.value}>
        {kampId}
      </Text>

      <Text style={styles.label}>
        Datum prijave
      </Text>

      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={datumPrijave}
        onChangeText={setDatumPrijave}
      />

      <Text style={styles.label}>
        Datum odjave
      </Text>

      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={datumOdjave}
        onChangeText={setDatumOdjave}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={potvrdiRezervaciju}
        disabled={loading}
      >

        <Text style={styles.buttonText}>
          {loading
            ? 'Slanje...'
            : 'Potvrdi rezervaciju'}
        </Text>

      </TouchableOpacity>

    </View>

  </ProtectedScreen>
);}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },

  value: {
    fontSize: 18,
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },

  button: {
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

});