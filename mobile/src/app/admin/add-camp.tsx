
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

import { router } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Ionicons } from '@expo/vector-icons';

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

    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <View style={styles.headerIcon}>
            <Ionicons
              name="add-circle-outline"
              size={30}
              color="#81C784"
            />
          </View>

          <View style={styles.headerTextContainer}>

            <Text style={styles.title}>
              Dodaj kamp
            </Text>

            <Text style={styles.subtitle}>
              Unesite podatke o novom kamp mjestu.
            </Text>

          </View>

        </View>


        {/* OSNOVNI PODACI */}

        <View style={styles.sectionHeader}>

          <View style={styles.sectionIcon}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#81C784"
            />
          </View>

          <Text style={styles.sectionTitle}>
            Osnovni podaci
          </Text>

        </View>


        <Text style={styles.label}>
          Naziv *
        </Text>

        <View style={styles.inputContainer}>

          <Ionicons
            name="bonfire-outline"
            size={20}
            color="#81C784"
            style={styles.inputIcon}
          />

          <TextInput
            style={styles.input}
            placeholder="Naziv kampa"
            placeholderTextColor="#757575"
            value={naziv}
            onChangeText={setNaziv}
          />

        </View>


        <Text style={styles.label}>
          Opis
        </Text>

        <View
          style={[
            styles.inputContainer,
            styles.textAreaContainer,
          ]}
        >

          <Ionicons
            name="document-text-outline"
            size={20}
            color="#81C784"
            style={[
              styles.inputIcon,
              styles.textAreaIcon,
            ]}
          />

          <TextInput
            style={[
              styles.input,
              styles.textArea,
            ]}
            placeholder="Opišite kamp..."
            placeholderTextColor="#757575"
            value={opis}
            onChangeText={setOpis}
            multiline
          />

        </View>


        <Text style={styles.label}>
          Cijena po noći *
        </Text>

        <View style={styles.inputContainer}>

          <Ionicons
            name="pricetag-outline"
            size={20}
            color="#81C784"
            style={styles.inputIcon}
          />

          <TextInput
            style={styles.input}
            placeholder="npr. 25"
            placeholderTextColor="#757575"
            value={cijena}
            onChangeText={setCijena}
            keyboardType="decimal-pad"
          />

          <Text style={styles.unit}>
            KM
          </Text>

        </View>


        {/* KARAKTERISTIKE */}

        <View style={styles.sectionHeader}>

          <View style={styles.sectionIcon}>
            <Ionicons
              name="sparkles-outline"
              size={22}
              color="#81C784"
            />
          </View>

          <Text style={styles.sectionTitle}>
            Karakteristike
          </Text>

        </View>


        <Text style={styles.sectionDescription}>
          Odaberite sadržaje koje kamp nudi.
        </Text>


        <TouchableOpacity
          style={[
            styles.option,
            wifi && styles.optionActive,
          ]}
          onPress={() => setWifi(!wifi)}
          activeOpacity={0.8}
        >

          <View
            style={[
              styles.optionIcon,
              wifi && styles.optionIconActive,
            ]}
          >

            <Ionicons
              name="wifi-outline"
              size={22}
              color={
                wifi
                  ? '#FFFFFF'
                  : '#81C784'
              }
            />

          </View>

          <View style={styles.optionContent}>

            <Text style={styles.optionTitle}>
              WiFi
            </Text>

            <Text style={styles.optionDescription}>
              Dostupan bežični internet
            </Text>

          </View>

          <Ionicons
            name={
              wifi
                ? 'checkmark-circle'
                : 'ellipse-outline'
            }
            size={25}
            color={
              wifi
                ? '#81C784'
                : '#757575'
            }
          />

        </TouchableOpacity>


        <TouchableOpacity
          style={[
            styles.option,
            struja && styles.optionActive,
          ]}
          onPress={() => setStruja(!struja)}
          activeOpacity={0.8}
        >

          <View
            style={[
              styles.optionIcon,
              struja && styles.optionIconActive,
            ]}
          >

            <Ionicons
              name="flash-outline"
              size={22}
              color={
                struja
                  ? '#FFFFFF'
                  : '#81C784'
              }
            />

          </View>

          <View style={styles.optionContent}>

            <Text style={styles.optionTitle}>
              Struja
            </Text>

            <Text style={styles.optionDescription}>
              Priključak na električnu energiju
            </Text>

          </View>

          <Ionicons
            name={
              struja
                ? 'checkmark-circle'
                : 'ellipse-outline'
            }
            size={25}
            color={
              struja
                ? '#81C784'
                : '#757575'
            }
          />

        </TouchableOpacity>


        <TouchableOpacity
          style={[
            styles.option,
            parking && styles.optionActive,
          ]}
          onPress={() => setParking(!parking)}
          activeOpacity={0.8}
        >

          <View
            style={[
              styles.optionIcon,
              parking && styles.optionIconActive,
            ]}
          >

            <Ionicons
              name="car-outline"
              size={22}
              color={
                parking
                  ? '#FFFFFF'
                  : '#81C784'
              }
            />

          </View>

          <View style={styles.optionContent}>

            <Text style={styles.optionTitle}>
              Parking
            </Text>

            <Text style={styles.optionDescription}>
              Obezbijeđen prostor za vozila
            </Text>

          </View>

          <Ionicons
            name={
              parking
                ? 'checkmark-circle'
                : 'ellipse-outline'
            }
            size={25}
            color={
              parking
                ? '#81C784'
                : '#757575'
            }
          />

        </TouchableOpacity>


        {/* LOKACIJA */}

        <View style={styles.sectionHeader}>

          <View style={styles.sectionIcon}>
            <Ionicons
              name="location-outline"
              size={22}
              color="#81C784"
            />
          </View>

          <Text style={styles.sectionTitle}>
            Lokacija
          </Text>

        </View>


        <Text style={styles.sectionDescription}>
          Koordinate nisu obavezne, ali omogućavaju prikaz
          kampa na mapi.
        </Text>


        <Text style={styles.label}>
          Latitude
        </Text>

        <View style={styles.inputContainer}>

          <Ionicons
            name="navigate-outline"
            size={20}
            color="#81C784"
            style={styles.inputIcon}
          />

          <TextInput
            style={styles.input}
            placeholder="npr. 44.123456"
            placeholderTextColor="#757575"
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numbers-and-punctuation"
          />

        </View>


        <Text style={styles.label}>
          Longitude
        </Text>

        <View style={styles.inputContainer}>

          <Ionicons
            name="navigate-outline"
            size={20}
            color="#81C784"
            style={styles.inputIcon}
          />

          <TextInput
            style={styles.input}
            placeholder="npr. 19.123456"
            placeholderTextColor="#757575"
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numbers-and-punctuation"
          />

        </View>


        {/* DUGMAD */}

        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.buttonDisabled,
          ]}
          onPress={dodajKamp}
          disabled={loading}
          activeOpacity={0.8}
        >

          {loading ? (

            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />

          ) : (

            <Ionicons
              name="add-circle-outline"
              size={21}
              color="#FFFFFF"
            />

          )}

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
          activeOpacity={0.8}
        >

          <Ionicons
            name="arrow-back-outline"
            size={19}
            color="#BDBDBD"
          />

          <Text style={styles.cancelText}>
            Odustani
          </Text>

        </TouchableOpacity>

      </ScrollView>

    </KeyboardAvoidingView>

  );

}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 50,
  },


  // HEADER

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#1B3320',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#9E9E9E',
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },


  // SECTION

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },

  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#1B3320',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

  sectionDescription: {
    color: '#9E9E9E',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },


  // INPUTS

  label: {
    color: '#BDBDBD',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 7,
    marginTop: 13,
  },

  inputContainer: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 12,
  },

  inputIcon: {
    marginLeft: 14,
    marginRight: 10,
  },

  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 13,
    paddingRight: 14,
  },

  unit: {
    color: '#81C784',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 15,
  },

  textAreaContainer: {
    alignItems: 'flex-start',
    minHeight: 120,
  },

  textAreaIcon: {
    marginTop: 15,
  },

  textArea: {
    minHeight: 118,
    textAlignVertical: 'top',
  },


  // OPTIONS

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
  },

  optionActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#18251A',
  },

  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  optionIconActive: {
    backgroundColor: '#2E7D32',
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  optionDescription: {
    color: '#9E9E9E',
    fontSize: 12,
    marginTop: 3,
  },


  // BUTTONS

  button: {
    marginTop: 30,
    minHeight: 54,
    borderRadius: 13,
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  cancelButton: {
    marginTop: 12,
    minHeight: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#2C2C2C',
    backgroundColor: '#1E1E1E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  cancelText: {
    color: '#BDBDBD',
    fontSize: 16,
    fontWeight: '600',
  },

});

