
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
  useFocusEffect,
  router,
} from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { getToken } from '@/services/auth';

import {
  getAllReservations,
  updateReservationStatus,
} from '@/services/api';


type Rezervacija = {
  rezervacija_id: number;
  datum_prijave: string;
  datum_odjave: string;
  ukupna_cijena: number;
  status: string;

  kamp_id: number;
  kamp_naziv: string;

  korisnik_id: number;
  korisnik_ime: string;
  korisnik_email: string;
};


export default function AdminReservationsScreen() {

  const [rezervacije, setRezervacije] =
    useState<Rezervacija[]>([]);

  const [loading, setLoading] =
    useState(true);


  async function ucitajRezervacije() {

    try {

      setLoading(true);

      const token = await getToken();

      if (!token) {

        router.replace('/login');

        return;
      }


      const data =
        await getAllReservations(token);


      setRezervacije(
        data.rezervacije || []
      );


    } catch (error: any) {

      console.error(
        'Greška pri učitavanju rezervacija:',
        error
      );

      Alert.alert(
        'Greška',
        error.message ||
        'Nije moguće učitati rezervacije.'
      );

    } finally {

      setLoading(false);

    }
  }


  useFocusEffect(
    useCallback(() => {

      ucitajRezervacije();

    }, [])
  );


  async function promijeniStatus(
    rezervacijaId: number,
    noviStatus: string
  ) {

    try {

      const token =
        await getToken();


      if (!token) {

        router.replace('/login');

        return;
      }


      await updateReservationStatus(
        rezervacijaId,
        noviStatus,
        token
      );


      Alert.alert(
        'Uspješno',
        'Status rezervacije je uspješno promijenjen.'
      );


      await ucitajRezervacije();


    } catch (error: any) {

      console.error(
        'Greška pri promjeni statusa:',
        error
      );


      Alert.alert(
        'Greška',
        error.message ||
        'Nije moguće promijeniti status rezervacije.'
      );

    }
  }


  function statusInfo(status: string) {

    switch (status) {

      case 'aktivna':
        return {
          icon: 'checkmark-circle-outline' as const,
          label: 'Aktivna',
          color: '#81C784',
          background: '#18251A',
        };

      case 'otkazana':
        return {
          icon: 'close-circle-outline' as const,
          label: 'Otkazana',
          color: '#EF5350',
          background: '#2A1919',
        };

      case 'zavrsena':
        return {
          icon: 'checkmark-done-circle-outline' as const,
          label: 'Završena',
          color: '#BDBDBD',
          background: '#252525',
        };

      default:
        return {
          icon: 'help-circle-outline' as const,
          label: status,
          color: '#BDBDBD',
          background: '#252525',
        };

    }

  }


  if (loading) {

    return (

      <View style={styles.center}>

        <ActivityIndicator
          size="large"
          color="#81C784"
        />

        <Text style={styles.loadingText}>
          Učitavanje rezervacija...
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
              name="calendar-outline"
              size={30}
              color="#81C784"
            />

          </View>

          <View style={styles.headerTextContainer}>

            <Text style={styles.title}>
              Rezervacije
            </Text>

            <Text style={styles.subtitle}>
              Upravljanje rezervacijama korisnika
            </Text>

          </View>

        </View>


        {/* COUNT */}

        <View style={styles.countCard}>

          <View style={styles.countIcon}>

            <Ionicons
              name="calendar-number-outline"
              size={21}
              color="#81C784"
            />

          </View>

          <View>

            <Text style={styles.countLabel}>
              Ukupan broj rezervacija
            </Text>

            <Text style={styles.countValue}>
              {rezervacije.length}
            </Text>

          </View>

        </View>


        {rezervacije.length === 0 ? (

          <View style={styles.emptyCard}>

            <View style={styles.emptyIcon}>

              <Ionicons
                name="calendar-outline"
                size={42}
                color="#81C784"
              />

            </View>

            <Text style={styles.emptyTitle}>
              Nema rezervacija
            </Text>

            <Text style={styles.emptyText}>
              Trenutno nema evidentiranih rezervacija.
            </Text>

          </View>

        ) : (

          rezervacije.map(
            (rezervacija) => {

              const status =
                statusInfo(rezervacija.status);

              return (

                <View
                  key={rezervacija.rezervacija_id}
                  style={styles.card}
                >

                  {/* RESERVATION HEADER */}

                  <View style={styles.cardHeader}>

                    <View style={styles.reservationIcon}>

                      <Ionicons
                        name="receipt-outline"
                        size={23}
                        color="#81C784"
                      />

                    </View>

                    <View style={styles.cardHeaderText}>

                      <Text style={styles.cardTitle}>
                        Rezervacija #
                        {rezervacija.rezervacija_id}
                      </Text>

                      <Text style={styles.cardSubtitle}>
                        Kamp #{rezervacija.kamp_id}
                      </Text>

                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            status.background,
                        },
                      ]}
                    >

                      <Ionicons
                        name={status.icon}
                        size={15}
                        color={status.color}
                      />

                      <Text
                        style={[
                          styles.statusBadgeText,
                          {
                            color: status.color,
                          },
                        ]}
                      >
                        {status.label}
                      </Text>

                    </View>

                  </View>


                  {/* USER */}

                  <View style={styles.section}>

                    <View style={styles.sectionTitleRow}>

                      <Ionicons
                        name="person-outline"
                        size={18}
                        color="#81C784"
                      />

                      <Text style={styles.sectionTitle}>
                        Korisnik
                      </Text>

                    </View>

                    <View style={styles.infoBox}>

                      <Text style={styles.value}>
                        {rezervacija.korisnik_ime}
                      </Text>

                      <View style={styles.emailRow}>

                        <Ionicons
                          name="mail-outline"
                          size={15}
                          color="#9E9E9E"
                        />

                        <Text style={styles.email}>
                          {rezervacija.korisnik_email}
                        </Text>

                      </View>

                    </View>

                  </View>


                  {/* CAMP */}

                  <View style={styles.section}>

                    <View style={styles.sectionTitleRow}>

                      <Ionicons
                        name="bonfire-outline"
                        size={18}
                        color="#81C784"
                      />

                      <Text style={styles.sectionTitle}>
                        Kamp
                      </Text>

                    </View>

                    <View style={styles.infoBox}>

                      <Text style={styles.value}>
                        {rezervacija.kamp_naziv}
                      </Text>

                    </View>

                  </View>


                  {/* PERIOD */}

                  <View style={styles.section}>

                    <View style={styles.sectionTitleRow}>

                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color="#81C784"
                      />

                      <Text style={styles.sectionTitle}>
                        Period boravka
                      </Text>

                    </View>

                    <View style={styles.dateContainer}>

                      <View style={styles.dateItem}>

                        <Ionicons
                          name="log-in-outline"
                          size={19}
                          color="#81C784"
                        />

                        <View>

                          <Text style={styles.dateLabel}>
                            Prijava
                          </Text>

                          <Text style={styles.dateValue}>
                            {rezervacija.datum_prijave}
                          </Text>

                        </View>

                      </View>


                      <View style={styles.dateArrow}>

                        <Ionicons
                          name="arrow-forward-outline"
                          size={18}
                          color="#757575"
                        />

                      </View>


                      <View style={styles.dateItem}>

                        <Ionicons
                          name="log-out-outline"
                          size={19}
                          color="#81C784"
                        />

                        <View>

                          <Text style={styles.dateLabel}>
                            Odjava
                          </Text>

                          <Text style={styles.dateValue}>
                            {rezervacija.datum_odjave}
                          </Text>

                        </View>

                      </View>

                    </View>

                  </View>


                  {/* PRICE */}

                  <View style={styles.priceCard}>

                    <View style={styles.priceIcon}>

                      <Ionicons
                        name="pricetag-outline"
                        size={20}
                        color="#81C784"
                      />

                    </View>

                    <View>

                      <Text style={styles.priceLabel}>
                        Ukupna cijena
                      </Text>

                      <Text style={styles.price}>
                        {Number(
                          rezervacija.ukupna_cijena
                        ).toFixed(2)} KM
                      </Text>

                    </View>

                  </View>


                  {/* STATUS */}

                  <View style={styles.statusSection}>

                    <View style={styles.sectionTitleRow}>

                      <Ionicons
                        name="options-outline"
                        size={18}
                        color="#81C784"
                      />

                      <Text style={styles.sectionTitle}>
                        Promjena statusa
                      </Text>

                    </View>


                    <View style={styles.statusButtons}>

                      {rezervacija.status !== 'aktivna' && (

                        <TouchableOpacity
                          style={styles.activateButton}
                          onPress={() =>
                            promijeniStatus(
                              rezervacija.rezervacija_id,
                              'aktivna'
                            )
                          }
                          activeOpacity={0.8}
                        >

                          <Ionicons
                            name="checkmark-circle-outline"
                            size={17}
                            color="#81C784"
                          />

                          <Text style={styles.activateText}>
                            Aktivna
                          </Text>

                        </TouchableOpacity>

                      )}


                      {rezervacija.status !== 'otkazana' && (

                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() =>
                            promijeniStatus(
                              rezervacija.rezervacija_id,
                              'otkazana'
                            )
                          }
                          activeOpacity={0.8}
                        >

                          <Ionicons
                            name="close-circle-outline"
                            size={17}
                            color="#EF5350"
                          />

                          <Text style={styles.cancelText}>
                            Otkazana
                          </Text>

                        </TouchableOpacity>

                      )}


                      {rezervacija.status !== 'zavrsena' && (

                        <TouchableOpacity
                          style={styles.finishButton}
                          onPress={() =>
                            promijeniStatus(
                              rezervacija.rezervacija_id,
                              'zavrsena'
                            )
                          }
                          activeOpacity={0.8}
                        >

                          <Ionicons
                            name="checkmark-done-circle-outline"
                            size={17}
                            color="#BDBDBD"
                          />

                          <Text style={styles.finishText}>
                            Završena
                          </Text>

                        </TouchableOpacity>

                      )}

                    </View>

                  </View>

                </View>

              );

            }
          )

        )}

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


  // CARD

  card: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },

  reservationIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#1B3320',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  cardHeaderText: {
    flex: 1,
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  cardSubtitle: {
    color: '#757575',
    fontSize: 12,
    marginTop: 3,
  },


  // STATUS BADGE

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 6,
    gap: 5,
  },

  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },


  // SECTIONS

  section: {
    marginTop: 17,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
  },

  sectionTitle: {
    color: '#BDBDBD',
    fontSize: 14,
    fontWeight: '600',
  },

  infoBox: {
    backgroundColor: '#181818',
    borderRadius: 11,
    padding: 11,
    borderWidth: 1,
    borderColor: '#252525',
  },

  value: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },

  email: {
    color: '#9E9E9E',
    fontSize: 13,
  },


  // DATES

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#252525',
    padding: 11,
  },

  dateItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  dateLabel: {
    color: '#757575',
    fontSize: 11,
  },

  dateValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },

  dateArrow: {
    paddingHorizontal: 8,
  },


  // PRICE

  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18251A',
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 12,
    padding: 13,
    marginTop: 17,
  },

  priceIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#1B3320',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  priceLabel: {
    color: '#9E9E9E',
    fontSize: 12,
  },

  price: {
    color: '#81C784',
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 2,
  },


  // STATUS

  statusSection: {
    marginTop: 18,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2C',
  },

  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  activateButton: {
    flex: 1,
    minWidth: '30%',
    minHeight: 43,
    borderRadius: 10,
    backgroundColor: '#18251A',
    borderWidth: 1,
    borderColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 8,
  },

  activateText: {
    color: '#81C784',
    fontSize: 12,
    fontWeight: 'bold',
  },

  cancelButton: {
    flex: 1,
    minWidth: '30%',
    minHeight: 43,
    borderRadius: 10,
    backgroundColor: '#2A1919',
    borderWidth: 1,
    borderColor: '#5A2929',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 8,
  },

  cancelText: {
    color: '#EF5350',
    fontSize: 12,
    fontWeight: 'bold',
  },

  finishButton: {
    flex: 1,
    minWidth: '30%',
    minHeight: 43,
    borderRadius: 10,
    backgroundColor: '#252525',
    borderWidth: 1,
    borderColor: '#444444',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 8,
  },

  finishText: {
    color: '#BDBDBD',
    fontSize: 12,
    fontWeight: 'bold',
  },

});

