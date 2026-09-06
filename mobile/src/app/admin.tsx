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

import { Ionicons } from '@expo/vector-icons';


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


  async function deaktivirajKamp(
    kampId: number
  ) {

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
          color="#81C784"
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

        <Ionicons
          name="shield-outline"
          size={52}
          color="#EF5350"
        />

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
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}

      <View style={styles.header}>

        <View style={styles.headerIcon}>

          <Ionicons
            name="shield-checkmark-outline"
            size={30}
            color="#81C784"
          />

        </View>


        <View style={styles.headerText}>

          <Text style={styles.title}>
            Admin panel
          </Text>

          <Text style={styles.welcome}>
            Dobrodošli, {korisnik.ime_prezime}
          </Text>

        </View>

      </View>


      {/* ADMIN INFORMACIJE */}

      <View style={styles.adminInfo}>

        <View style={styles.infoRow}>

          <Ionicons
            name="mail-outline"
            size={19}
            color="#81C784"
          />

          <View style={styles.infoContent}>

            <Text style={styles.infoLabel}>
              Email
            </Text>

            <Text style={styles.infoValue}>
              {korisnik.email}
            </Text>

          </View>

        </View>


        <View style={styles.infoDivider} />


        <View style={styles.infoRow}>

          <Ionicons
            name="shield-checkmark-outline"
            size={19}
            color="#81C784"
          />

          <View style={styles.infoContent}>

            <Text style={styles.infoLabel}>
              Uloga
            </Text>

            <Text style={styles.infoValue}>
              Administrator
            </Text>

          </View>

        </View>

      </View>


      {/* ADMIN AKCIJE */}

      <Text style={styles.sectionTitle}>
        Administracija
      </Text>


      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() =>
          router.push('/admin/add-camp')
        }
        activeOpacity={0.8}
      >

        <View style={styles.buttonIcon}>

          <Ionicons
            name="add-circle-outline"
            size={23}
            color="#FFFFFF"
          />

        </View>

        <View style={styles.buttonContent}>

          <Text style={styles.primaryButtonTitle}>
            Dodaj kamp
          </Text>

          <Text style={styles.primaryButtonSubtitle}>
            Dodavanje novog kamp mjesta
          </Text>

        </View>

        <Ionicons
          name="chevron-forward-outline"
          size={21}
          color="#FFFFFF"
        />

      </TouchableOpacity>


      <TouchableOpacity
        style={styles.actionButton}
        onPress={() =>
          router.push('/admin/users')
        }
        activeOpacity={0.8}
      >

        <View style={styles.actionIcon}>

          <Ionicons
            name="people-outline"
            size={23}
            color="#81C784"
          />

        </View>

        <View style={styles.buttonContent}>

          <Text style={styles.actionButtonTitle}>
            Korisnici
          </Text>

          <Text style={styles.actionButtonSubtitle}>
            Upravljanje korisničkim računima
          </Text>

        </View>

        <Ionicons
          name="chevron-forward-outline"
          size={21}
          color="#757575"
        />

      </TouchableOpacity>


      <TouchableOpacity
        style={styles.actionButton}
        onPress={() =>
          router.push('/admin/reservations')
        }
        activeOpacity={0.8}
      >

        <View style={styles.actionIcon}>

          <Ionicons
            name="calendar-outline"
            size={23}
            color="#81C784"
          />

        </View>

        <View style={styles.buttonContent}>

          <Text style={styles.actionButtonTitle}>
            Upravljanje rezervacijama
          </Text>

          <Text style={styles.actionButtonSubtitle}>
            Pregled i upravljanje rezervacijama
          </Text>

        </View>

        <Ionicons
          name="chevron-forward-outline"
          size={21}
          color="#757575"
        />

      </TouchableOpacity>


      {/* KAMPOVI */}

      <View style={styles.campsHeader}>

        <View>

          <Text style={styles.sectionTitle}>
            Kamp mjesta
          </Text>

          <Text style={styles.campsCount}>
            Ukupno: {kampovi.length}
          </Text>

        </View>


        <View style={styles.campsIcon}>

          <Ionicons
            name="bonfire-outline"
            size={21}
            color="#81C784"
          />

        </View>

      </View>


      {kampovi.map((kamp) => (

        <View
          key={kamp.id}
          style={styles.card}
        >

          <View style={styles.cardHeader}>

            <View style={styles.campIcon}>

              <Ionicons
                name="bonfire-outline"
                size={23}
                color="#81C784"
              />

            </View>


            <View style={styles.cardTitleContainer}>

              <Text style={styles.cardTitle}>
                {kamp.naziv}
              </Text>

              <Text style={styles.campId}>
                Kamp #{kamp.id}
              </Text>

            </View>

          </View>


          <Text
            style={styles.description}
            numberOfLines={2}
          >
            {kamp.opis}
          </Text>


          <View style={styles.priceRow}>

            <Ionicons
              name="pricetag-outline"
              size={18}
              color="#81C784"
            />

            <Text style={styles.price}>
              {Number(
                kamp.cijena_po_noci
              ).toFixed(2)} KM
              <Text style={styles.priceUnit}>
                {' '} / noć
              </Text>
            </Text>

          </View>


          <View style={styles.actions}>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                router.push(
                  `/admin/edit-camp?id=${kamp.id}`
                )
              }
              activeOpacity={0.8}
            >

              <Ionicons
                name="create-outline"
                size={19}
                color="#81C784"
              />

              <Text style={styles.editButtonText}>
                Uredi
              </Text>

            </TouchableOpacity>


            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() =>
                deaktivirajKamp(kamp.id)
              }
              activeOpacity={0.8}
            >

              <Ionicons
                name="close-circle-outline"
                size={19}
                color="#EF5350"
              />

              <Text style={styles.deleteButtonText}>
                Deaktiviraj
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      ))}


      {kampovi.length === 0 && (

        <View style={styles.emptyState}>

          <Ionicons
            name="bonfire-outline"
            size={42}
            color="#757575"
          />

          <Text style={styles.emptyTitle}>
            Nema kampova
          </Text>

          <Text style={styles.emptyText}>
            Trenutno nema dostupnih kamp mjesta.
          </Text>

        </View>

      )}

    </ScrollView>

  );

}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

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

  error: {
    marginTop: 14,
    fontSize: 17,
    color: '#EF5350',
    textAlign: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#1B3320',
    borderWidth: 1,
    borderColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  welcome: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 3,
  },

  adminInfo: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 15,
    padding: 15,
    marginBottom: 24,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoContent: {
    marginLeft: 11,
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  infoDivider: {
    height: 1,
    backgroundColor: '#2C2C2C',
    marginVertical: 13,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },

  primaryButton: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  buttonIcon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: '#256628',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonContent: {
    flex: 1,
    marginLeft: 12,
  },

  primaryButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  primaryButtonSubtitle: {
    fontSize: 12,
    color: '#C8E6C9',
    marginTop: 3,
  },

  actionButton: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  actionButtonSubtitle: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 3,
  },

  campsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },

  campsCount: {
    fontSize: 13,
    color: '#757575',
    marginTop: -7,
  },

  campsIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  campIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  cardTitleContainer: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  campId: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#BDBDBD',
    marginBottom: 12,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },

  price: {
    marginLeft: 7,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#81C784',
  },

  priceUnit: {
    fontSize: 13,
    fontWeight: 'normal',
    color: '#9E9E9E',
  },

  actions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 13,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2C',
  },

  editButton: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1B3320',
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 10,
    gap: 7,
  },

  editButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#81C784',
  },

  deleteButton: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#5A2929',
    borderRadius: 10,
    gap: 7,
  },

  deleteButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EF5350',
  },

  emptyState: {
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 15,
    padding: 30,
    marginTop: 5,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  emptyText: {
    marginTop: 5,
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },

});