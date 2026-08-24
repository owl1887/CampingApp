import { useState } from 'react';

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { createCamp } from '@/services/api';


export default function AddCampScreen() {

  const [naziv, setNaziv] = useState('');
  const [opis, setOpis] = useState('');
  const [cijena, setCijena] = useState('');

  const [wifi, setWifi] = useState(false);
  const [struja, setStruja] = useState(false);
  const [parking, setParking] = useState(false);

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [loading, setLoading] = useState(false);


  async function dodajKamp() {

    if (!naziv.trim() || !cijena.trim()) {

      Alert.alert(
        'Greška',
        'Naziv i cijena su obavezni.'
      );

      return;
    }


    const cijenaBroj =
      Number(cijena.replace(',', '.'));


    if (
      Number.isNaN(cijenaBroj) ||
      cijenaBroj <= 0
    ) {

      Alert.alert(
        'Greška',
        'Unesite ispravnu cijenu.'
      );

      return;
    }


    let latitudeBroj: number | null = null;
    let longitudeBroj: number | null = null;


    if (latitude.trim()) {

      latitudeBroj =
        Number(latitude.replace(',', '.'));

      if (Number.isNaN(latitudeBroj)) {

        Alert.alert(
          'Greška',
          'Latitude nije ispravan.'
        );

        return;
      }
    }


    if (longitude.trim()) {

      longitudeBroj =
        Number(longitude.replace(',', '.'));

      if (Number.isNaN(longitudeBroj)) {

        Alert.alert(
          'Greška',
          'Longitude nije ispravan.'
        );

        return;
      }
    }


    try {

      setLoading(true);


      const token =
        await AsyncStorage.getItem('token');


      if (!token) {

        Alert.alert(
          'Niste prijavljeni',
          'Morate se prijaviti.'
        );

        router.replace('/login');

        return;
      }


      await createCamp(
        {
          naziv: naziv.trim(),
          opis: opis.trim(),
          cijena_po_noci: cijenaBroj,

          karakteristike: {
            wifi,
            struja,
            parking,
          },

          latitude: latitudeBroj,
          longitude: longitudeBroj,
        },
        token
      );


      Alert.alert(
        'Uspješno',
        'Kamp mjesto je uspješno dodano.',
        [
          {
            text: 'U redu',
            onPress: () =>
              router.replace('/admin'),
          },
        ]
      );


    } catch (error: any) {

      Alert.alert(
        'Greška',
        error.message ||
        'Nije moguće dodati kamp.'
      );

    } finally {

      setLoading(false);

    }
  }


  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >

      <Text style={styles.title}>
        Dodaj kamp
      </Text>


      <Text style={styles.label}>
        Naziv *
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Naziv kampa"
        value={naziv}
        onChangeText={setNaziv}
      />


      <Text style={styles.label}>
        Opis
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.textArea,
        ]}
        placeholder="Opis kampa"
        value={opis}
        onChangeText={setOpis}
        multiline
      />


      <Text style={styles.label}>
        Cijena po noći (KM) *
      </Text>

      <TextInput
        style={styles.input}
        placeholder="npr. 25"
        value={cijena}
        onChangeText={setCijena}
        keyboardType="decimal-pad"
      />


      <Text style={styles.sectionTitle}>
        Karakteristike
      </Text>


      <TouchableOpacity
        style={styles.option}
        onPress={() => setWifi(!wifi)}
      >

        <Text style={styles.optionText}>
          {wifi ? '☑' : '☐'} WiFi
        </Text>

      </TouchableOpacity>


      <TouchableOpacity
        style={styles.option}
        onPress={() => setStruja(!struja)}
      >

        <Text style={styles.optionText}>
          {struja ? '☑' : '☐'} Struja
        </Text>

      </TouchableOpacity>


      <TouchableOpacity
        style={styles.option}
        onPress={() => setParking(!parking)}
      >

        <Text style={styles.optionText}>
          {parking ? '☑' : '☐'} Parking
        </Text>

      </TouchableOpacity>


      <Text style={styles.sectionTitle}>
        Lokacija
      </Text>


      <Text style={styles.label}>
        Latitude
      </Text>

      <TextInput
        style={styles.input}
        placeholder="npr. 44.123456"
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numbers-and-punctuation"
      />


      <Text style={styles.label}>
        Longitude
      </Text>

      <TextInput
        style={styles.input}
        placeholder="npr. 19.123456"
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numbers-and-punctuation"
      />


      <TouchableOpacity
        style={styles.button}
        onPress={dodajKamp}
        disabled={loading}
      >

        <Text style={styles.buttonText}>
          {loading
            ? 'Dodavanje...'
            : 'Dodaj kamp'}
        </Text>

      </TouchableOpacity>


      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={loading}
      >

        <Text style={styles.cancelText}>
          Odustani
        </Text>

      </TouchableOpacity>

    </ScrollView>

  );

}


const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 25,
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 13,
    fontSize: 16,
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 10,
  },

  option: {
    paddingVertical: 10,
  },

  optionText: {
    fontSize: 17,
  },

  button: {
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },

  buttonText: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  cancelButton: {
    marginTop: 12,
    padding: 15,
    alignItems: 'center',
  },

  cancelText: {
    fontSize: 16,
  },

});