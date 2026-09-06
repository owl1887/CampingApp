import { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
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
  getMojeRezervacije,
  cancelReservation,
} from '@/services/api';


type Rezervacija = {
  id: string;
  kamp_id: string;

  kamp_naziv: string;
  kamp_opis: string;

  cijena_po_noci: string;

  datum_prijave: string;
  datum_odjave: string;

  ukupna_cijena: string;

  status: string;

  latitude: string;
  longitude: string;
  oprema: RezervacijaOprema[];
};


type RezervacijaOprema = {
  id: string;
  oprema_id: string;
  naziv: string;
  opis: string;
  kolicina: number;
  cijena_po_jedinici: string;
  broj_dana: number;
  ukupna_cijena: string;
};


export default function ReservationsScreen() {

  const [rezervacije, setRezervacije] =
    useState<Rezervacija[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);


  // =====================================================
  // UČITAVANJE REZERVACIJA
  // =====================================================

  async function ucitajRezervacije() {

    try {

      const token = await getToken();


      if (!token) {

        setRezervacije([]);

        return;
      }


      const data =
        await getMojeRezervacije(token);


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


  // =====================================================
  // AUTOMATSKO UČITAVANJE KADA SE OTVORI EKRAN
  // =====================================================

  useFocusEffect(
    useCallback(() => {

      ucitajRezervacije();

    }, [])
  );


  // =====================================================
  // OTKAZIVANJE REZERVACIJE
  // =====================================================

  async function otkaziRezervaciju(
    rezervacijaId: string
  ) {

    Alert.alert(
      'Otkazivanje rezervacije',
      'Da li ste sigurni da želite otkazati ovu rezervaciju?',
      [
        {
          text: 'Ne',
          style: 'cancel',
        },

        {
          text: 'Da',
          style: 'destructive',

          async onPress() {

            try {

              const token =
                await getToken();


              if (!token) {

                Alert.alert(
                  'Niste prijavljeni',
                  'Morate se prijaviti.'
                );

                return;
              }


              await cancelReservation(
                rezervacijaId,
                token
              );


              Alert.alert(
                'Uspješno',
                'Rezervacija je otkazana.'
              );


              await ucitajRezervacije();


            } catch (error: any) {

              console.error(
                'Greška pri otkazivanju rezervacije:',
                error
              );


              Alert.alert(
                'Greška',
                error.message ||
                'Nije moguće otkazati rezervaciju.'
              );

            }

          },

        },

      ]
    );

  }


  // =====================================================
  // OSVJEŽAVANJE REZERVACIJA
  // =====================================================

  async function osvjeziRezervacije() {

    setRefreshing(true);

    await ucitajRezervacije();

    setRefreshing(false);

  }


  // =====================================================
  // FORMATIRANJE DATUMA
  // =====================================================

  function formatirajDatum(
    datum: string
  ) {

    const d =
      new Date(datum);


    return d.toLocaleDateString(
      'bs-BA',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    );

  }


  // =====================================================
  // STATUS REZERVACIJE
  // =====================================================

  function statusTekst(status: string) {

    switch (status) {

      case 'aktivna':
        return 'Aktivna';

      case 'otkazana':
        return 'Otkazana';

      case 'zavrsena':
        return 'Završena';

      default:
        return status;

    }

  }


  function statusIkona(status: string) {

    switch (status) {

      case 'aktivna':
        return 'checkmark-circle-outline';

      case 'otkazana':
        return 'close-circle-outline';

      case 'zavrsena':
        return 'checkmark-done-circle-outline';

      default:
        return 'help-circle-outline';

    }

  }


  // =====================================================
  // EKRAN UČITAVANJA
  // =====================================================

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


  // =====================================================
  // GLAVNI EKRAN
  // =====================================================

  return (

    <View style={styles.container}>

      {/* NASLOV */}

      <View style={styles.header}>

        <View style={styles.headerIconContainer}>

          <Ionicons
            name="calendar-outline"
            size={26}
            color="#81C784"
          />

        </View>

        <View>

          <Text style={styles.title}>
            Moje rezervacije
          </Text>

          <Text style={styles.subtitle}>
            Pregled vaših rezervacija
          </Text>

        </View>

      </View>


      {rezervacije.length === 0 ? (

        /* PRAZNO STANJE */

        <View style={styles.emptyContainer}>

          <View style={styles.emptyIconContainer}>

            <Ionicons
              name="calendar-outline"
              size={48}
              color="#81C784"
            />

          </View>

          <Text style={styles.emptyTitle}>
            Nemate rezervacija
          </Text>

          <Text style={styles.emptyText}>
            Trenutno nemate nijednu aktivnu ili prethodnu rezervaciju.
          </Text>

        </View>

      ) : (

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}

          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={osvjeziRezervacije}
              tintColor="#81C784"
              colors={['#81C784']}
            />
          }
        >

          {rezervacije.map(
            (rezervacija) => (

              <View
                key={rezervacija.id}
                style={styles.card}
              >

                {/* NAZIV KAMPA */}

                <View style={styles.cardHeader}>

                  <View style={styles.campIconContainer}>

                    <Ionicons
                      name="bonfire-outline"
                      size={24}
                      color="#81C784"
                    />

                  </View>

                  <View style={styles.cardTitleContainer}>

                    <Text style={styles.cardTitle}>
                      {rezervacija.kamp_naziv}
                    </Text>

                    <Text style={styles.reservationNumber}>
                      Rezervacija #{rezervacija.id}
                    </Text>

                  </View>

                </View>


                {/* OPIS KAMPA */}

                <Text style={styles.description}>
                  {rezervacija.kamp_opis}
                </Text>


                <View style={styles.separator} />


                {/* DATUMI */}

                <View style={styles.infoRow}>

                  <View style={styles.infoIconContainer}>

                    <Ionicons
                      name="log-in-outline"
                      size={20}
                      color="#81C784"
                    />

                  </View>

                  <View style={styles.infoTextContainer}>

                    <Text style={styles.infoLabel}>
                      Prijava
                    </Text>

                    <Text style={styles.infoValue}>
                      {formatirajDatum(
                        rezervacija.datum_prijave
                      )}
                    </Text>

                  </View>

                </View>


                <View style={styles.infoRow}>

                  <View style={styles.infoIconContainer}>

                    <Ionicons
                      name="log-out-outline"
                      size={20}
                      color="#81C784"
                    />

                  </View>

                  <View style={styles.infoTextContainer}>

                    <Text style={styles.infoLabel}>
                      Odjava
                    </Text>

                    <Text style={styles.infoValue}>
                      {formatirajDatum(
                        rezervacija.datum_odjave
                      )}
                    </Text>

                  </View>

                </View>


                {/* CIJENA */}

                <View style={styles.infoRow}>

                  <View style={styles.infoIconContainer}>

                    <Ionicons
                      name="pricetag-outline"
                      size={20}
                      color="#81C784"
                    />

                  </View>

                  <View style={styles.infoTextContainer}>

                    <Text style={styles.infoLabel}>
                      Cijena po noći
                    </Text>

                    <Text style={styles.infoValue}>
                      {rezervacija.cijena_po_noci} KM
                    </Text>

                  </View>

                </View>


                {/* DODATNA OPREMA */}

                {rezervacija.oprema &&
                  rezervacija.oprema.length > 0 && (

                  <View style={styles.equipmentSection}>

                    <View style={styles.equipmentHeader}>

                      <Ionicons
                        name="construct-outline"
                        size={20}
                        color="#81C784"
                      />

                      <Text style={styles.equipmentTitle}>
                        Dodatna oprema
                      </Text>

                    </View>


                    {rezervacija.oprema.map(
                      (stavka) => (

                        <View
                          key={stavka.id}
                          style={styles.equipmentItem}
                        >

                          <View style={styles.equipmentTopRow}>

                            <Text style={styles.equipmentName}>
                              {stavka.naziv}
                            </Text>

                            <Text style={styles.equipmentQuantity}>
                              × {stavka.kolicina}
                            </Text>

                          </View>


                          <Text style={styles.equipmentDetails}>
                            {Number(
                              stavka.cijena_po_jedinici
                            ).toFixed(2)} KM × {stavka.kolicina} × {stavka.broj_dana} dana
                          </Text>


                          <Text style={styles.equipmentTotal}>
                            {Number(
                              stavka.ukupna_cijena
                            ).toFixed(2)} KM
                          </Text>

                        </View>

                      )
                    )}

                  </View>

                )}


                {/* UKUPNA CIJENA */}

                <View style={styles.totalContainer}>

                  <Text style={styles.totalLabel}>
                    Ukupna cijena
                  </Text>

                  <Text style={styles.total}>
                    {rezervacija.ukupna_cijena} KM
                  </Text>

                </View>


                {/* STATUS */}

                <View
                  style={[
                    styles.statusBadge,
                    rezervacija.status === 'aktivna'
                      ? styles.statusActive
                      : rezervacija.status === 'otkazana'
                        ? styles.statusCancelled
                        : styles.statusFinished,
                  ]}
                >

                  <Ionicons
                    name={statusIkona(rezervacija.status) as any}
                    size={18}
                    color={
                      rezervacija.status === 'aktivna'
                        ? '#81C784'
                        : rezervacija.status === 'otkazana'
                          ? '#EF5350'
                          : '#BDBDBD'
                    }
                  />

                  <Text
                    style={[
                      styles.statusText,
                      rezervacija.status === 'aktivna'
                        ? styles.statusTextActive
                        : rezervacija.status === 'otkazana'
                          ? styles.statusTextCancelled
                          : styles.statusTextFinished,
                    ]}
                  >
                    {statusTekst(rezervacija.status)}
                  </Text>

                </View>


                {/* DUGME DETALJI */}

                <TouchableOpacity
                  style={styles.detailsButton}

                  onPress={() =>
                    router.push(
                      `/reservation-details?id=${rezervacija.id}`
                    )
                  }
                >

                  <Ionicons
                    name="eye-outline"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text style={styles.detailsButtonText}>
                    DETALJI
                  </Text>

                </TouchableOpacity>


                {/* DUGME OTKAZIVANJE */}

                {rezervacija.status === 'aktivna' && (

                  <TouchableOpacity
                    style={styles.cancelButton}

                    onPress={() =>
                      otkaziRezervaciju(
                        rezervacija.id
                      )
                    }
                  >

                    <Ionicons
                      name="close-circle-outline"
                      size={19}
                      color="#EF5350"
                    />

                    <Text style={styles.cancelButtonText}>
                      OTKAŽI REZERVACIJU
                    </Text>

                  </TouchableOpacity>

                )}

              </View>

            )
          )}

        </ScrollView>

      )}

    </View>

  );

}


// =====================================================
// STILOVI
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 20,
    paddingTop: 20,
  },


  // =====================================================
  // HEADER
  // =====================================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },


  headerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },


  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },


  subtitle: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 2,
  },


  // =====================================================
  // LOADING
  // =====================================================

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },


  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#BDBDBD',
  },


  // =====================================================
  // LISTA
  // =====================================================

  list: {
    flex: 1,
  },


  listContent: {
    paddingBottom: 25,
  },


  // =====================================================
  // KARTICA
  // =====================================================

  card: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },


  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },


  campIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },


  cardTitleContainer: {
    flex: 1,
  },


  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },


  reservationNumber: {
    fontSize: 12,
    color: '#757575',
    marginTop: 3,
  },


  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#BDBDBD',
    marginBottom: 5,
  },


  separator: {
    height: 1,
    backgroundColor: '#2C2C2C',
    marginVertical: 14,
  },


  // =====================================================
  // INFORMACIJE
  // =====================================================

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },


  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },


  infoTextContainer: {
    flex: 1,
  },


  infoLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 2,
  },


  infoValue: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },


  // =====================================================
  // DODATNA OPREMA
  // =====================================================

  equipmentSection: {
    marginTop: 8,
    marginBottom: 12,
  },


  equipmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },


  equipmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },


  equipmentItem: {
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 10,
    padding: 11,
    marginBottom: 8,
  },


  equipmentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },


  equipmentName: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },


  equipmentQuantity: {
    fontSize: 14,
    color: '#81C784',
    fontWeight: 'bold',
    marginLeft: 8,
  },


  equipmentDetails: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 5,
  },


  equipmentTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#81C784',
    marginTop: 5,
  },


  // =====================================================
  // UKUPNA CIJENA
  // =====================================================

  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2C',
    paddingTop: 13,
    marginTop: 4,
    marginBottom: 12,
  },


  totalLabel: {
    fontSize: 15,
    color: '#BDBDBD',
  },


  total: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#81C784',
  },


  // =====================================================
  // STATUS
  // =====================================================

  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 13,
  },


  statusActive: {
    backgroundColor: '#1B3320',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },


  statusCancelled: {
    backgroundColor: '#351B1B',
    borderWidth: 1,
    borderColor: '#5A2929',
  },


  statusFinished: {
    backgroundColor: '#292929',
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },


  statusText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  },


  statusTextActive: {
    color: '#81C784',
  },


  statusTextCancelled: {
    color: '#EF5350',
  },


  statusTextFinished: {
    color: '#BDBDBD',
  },


  // =====================================================
  // DUGME DETALJI
  // =====================================================

  detailsButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 2,
  },


  detailsButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 7,
  },


  // =====================================================
  // DUGME OTKAZIVANJE
  // =====================================================

  cancelButton: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#5A2929',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 9,
  },


  cancelButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#EF5350',
    marginLeft: 7,
  },


  // =====================================================
  // PRAZNO STANJE
  // =====================================================

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingBottom: 60,
  },


  emptyIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },


  emptyTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },


  emptyText: {
    fontSize: 15,
    color: '#9E9E9E',
    textAlign: 'center',
    lineHeight: 21,
  },

});