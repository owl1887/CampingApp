import { useCallback, useState } from 'react';
import { getToken } from '@/services/auth';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  router,
  useFocusEffect,
} from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getProfile,
  getKampovi,
  deleteCamp,
} from '@/services/api';


type Korisnik = {
  id: number;
  ime_prezime: string;
  email: string;
  uloga: string;
};


type Kamp = {
  id: number;
  naziv: string;
  opis: string;
  cijena_po_noci: number;
};


export default function AdminScreen() {

  const [korisnik, setKorisnik] =
    useState<Korisnik | null>(null);

  const [kampovi, setKampovi] =
    useState<Kamp[]>([]);

  const [loading, setLoading] =
    useState(true);

    async function deaktivirajKamp(kampId: number) {

  Alert.alert(
    'Deaktivacija kampa',
    'Da li ste sigurni da želite deaktivirati ovaj kamp?',
    [
      {
        text: 'Odustani',
        style: 'cancel',
      },

      {
        text: 'Deaktiviraj',
        style: 'destructive',

        onPress: async () => {

          try {

            const token = await getToken();

            if (!token) {

              Alert.alert(
                'Greška',
                'Niste prijavljeni.'
              );

              return;
            }


            await deleteCamp(
              kampId,
              token
            );


            Alert.alert(
              'Uspješno',
              'Kamp je uspješno deaktiviran.'
            );


            // Ponovo učitavamo listu kampova
            await ucitajAdminPodatke();


          } catch (error: any) {

            console.error(
              'Greška pri deaktivaciji kampa:',
              error
            );

            Alert.alert(
              'Greška',
              error.message ||
              'Nije moguće deaktivirati kamp.'
            );

          }

        },
      },
    ]
  );
}

  async function ucitajAdminPodatke() {

    try {

      const token =
        await AsyncStorage.getItem('token');


      if (!token) {

        router.replace('/login');

        return;
      }


      const profile =
        await getProfile(token);


      const korisnikPodaci =
        profile.korisnik;


      setKorisnik(korisnikPodaci);


      if (korisnikPodaci.uloga !== 'admin') {

        Alert.alert(
          'Pristup odbijen',
          'Nemate administratorske ovlasti.',
          [
            {
              text: 'U redu',
              onPress: () =>
                router.back(),
            },
          ]
        );

        return;
      }


      const podaci =
        await getKampovi();


      setKampovi(podaci);


    } catch (error) {

      console.error(
        'Greška pri učitavanju admin panela:',
        error
      );

      Alert.alert(
        'Greška',
        'Nije moguće učitati administratorski panel.'
      );

    } finally {

      setLoading(false);

    }
  }


  useFocusEffect(
    useCallback(() => {

      ucitajAdminPodatke();

    }, [])
  );


  if (loading) {

    return (

      <View style={styles.center}>

        <ActivityIndicator
          size="large"
        />

        <Text style={styles.loadingText}>
          Učitavanje admin panela...
        </Text>

      </View>

    );

  }


  if (
    !korisnik ||
    korisnik.uloga !== 'admin'
  ) {

    return (

      <View style={styles.center}>

        <Text style={styles.error}>
          Nemate administratorske ovlasti.
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
        Admin panel
      </Text>


      <Text style={styles.welcome}>
        Dobrodošli, {korisnik.ime_prezime}
      </Text>


      <View style={styles.adminInfo}>

        <Text style={styles.infoText}>
          Email: {korisnik.email}
        </Text>

        <Text style={styles.infoText}>
          Uloga: {korisnik.uloga}
        </Text>

      </View>


      <TouchableOpacity
        style={styles.addButton}
       onPress={() =>
  router.push('/admin/add-camp')
}
      >

        <Text style={styles.buttonText}>
          + Dodaj kamp
        </Text>

      </TouchableOpacity>


      <Text style={styles.sectionTitle}>
        Kamp mjesta
      </Text>


      {kampovi.map((kamp) => (

        <View
          key={kamp.id}
          style={styles.card}
        >

          <Text style={styles.cardTitle}>
            {kamp.naziv}
          </Text>


          <Text
            style={styles.description}
            numberOfLines={2}
          >
            {kamp.opis}
          </Text>


          <Text style={styles.price}>
            {Number(
              kamp.cijena_po_noci
            ).toFixed(2)} KM / noć
          </Text>


          <View style={styles.actions}>

            <TouchableOpacity
              style={styles.editButton}
             onPress={() =>
  router.push(
    `/admin/edit-camp?id=${kamp.id}`
  )
}
            >

              <Text style={styles.buttonText}>
                Uredi
              </Text>

            </TouchableOpacity>


            <TouchableOpacity
  style={styles.deleteButton}
  onPress={() =>
    deaktivirajKamp(kamp.id)
  }
>
  <Text style={styles.deleteButtonText}>
    Deaktiviraj
  </Text>
</TouchableOpacity>

          </View>

        </View>

      ))}

    </ScrollView>

  );

}


const styles = StyleSheet.create({
    deleteButton: {
  marginTop: 10,
  padding: 12,
  borderRadius: 8,
  alignItems: 'center',
  borderWidth: 1,
},

deleteButtonText: {
  fontSize: 15,
  fontWeight: 'bold',
},

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

  error: {
    fontSize: 17,
    textAlign: 'center',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  welcome: {
    fontSize: 18,
    marginBottom: 20,
  },

  adminInfo: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },

  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },

  addButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },

  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },

  editButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },

  

});