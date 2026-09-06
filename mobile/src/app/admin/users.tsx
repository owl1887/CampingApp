
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

import { Ionicons } from '@expo/vector-icons';

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
          color="#81C784"
        />

        <Text style={styles.loadingText}>
          Učitavanje korisnika...
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
              name="people-outline"
              size={30}
              color="#81C784"
            />

          </View>

          <View style={styles.headerTextContainer}>

            <Text style={styles.title}>
              Korisnici
            </Text>

            <Text style={styles.subtitle}>
              Upravljanje korisničkim računima
            </Text>

          </View>

        </View>


        {/* BROJ KORISNIKA */}

        <View style={styles.countCard}>

          <View style={styles.countIcon}>

            <Ionicons
              name="people-outline"
              size={21}
              color="#81C784"
            />

          </View>

          <View>

            <Text style={styles.countLabel}>
              Ukupan broj korisnika
            </Text>

            <Text style={styles.countValue}>
              {korisnici.length}
            </Text>

          </View>

        </View>


        {korisnici.length === 0 ? (

          <View style={styles.emptyCard}>

            <View style={styles.emptyIcon}>

              <Ionicons
                name="people-outline"
                size={42}
                color="#81C784"
              />

            </View>

            <Text style={styles.emptyTitle}>
              Nema korisnika
            </Text>

            <Text style={styles.emptyText}>
              Trenutno nema registrovanih korisnika.
            </Text>

          </View>

        ) : (

          korisnici.map(
            (korisnik) => (

              <View
                key={korisnik.id}
                style={styles.card}
              >

                {/* USER HEADER */}

                <View style={styles.userHeader}>

                  <View style={styles.avatar}>

                    <Ionicons
                      name="person-outline"
                      size={25}
                      color="#81C784"
                    />

                  </View>

                  <View style={styles.userInfo}>

                    <Text
                      style={styles.cardTitle}
                      numberOfLines={1}
                    >
                      {korisnik.ime_prezime}
                    </Text>

                    <View style={styles.emailRow}>

                      <Ionicons
                        name="mail-outline"
                        size={15}
                        color="#9E9E9E"
                      />

                      <Text
                        style={styles.email}
                        numberOfLines={1}
                      >
                        {korisnik.email}
                      </Text>

                    </View>

                  </View>

                </View>


                {/* USER DETAILS */}

                <View style={styles.details}>

                  <View style={styles.infoRow}>

                    <View style={styles.infoIcon}>

                      <Ionicons
                        name="finger-print-outline"
                        size={17}
                        color="#81C784"
                      />

                    </View>

                    <Text style={styles.infoLabel}>
                      ID
                    </Text>

                    <Text style={styles.infoValue}>
                      {korisnik.id}
                    </Text>

                  </View>


                  <View style={styles.infoRow}>

                    <View style={styles.infoIcon}>

                      <Ionicons
                        name="shield-outline"
                        size={17}
                        color="#81C784"
                      />

                    </View>

                    <Text style={styles.infoLabel}>
                      Uloga
                    </Text>

                    <View style={styles.roleBadge}>

                      <Ionicons
                        name={
                          korisnik.uloga === 'admin'
                            ? 'shield-checkmark-outline'
                            : 'person-outline'
                        }
                        size={14}
                        color="#81C784"
                      />

                      <Text style={styles.roleText}>
                        {korisnik.uloga}
                      </Text>

                    </View>

                  </View>


                  <View style={styles.infoRow}>

                    <View style={styles.infoIcon}>

                      <Ionicons
                        name={
                          korisnik.aktivan
                            ? 'checkmark-circle-outline'
                            : 'close-circle-outline'
                        }
                        size={17}
                        color={
                          korisnik.aktivan
                            ? '#81C784'
                            : '#EF5350'
                        }
                      />

                    </View>

                    <Text style={styles.infoLabel}>
                      Status
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        korisnik.aktivan
                          ? styles.activeBadge
                          : styles.inactiveBadge,
                      ]}
                    >

                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor:
                              korisnik.aktivan
                                ? '#81C784'
                                : '#EF5350',
                          },
                        ]}
                      />

                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              korisnik.aktivan
                                ? '#81C784'
                                : '#EF5350',
                          },
                        ]}
                      >
                        {korisnik.aktivan
                          ? 'Aktivan'
                          : 'Deaktiviran'}
                      </Text>

                    </View>

                  </View>

                </View>


                {/* ACTIONS */}

                <View style={styles.actions}>

                  <TouchableOpacity
                    style={styles.roleButton}
                    onPress={() =>
                      promijeniUlogu(korisnik)
                    }
                    activeOpacity={0.8}
                  >

                    <Ionicons
                      name="swap-horizontal-outline"
                      size={19}
                      color="#FFFFFF"
                    />

                    <Text style={styles.roleButtonText}>
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
                    activeOpacity={0.8}
                  >

                    <Ionicons
                      name={
                        korisnik.aktivan
                          ? 'person-remove-outline'
                          : 'person-add-outline'
                      }
                      size={19}
                      color={
                        korisnik.aktivan
                          ? '#EF5350'
                          : '#81C784'
                      }
                    />

                    <Text
                      style={
                        korisnik.aktivan
                          ? styles.deactivateText
                          : styles.activateText
                      }
                    >
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

    </View>

  );

}


const styles = StyleSheet.create({

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
    marginBottom: 22,
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
  },


  // COUNT

  countCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },

  countIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#1B3320',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  countLabel: {
    color: '#9E9E9E',
    fontSize: 13,
  },

  countValue: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 2,
  },


  // EMPTY

  emptyCard: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginTop: 10,
  },

  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: '#1B3320',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

  emptyText: {
    color: '#9E9E9E',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
  },


  // USER CARD

  card: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
  },

  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#1B3320',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  userInfo: {
    flex: 1,
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
  },

  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 6,
  },

  email: {
    color: '#9E9E9E',
    fontSize: 13,
    flex: 1,
  },


  // DETAILS

  details: {
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2C',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
  },

  infoIcon: {
    width: 28,
    alignItems: 'center',
    marginRight: 5,
  },

  infoLabel: {
    color: '#9E9E9E',
    fontSize: 14,
    width: 58,
  },

  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1B3320',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  roleText: {
    color: '#81C784',
    fontSize: 13,
    fontWeight: '600',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  activeBadge: {
    backgroundColor: '#18251A',
  },

  inactiveBadge: {
    backgroundColor: '#2A1919',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },


  // ACTIONS

  actions: {
    marginTop: 16,
    gap: 10,
  },

  roleButton: {
    minHeight: 47,
    borderRadius: 11,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  roleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  deactivateButton: {
    minHeight: 47,
    borderRadius: 11,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#5A2929',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  deactivateText: {
    color: '#EF5350',
    fontSize: 14,
    fontWeight: 'bold',
  },

  activateButton: {
    minHeight: 47,
    borderRadius: 11,
    backgroundColor: '#18251A',
    borderWidth: 1,
    borderColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  activateText: {
    color: '#81C784',
    fontSize: 14,
    fontWeight: 'bold',
  },

});

