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


  if (loading) {

    return (

      <View style={styles.center}>

        <ActivityIndicator
          size="large"
        />

        <Text style={styles.loadingText}>
          Učitavanje rezervacija...
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
        Rezervacije
      </Text>


      {rezervacije.length === 0 ? (

        <View style={styles.emptyContainer}>

          <Text style={styles.emptyText}>
            Trenutno nema rezervacija.
          </Text>

        </View>

      ) : (

        rezervacije.map(
          (rezervacija) => (

            <View
              key={rezervacija.rezervacija_id}
              style={styles.card}
            >

              <Text style={styles.cardTitle}>
                Rezervacija #
                {rezervacija.rezervacija_id}
              </Text>


              <Text style={styles.label}>
                Korisnik
              </Text>

              <Text style={styles.value}>
                {rezervacija.korisnik_ime}
              </Text>


              <Text style={styles.email}>
                {rezervacija.korisnik_email}
              </Text>


              <Text style={styles.label}>
                Kamp
              </Text>

              <Text style={styles.value}>
                {rezervacija.kamp_naziv}
              </Text>


              <Text style={styles.label}>
                Period
              </Text>

              <Text style={styles.value}>
                {rezervacija.datum_prijave}
                {' → '}
                {rezervacija.datum_odjave}
              </Text>


              <Text style={styles.label}>
                Ukupna cijena
              </Text>

              <Text style={styles.price}>
                {Number(
                  rezervacija.ukupna_cijena
                ).toFixed(2)} KM
              </Text>


              <Text style={styles.label}>
  Status
</Text>

<Text style={styles.status}>
  {rezervacija.status}
</Text>

<View style={styles.statusButtons}>

  {rezervacija.status !== 'aktivna' && (

    <TouchableOpacity
      style={styles.statusButton}
      onPress={() =>
        promijeniStatus(
          rezervacija.rezervacija_id,
          'aktivna'
        )
      }
    >

      <Text style={styles.statusButtonText}>
        Aktivna
      </Text>

    </TouchableOpacity>

  )}


  {rezervacija.status !== 'otkazana' && (

    <TouchableOpacity
      style={styles.statusButton}
      onPress={() =>
        promijeniStatus(
          rezervacija.rezervacija_id,
          'otkazana'
        )
      }
    >

      <Text style={styles.statusButtonText}>
        Otkazana
      </Text>

    </TouchableOpacity>

  )}


  {rezervacija.status !== 'zavrsena' && (

    <TouchableOpacity
      style={styles.statusButton}
      onPress={() =>
        promijeniStatus(
          rezervacija.rezervacija_id,
          'zavrsena'
        )
      }
    >

      <Text style={styles.statusButtonText}>
        Završena
      </Text>

    </TouchableOpacity>

  )}

</View>


            </View>

          )
        )

      )}

    </ScrollView>

  );

}


const styles = StyleSheet.create({

    statusButtons: {
  flexDirection: 'row',
  gap: 8,
  marginTop: 12,
},

statusButton: {
  flex: 1,
  padding: 10,
  borderWidth: 1,
  borderRadius: 8,
  alignItems: 'center',
},

statusButtonText: {
  fontSize: 14,
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


  emptyContainer: {
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
    marginBottom: 15,
  },


  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },


  value: {
    fontSize: 16,
    marginTop: 3,
  },


  email: {
    fontSize: 14,
    marginTop: 3,
  },


  price: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 3,
  },


  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 3,
  },


  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 15,
  },


  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 8,
  },


  actionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },

});
