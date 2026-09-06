import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import {
  getKampById,
  updateCamp,
} from '@/services/api';

import { getToken } from '@/services/auth';


type Karakteristike = {
  wifi: boolean;
  struja: boolean;
  parking: boolean;
  rostilj: boolean;
  vanjska_kuhinja: boolean;
  kajak: boolean;
  camac: boolean;
  bicikl: boolean;
};


export default function EditCampScreen() {

  const { id } = useLocalSearchParams();
  const router = useRouter();


  const [naziv, setNaziv] = useState('');
  const [opis, setOpis] = useState('');
  const [cijena, setCijena] = useState('');

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');


  const [karakteristike, setKarakteristike] =
    useState<Karakteristike>({
      wifi: false,
      struja: false,
      parking: false,
      rostilj: false,
      vanjska_kuhinja: false,
      kajak: false,
      camac: false,
      bicikl: false,
    });


  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  /*
   * Učitavanje postojećeg kampa
   */

  useEffect(() => {

    async function ucitajKamp() {

      try {

        const kampId = Number(id);


        if (!kampId) {

          Alert.alert(
            'Greška',
            'ID kampa nije ispravan.'
          );

          router.back();

          return;
        }


        const kamp =
          await getKampById(kampId);


        setNaziv(
          kamp.naziv || ''
        );


        setOpis(
          kamp.opis || ''
        );


        setCijena(
          kamp.cijena_po_noci !== undefined &&
          kamp.cijena_po_noci !== null
            ? String(kamp.cijena_po_noci)
            : ''
        );


        setLatitude(
          kamp.latitude !== undefined &&
          kamp.latitude !== null
            ? String(kamp.latitude)
            : ''
        );


        setLongitude(
          kamp.longitude !== undefined &&
          kamp.longitude !== null
            ? String(kamp.longitude)
            : ''
        );


        setKarakteristike({

          wifi:
            kamp.karakteristike?.wifi === true,

          struja:
            kamp.karakteristike?.struja === true,

          parking:
            kamp.karakteristike?.parking === true,

          rostilj:
            kamp.karakteristike?.rostilj === true,

          vanjska_kuhinja:
            kamp.karakteristike?.vanjska_kuhinja === true,

          kajak:
            kamp.karakteristike?.kajak === true,

          camac:
            kamp.karakteristike?.camac === true,

          bicikl:
            kamp.karakteristike?.bicikl === true,

        });


      } catch (error: any) {

        console.error(
          'Greška pri učitavanju kampa:',
          error
        );


        Alert.alert(
          'Greška',
          error.message ||
          'Nije moguće učitati podatke o kampu.'
        );


        router.back();


      } finally {

        setLoading(false);

      }

    }


    ucitajKamp();

  }, [id]);


  /*
   * Promjena karakteristike
   */

  function promijeniKarakteristiku(
    nazivKarakteristike: keyof Karakteristike,
    vrijednost: boolean
  ) {

    setKarakteristike(
      prethodne => ({
        ...prethodne,
        [nazivKarakteristike]:
          vrijednost,
      })
    );

  }


  /*
   * Spremanje izmjena
   */

  async function sacuvajIzmjene() {

    if (!naziv.trim()) {

      Alert.alert(
        'Greška',
        'Naziv kampa je obavezan.'
      );

      return;
    }


    if (!cijena.trim()) {

      Alert.alert(
        'Greška',
        'Cijena po noći je obavezna.'
      );

      return;
    }


    const cijenaBroj =
      Number(
        cijena.replace(',', '.')
      );


    if (
      Number.isNaN(cijenaBroj) ||
      cijenaBroj < 0
    ) {

      Alert.alert(
        'Greška',
        'Cijena mora biti ispravan broj.'
      );

      return;
    }


    let latitudeBroj: number | null = null;
    let longitudeBroj: number | null = null;


    if (latitude.trim() !== '') {

      latitudeBroj =
        Number(
          latitude.replace(',', '.')
        );


      if (
        Number.isNaN(latitudeBroj) ||
        latitudeBroj < -90 ||
        latitudeBroj > 90
      ) {

        Alert.alert(
          'Greška',
          'Latitude mora biti između -90 i 90.'
        );

        return;
      }

    }


    if (longitude.trim() !== '') {

      longitudeBroj =
        Number(
          longitude.replace(',', '.')
        );


      if (
        Number.isNaN(longitudeBroj) ||
        longitudeBroj < -180 ||
        longitudeBroj > 180
      ) {

        Alert.alert(
          'Greška',
          'Longitude mora biti između -180 i 180.'
        );

        return;
      }

    }


    try {

      setSaving(true);


      const token =
        await getToken();


      if (!token) {

        Alert.alert(
          'Niste prijavljeni',
          'Morate se prijaviti.'
        );


        router.replace('/login');

        return;
      }


      await updateCamp(
        Number(id),
        {
          naziv: naziv.trim(),

          opis: opis.trim(),

          cijena_po_noci:
            cijenaBroj,

          karakteristike,

          latitude:
            latitudeBroj,

          longitude:
            longitudeBroj,

        },
        token
      );


      Alert.alert(
        'Uspješno',
        'Kamp mjesto je uspješno izmijenjeno.',
        [
          {
            text: 'OK',

            onPress: () => {
              router.replace('/admin');
            },

          },
        ]
      );


    } catch (error: any) {

      console.error(
        'Greška pri izmjeni kampa:',
        error
      );


      Alert.alert(
        'Greška',
        error.message ||
        'Nije moguće izmijeniti kamp.'
      );


    } finally {

      setSaving(false);

    }

  }


  /*
   * Loading ekran
   */

  if (loading) {

    return (

      <View style={styles.center}>

        <ActivityIndicator
          size="large"
          color="#81C784"
        />

        <Text style={styles.loadingText}>
          Učitavanje kampa...
        </Text>

      </View>

    );

  }


  return (

    <View style={styles.container}>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <View style={styles.headerIcon}>

            <Ionicons
              name="create-outline"
              size={30}
              color="#81C784"
            />

          </View>

          <View style={styles.headerTextContainer}>

            <Text style={styles.title}>
              Uredi kamp
            </Text>

            <Text style={styles.subtitle}>
              Izmijenite podatke i karakteristike kampa
            </Text>

          </View>

        </View>


        {/* OSNOVNI PODACI */}

        <View style={styles.section}>

          <View style={styles.sectionHeader}>

            <View style={styles.sectionIcon}>

              <Ionicons
                name="information-circle-outline"
                size={21}
                color="#81C784"
              />

            </View>

            <Text style={styles.sectionTitle}>
              Osnovni podaci
            </Text>

          </View>


          <Text style={styles.label}>
            Naziv kampa
          </Text>

          <View style={styles.inputContainer}>

            <Ionicons
              name="bonfire-outline"
              size={19}
              color="#757575"
            />

            <TextInput
              style={styles.input}
              value={naziv}
              onChangeText={setNaziv}
              placeholder="Naziv kampa"
              placeholderTextColor="#666666"
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
              size={19}
              color="#757575"
              style={styles.textAreaIcon}
            />

            <TextInput
              style={[
                styles.input,
                styles.textArea,
              ]}
              value={opis}
              onChangeText={setOpis}
              placeholder="Opis kampa"
              placeholderTextColor="#666666"
              multiline
              numberOfLines={5}
            />

          </View>


          <Text style={styles.label}>
            Cijena po noći
          </Text>

          <View style={styles.inputContainer}>

            <Ionicons
              name="pricetag-outline"
              size={19}
              color="#757575"
            />

            <TextInput
              style={styles.input}
              value={cijena}
              onChangeText={setCijena}
              placeholder="npr. 35"
              placeholderTextColor="#666666"
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputSuffix}>
              KM
            </Text>

          </View>

        </View>


        {/* OSNOVNE KARAKTERISTIKE */}

        <View style={styles.section}>

          <View style={styles.sectionHeader}>

            <View style={styles.sectionIcon}>

              <Ionicons
                name="layers-outline"
                size={21}
                color="#81C784"
              />

            </View>

            <View>

              <Text style={styles.sectionTitle}>
                Osnovne karakteristike
              </Text>

              <Text style={styles.sectionDescription}>
                Odaberite dostupne pogodnosti
              </Text>

            </View>

          </View>


          <View style={styles.featureCard}>

            <View style={styles.featureLeft}>

              <View style={styles.featureIcon}>

                <Ionicons
                  name="wifi-outline"
                  size={21}
                  color="#81C784"
                />

              </View>

              <View>

                <Text style={styles.featureTitle}>
                  WiFi
                </Text>

                <Text style={styles.featureDescription}>
                  Dostupan internet
                </Text>

              </View>

            </View>

            <Switch
              value={karakteristike.wifi}
              onValueChange={(vrijednost) =>
                promijeniKarakteristiku(
                  'wifi',
                  vrijednost
                )
              }
              trackColor={{
                false: '#3A3A3A',
                true: '#2E7D32',
              }}
              thumbColor={
                karakteristike.wifi
                  ? '#81C784'
                  : '#BDBDBD'
              }
            />

          </View>


          <View style={styles.featureCard}>

            <View style={styles.featureLeft}>

              <View style={styles.featureIcon}>

                <Ionicons
                  name="flash-outline"
                  size={21}
                  color="#81C784"
                />

              </View>

              <View>

                <Text style={styles.featureTitle}>
                  Struja
                </Text>

                <Text style={styles.featureDescription}>
                  Priključak na električnu energiju
                </Text>

              </View>

            </View>

            <Switch
              value={karakteristike.struja}
              onValueChange={(vrijednost) =>
                promijeniKarakteristiku(
                  'struja',
                  vrijednost
                )
              }
              trackColor={{
                false: '#3A3A3A',
                true: '#2E7D32',
              }}
              thumbColor={
                karakteristike.struja
                  ? '#81C784'
                  : '#BDBDBD'
              }
            />

          </View>


          <View style={styles.featureCard}>

            <View style={styles.featureLeft}>

              <View style={styles.featureIcon}>

                <Ionicons
                  name="car-outline"
                  size={21}
                  color="#81C784"
                />

              </View>

              <View>

                <Text style={styles.featureTitle}>
                  Parking
                </Text>

                <Text style={styles.featureDescription}>
                  Parking mjesto
                </Text>

              </View>

            </View>

            <Switch
              value={karakteristike.parking}
              onValueChange={(vrijednost) =>
                promijeniKarakteristiku(
                  'parking',
                  vrijednost
                )
              }
              trackColor={{
                false: '#3A3A3A',
                true: '#2E7D32',
              }}
              thumbColor={
                karakteristike.parking
                  ? '#81C784'
                  : '#BDBDBD'
              }
            />

          </View>

        </View>


        {/* DODATNE POGODNOSTI */}

        <View style={styles.section}>

          <View style={styles.sectionHeader}>

            <View style={styles.sectionIcon}>

              <Ionicons
                name="sparkles-outline"
                size={21}
                color="#81C784"
              />

            </View>

            <Text style={styles.sectionTitle}>
              Dodatne pogodnosti
            </Text>

          </View>


          <View style={styles.featureCard}>

            <View style={styles.featureLeft}>

              <View style={styles.featureIcon}>

                <Ionicons
                  name="flame-outline"
                  size={21}
                  color="#81C784"
                />

              </View>

              <Text style={styles.featureTitle}>
                Roštilj
              </Text>

            </View>

            <Switch
              value={karakteristike.rostilj}
              onValueChange={(vrijednost) =>
                promijeniKarakteristiku(
                  'rostilj',
                  vrijednost
                )
              }
              trackColor={{
                false: '#3A3A3A',
                true: '#2E7D32',
              }}
              thumbColor={
                karakteristike.rostilj
                  ? '#81C784'
                  : '#BDBDBD'
              }
            />

          </View>


          <View style={styles.featureCard}>

            <View style={styles.featureLeft}>

              <View style={styles.featureIcon}>

                <Ionicons
                  name="restaurant-outline"
                  size={21}
                  color="#81C784"
                />

              </View>

              <Text style={styles.featureTitle}>
                Vanjska kuhinja
              </Text>

            </View>

            <Switch
              value={
                karakteristike.vanjska_kuhinja
              }
              onValueChange={(vrijednost) =>
                promijeniKarakteristiku(
                  'vanjska_kuhinja',
                  vrijednost
                )
              }
              trackColor={{
                false: '#3A3A3A',
                true: '#2E7D32',
              }}
              thumbColor={
                karakteristike.vanjska_kuhinja
                  ? '#81C784'
                  : '#BDBDBD'
              }
            />

          </View>

        </View>


        {/* OPREMA */}

        <View style={styles.section}>

          <View style={styles.sectionHeader}>

            <View style={styles.sectionIcon}>

              <Ionicons
                name="bicycle-outline"
                size={21}
                color="#81C784"
              />

            </View>

            <View>

              <Text style={styles.sectionTitle}>
                Oprema za iznajmljivanje
              </Text>

              <Text style={styles.sectionDescription}>
                Dostupna oprema u kampu
              </Text>

            </View>

          </View>


          <View style={styles.featureCard}>

            <View style={styles.featureLeft}>

              <View style={styles.featureIcon}>

                <Ionicons
                  name="boat-outline"
                  size={21}
                  color="#81C784"
                />

              </View>

              <Text style={styles.featureTitle}>
                Kajak
              </Text>

            </View>

            <Switch
              value={karakteristike.kajak}
              onValueChange={(vrijednost) =>
                promijeniKarakteristiku(
                  'kajak',
                  vrijednost
                )
              }
              trackColor={{
                false: '#3A3A3A',
                true: '#2E7D32',
              }}
              thumbColor={
                karakteristike.kajak
                  ? '#81C784'
                  : '#BDBDBD'
              }
            />

          </View>


          <View style={styles.featureCard}>

            <View style={styles.featureLeft}>

              <View style={styles.featureIcon}>

                <Ionicons
                  name="boat-outline"
                  size={21}
                  color="#81C784"
                />

              </View>

              <Text style={styles.featureTitle}>
                Čamac
              </Text>

            </View>

            <Switch
              value={karakteristike.camac}
              onValueChange={(vrijednost) =>
                promijeniKarakteristiku(
                  'camac',
                  vrijednost
                )
              }
              trackColor={{
                false: '#3A3A3A',
                true: '#2E7D32',
              }}
              thumbColor={
                karakteristike.camac
                  ? '#81C784'
                  : '#BDBDBD'
              }
            />

          </View>


          <View style={styles.featureCard}>

            <View style={styles.featureLeft}>

              <View style={styles.featureIcon}>

                <Ionicons
                  name="bicycle-outline"
                  size={21}
                  color="#81C784"
                />

              </View>

              <Text style={styles.featureTitle}>
                Bicikl
              </Text>

            </View>

            <Switch
              value={karakteristike.bicikl}
              onValueChange={(vrijednost) =>
                promijeniKarakteristiku(
                  'bicikl',
                  vrijednost
                )
              }
              trackColor={{
                false: '#3A3A3A',
                true: '#2E7D32',
              }}
              thumbColor={
                karakteristike.bicikl
                  ? '#81C784'
                  : '#BDBDBD'
              }
            />

          </View>

        </View>


        {/* LOKACIJA */}

        <View style={styles.section}>

          <View style={styles.sectionHeader}>

            <View style={styles.sectionIcon}>

              <Ionicons
                name="location-outline"
                size={21}
                color="#81C784"
              />

            </View>

            <View>

              <Text style={styles.sectionTitle}>
                Lokacija
              </Text>

              <Text style={styles.sectionDescription}>
                Geografske koordinate kampa
              </Text>

            </View>

          </View>


          <Text style={styles.label}>
            Latitude
          </Text>

          <View style={styles.inputContainer}>

            <Ionicons
              name="navigate-outline"
              size={19}
              color="#757575"
            />

            <TextInput
              style={styles.input}
              value={latitude}
              onChangeText={setLatitude}
              placeholder="npr. 44.123456"
              placeholderTextColor="#666666"
              keyboardType="numeric"
            />

          </View>


          <Text style={styles.label}>
            Longitude
          </Text>

          <View style={styles.inputContainer}>

            <Ionicons
              name="navigate-outline"
              size={19}
              color="#757575"
            />

            <TextInput
              style={styles.input}
              value={longitude}
              onChangeText={setLongitude}
              placeholder="npr. 19.123456"
              placeholderTextColor="#666666"
              keyboardType="numeric"
            />

          </View>

        </View>


        {/* DUGMAD */}

        <TouchableOpacity
          style={[
            styles.saveButton,
            saving && styles.saveButtonDisabled,
          ]}
          onPress={sacuvajIzmjene}
          disabled={saving}
          activeOpacity={0.8}
        >

          {saving ? (

            <ActivityIndicator
              color="#FFFFFF"
            />

          ) : (

            <>

              <Ionicons
                name="save-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.saveButtonText}>
                Sačuvaj izmjene
              </Text>

            </>

          )}

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={saving}
          activeOpacity={0.8}
        >

          <Ionicons
            name="arrow-back-outline"
            size={20}
            color="#BDBDBD"
          />

          <Text style={styles.cancelButtonText}>
            Odustani
          </Text>

        </TouchableOpacity>


      </ScrollView>

    </View>

  );

}


const styles = StyleSheet.create({

  // CONTAINER

  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },


  // LOADING

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#121212',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#BDBDBD',
  },


  // HEADER

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#1B3320',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
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


  // SECTIONS

  section: {
    marginBottom: 22,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#1B3320',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
  },

  sectionDescription: {
    color: '#757575',
    fontSize: 12,
    marginTop: 2,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 11,
    minHeight: 50,
    paddingHorizontal: 13,
  },

  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    marginLeft: 9,
    paddingVertical: 12,
  },

  inputSuffix: {
    color: '#81C784',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  textAreaContainer: {
    alignItems: 'flex-start',
    minHeight: 130,
    paddingTop: 13,
  },

  textAreaIcon: {
    marginTop: 2,
  },

  textArea: {
    minHeight: 105,
    textAlignVertical: 'top',
  },


  // FEATURES

  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 13,
    padding: 12,
    marginBottom: 9,
  },

  featureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#1B3320',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  featureTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  featureDescription: {
    color: '#757575',
    fontSize: 11,
    marginTop: 3,
  },


  // SAVE

  saveButton: {
    minHeight: 52,
    borderRadius: 13,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 5,
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },


  // CANCEL

  cancelButton: {
    minHeight: 50,
    borderRadius: 13,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  cancelButtonText: {
    color: '#BDBDBD',
    fontSize: 16,
    fontWeight: '600',
  },

});