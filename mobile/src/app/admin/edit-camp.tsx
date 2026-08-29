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
        />

        <Text style={styles.loadingText}>
          Učitavanje kampa...
        </Text>

      </View>

    );

  }


  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >

      <Text style={styles.title}>
        Uredi kamp
      </Text>


      <Text style={styles.label}>
        Naziv kampa
      </Text>

      <TextInput
        style={styles.input}
        value={naziv}
        onChangeText={setNaziv}
        placeholder="Naziv kampa"
      />


      <Text style={styles.label}>
        Opis
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.textArea,
        ]}
        value={opis}
        onChangeText={setOpis}
        placeholder="Opis kampa"
        multiline
        numberOfLines={5}
      />


      <Text style={styles.label}>
        Cijena po noći
      </Text>

      <TextInput
        style={styles.input}
        value={cijena}
        onChangeText={setCijena}
        placeholder="npr. 35"
        keyboardType="decimal-pad"
      />


      <Text style={styles.sectionTitle}>
        Osnovne karakteristike
      </Text>


      <View style={styles.switchRow}>

        <Text style={styles.switchText}>
          WiFi
        </Text>

        <Switch
          value={karakteristike.wifi}
          onValueChange={(vrijednost) =>
            promijeniKarakteristiku(
              'wifi',
              vrijednost
            )
          }
        />

      </View>


      <View style={styles.switchRow}>

        <Text style={styles.switchText}>
          Struja
        </Text>

        <Switch
          value={karakteristike.struja}
          onValueChange={(vrijednost) =>
            promijeniKarakteristiku(
              'struja',
              vrijednost
            )
          }
        />

      </View>


      <View style={styles.switchRow}>

        <Text style={styles.switchText}>
          Parking
        </Text>

        <Switch
          value={karakteristike.parking}
          onValueChange={(vrijednost) =>
            promijeniKarakteristiku(
              'parking',
              vrijednost
            )
          }
        />

      </View>


      <Text style={styles.sectionTitle}>
        Dodatne pogodnosti
      </Text>


      <View style={styles.switchRow}>

        <Text style={styles.switchText}>
          Roštilj
        </Text>

        <Switch
          value={karakteristike.rostilj}
          onValueChange={(vrijednost) =>
            promijeniKarakteristiku(
              'rostilj',
              vrijednost
            )
          }
        />

      </View>


      <View style={styles.switchRow}>

        <Text style={styles.switchText}>
          Vanjska kuhinja
        </Text>

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
        />

      </View>


      <Text style={styles.sectionTitle}>
        Oprema za iznajmljivanje
      </Text>


      <View style={styles.switchRow}>

        <Text style={styles.switchText}>
          Kajak
        </Text>

        <Switch
          value={karakteristike.kajak}
          onValueChange={(vrijednost) =>
            promijeniKarakteristiku(
              'kajak',
              vrijednost
            )
          }
        />

      </View>


      <View style={styles.switchRow}>

        <Text style={styles.switchText}>
          Čamac
        </Text>

        <Switch
          value={karakteristike.camac}
          onValueChange={(vrijednost) =>
            promijeniKarakteristiku(
              'camac',
              vrijednost
            )
          }
        />

      </View>


      <View style={styles.switchRow}>

        <Text style={styles.switchText}>
          Bicikl
        </Text>

        <Switch
          value={karakteristike.bicikl}
          onValueChange={(vrijednost) =>
            promijeniKarakteristiku(
              'bicikl',
              vrijednost
            )
          }
        />

      </View>


      <Text style={styles.sectionTitle}>
        Lokacija
      </Text>


      <Text style={styles.label}>
        Latitude
      </Text>

      <TextInput
        style={styles.input}
        value={latitude}
        onChangeText={setLatitude}
        placeholder="npr. 44.123456"
        keyboardType="numeric"
      />


      <Text style={styles.label}>
        Longitude
      </Text>

      <TextInput
        style={styles.input}
        value={longitude}
        onChangeText={setLongitude}
        placeholder="npr. 19.123456"
        keyboardType="numeric"
      />


      <TouchableOpacity
        style={styles.saveButton}
        onPress={sacuvajIzmjene}
        disabled={saving}
      >

        <Text style={styles.saveButtonText}>
          {saving
            ? 'Spremanje...'
            : 'Sačuvaj izmjene'}
        </Text>

      </TouchableOpacity>


      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={saving}
      >

        <Text style={styles.cancelButtonText}>
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


  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },


  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },


  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },


  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 7,
    marginTop: 15,
  },


  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 13,
    fontSize: 16,
  },


  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },


  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 10,
  },


  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },


  switchText: {
    fontSize: 17,
  },


  saveButton: {
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },


  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },


  cancelButton: {
    marginTop: 12,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },


  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

});