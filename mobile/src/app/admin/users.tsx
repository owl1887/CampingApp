import { useCallback, useState } from 'react';

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

import { getToken } from '@/services/auth';

import {
  getAllUsers,
  updateUserRole,
  activateUser,
  deactivateUser,
} from '@/services/api';


type Korisnik = {
  id: number;
  ime_prezime: string;
  email: string;
  uloga: string;
  aktivan: boolean;
};


export default function AdminUsersScreen() {

  const [korisnici, setKorisnici] =
    useState<Korisnik[]>([]);

  const [loading, setLoading] =
    useState(true);


  async function ucitajKorisnike() {

    try {

      setLoading(true);


      const token =
        await getToken();


      if (!token) {

        router.replace('/login');

        return;
      }


      const data =
        await getAllUsers(token);


      setKorisnici(
        data.korisnici || []
      );


    } catch (error: any) {

      console.error(
        'Greška pri učitavanju korisnika:',
        error
      );


      Alert.alert(
        'Greška',
        error.message ||
        'Nije moguće učitati korisnike.'
      );


    } finally {

      setLoading(false);

    }

  }


  useFocusEffect(
    useCallback(() => {

      ucitajKorisnike();

    }, [])
  );


  async function promijeniUlogu(
    korisnik: Korisnik
  ) {

    const novaUloga =
      korisnik.uloga === 'admin'
        ? 'korisnik'
        : 'admin';


    Alert.alert(
      'Promjena uloge',
      `Da li želite korisniku ${korisnik.ime_prezime} promijeniti ulogu u "${novaUloga}"?`,
      [
        {
          text: 'Odustani',
          style: 'cancel',
        },

        {
          text: 'Potvrdi',

          onPress: async () => {

            try {

              const token =
                await getToken();


              if (!token) {

                router.replace('/login');

                return;
              }


              await updateUserRole(
                korisnik.id,
                novaUloga,
                token
              );


              Alert.alert(
                'Uspješno',
                'Uloga korisnika je uspješno promijenjena.'
              );


              await ucitajKorisnike();


            } catch (error: any) {

              console.error(
                'Greška pri promjeni uloge:',
                error
              );


              Alert.alert(
                'Greška',
                error.message ||
                'Nije moguće promijeniti ulogu korisnika.'
              );

            }

          },
        },
      ]
    );

  }


  async function promijeniStatus(
    korisnik: Korisnik
  ) {

    const noviStatus =
      !korisnik.aktivan;


    const akcija =
      noviStatus
        ? 'aktivirati'
        : 'deaktivirati';


    Alert.alert(
      noviStatus
        ? 'Aktivacija računa'
        : 'Deaktivacija računa',

      `Da li želite ${akcija} korisnički račun "${korisnik.ime_prezime}"?`,

      [
        {
          text: 'Odustani',
          style: 'cancel',
        },

        {
          text: noviStatus
            ? 'Aktiviraj'
            : 'Deaktiviraj',

          style: noviStatus
            ? 'default'
            : 'destructive',

          onPress: async () => {

            try {

              const token =
                await getToken();


              if (!token) {

                router.replace('/login');

                return;
              }


              if (noviStatus) {

                await activateUser(
                  korisnik.id,
                  token
                );

              } else {

                await deactivateUser(
                  korisnik.id,
                  token
                );

              }


              Alert.alert(
                'Uspješno',

                noviStatus
                  ? 'Korisnički račun je aktiviran.'
                  : 'Korisnički račun je deaktiviran.'
              );


              await ucitajKorisnike();


            } catch (error: any) {

              console.error(
                'Greška pri promjeni statusa:',
                error
              );


              Alert.alert(
                'Greška',
                error.message ||
                'Nije moguće promijeniti status korisnika.'
              );

            }

          },
        },
      ]
    );

  }


  if (loading) {

    return (

      <View style={styles.center}>

        <ActivityIndicator
          size="large"
        />

        <Text style={styles.loadingText}>
          Učitavanje korisnika...
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
        Korisnici
      </Text>


      <Text style={styles.subtitle}>
        Upravljanje korisničkim računima
      </Text>


      {korisnici.length === 0 ? (

        <View style={styles.center}>

          <Text style={styles.emptyText}>
            Trenutno nema korisnika.
          </Text>

        </View>

      ) : (

        korisnici.map(
          (korisnik) => (

            <View
              key={korisnik.id}
              style={styles.card}
            >

              <Text style={styles.cardTitle}>
                {korisnik.ime_prezime}
              </Text>


              <Text style={styles.email}>
                {korisnik.email}
              </Text>


              <View style={styles.infoRow}>

                <Text style={styles.label}>
                  ID:
                </Text>

                <Text style={styles.value}>
                  {korisnik.id}
                </Text>

              </View>


              <View style={styles.infoRow}>

                <Text style={styles.label}>
                  Uloga:
                </Text>

                <Text style={styles.value}>
                  {korisnik.uloga}
                </Text>

              </View>


              <View style={styles.infoRow}>

                <Text style={styles.label}>
                  Status:
                </Text>

                <Text
                  style={
                    korisnik.aktivan
                      ? styles.activeStatus
                      : styles.inactiveStatus
                  }
                >
                  {korisnik.aktivan
                    ? 'Aktivan'
                    : 'Deaktiviran'}
                </Text>

              </View>


              <View style={styles.actions}>

                <TouchableOpacity
                  style={styles.roleButton}
                  onPress={() =>
                    promijeniUlogu(korisnik)
                  }
                >

                  <Text style={styles.buttonText}>
                    {korisnik.uloga === 'admin'
                      ? 'Postavi korisnika'
                      : 'Postavi admina'}
                  </Text>

                </TouchableOpacity>


                <TouchableOpacity
                  style={
                    korisnik.aktivan
                      ? styles.deactivateButton
                      : styles.activateButton
                  }
                  onPress={() =>
                    promijeniStatus(korisnik)
                  }
                >

                  <Text style={styles.buttonText}>
                    {korisnik.aktivan
                      ? 'Deaktiviraj'
                      : 'Aktiviraj'}
                  </Text>

                </TouchableOpacity>

              </View>

            </View>

          )
        )

      )}

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
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },

  emptyText: {
    fontSize: 17,
  },

  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },

  cardTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  email: {
    fontSize: 15,
    marginBottom: 15,
  },

  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },

  label: {
    fontSize: 15,
    fontWeight: 'bold',
    width: 80,
  },

  value: {
    fontSize: 15,
  },

  activeStatus: {
    fontSize: 15,
    fontWeight: 'bold',
  },

  inactiveStatus: {
    fontSize: 15,
    fontWeight: 'bold',
  },

  actions: {
    marginTop: 15,
    gap: 10,
  },

  roleButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },

  deactivateButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },

  activateButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },

});