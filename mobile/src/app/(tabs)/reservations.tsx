
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
};


export default function ReservationsScreen() {

  const [rezervacije, setRezervacije] =
    useState<Rezervacija[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);


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


  useFocusEffect(
    useCallback(() => {

      ucitajRezervacije();

    }, [])
  );
//funkcija za otkazivanje rervazijaaaaaaaa


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

            const token = await getToken();

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

//osvjezi rezervacije

  async function osvjeziRezervacije() {

    setRefreshing(true);

    await ucitajRezervacije();

    setRefreshing(false);

  }


  function formatirajDatum(
    datum: string
  ) {

    const d = new Date(datum);

    return d.toLocaleDateString(
      'bs-BA',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    );
  }


  if (loading) {

    return (

      <View style={styles.center}>

        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Učitavanje rezervacija...
        </Text>

      </View>

    );

  }


  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Moje rezervacije
      </Text>


      {rezervacije.length === 0 ? (

        <View style={styles.emptyContainer}>

          <Text style={styles.emptyText}>
            Trenutno nemate rezervacija.
          </Text>

        </View>

      ) : (

        <ScrollView
          style={styles.list}

          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={osvjeziRezervacije}
            />
          }
        >

          {rezervacije.map(
            (rezervacija) => (

              <View
                key={rezervacija.id}
                style={styles.card}
              >

                <Text style={styles.cardTitle}>
                  {rezervacija.kamp_naziv}
                </Text>


                <Text style={styles.description}>
                  {rezervacija.kamp_opis}
                </Text>


                <View style={styles.separator} />


                <Text style={styles.info}>
                  Prijava:{' '}
                  {formatirajDatum(
                    rezervacija.datum_prijave
                  )}
                </Text>


                <Text style={styles.info}>
                  Odjava:{' '}
                  {formatirajDatum(
                    rezervacija.datum_odjave
                  )}
                </Text>


                <Text style={styles.info}>
                  Cijena po noći:{' '}
                  {rezervacija.cijena_po_noci} KM
                </Text>


                <Text style={styles.total}>
                  Ukupna cijena:{' '}
                  {rezervacija.ukupna_cijena} KM
                </Text>


                <Text style={styles.status}>
                  Status:{' '}
                  {rezervacija.status}
                </Text>

                  <TouchableOpacity
  style={styles.detailsButton}
  onPress={() =>
    router.push(
      `/reservation-details?id=${rezervacija.id}`
    )
  }
>

  <Text style={styles.detailsButtonText}>
    DETALJI
  </Text>

</TouchableOpacity>

                {rezervacija.status === 'aktivna' && (

  <TouchableOpacity
    style={styles.cancelButton}
    onPress={() =>
      otkaziRezervaciju(rezervacija.id)
    }
  >

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


const styles = StyleSheet.create({

  detailsButton: {
  marginTop: 15,
  padding: 12,
  borderRadius: 8,
  alignItems: 'center',
  borderWidth: 1,
},

detailsButtonText: {
  fontSize: 15,
  fontWeight: 'bold',
},

  cancelButton: {
  marginTop: 15,
  padding: 12,
  borderRadius: 8,
  alignItems: 'center',
  borderWidth: 1,
},

cancelButtonText: {
  fontSize: 15,
  fontWeight: 'bold',
},

  container: {
    flex: 1,
    padding: 20,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  list: {
    flex: 1,
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
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },

  separator: {
    borderBottomWidth: 1,
    marginVertical: 10,
  },

  info: {
    fontSize: 16,
    marginBottom: 7,
  },

  total: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 8,
  },

  status: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 17,
  },

});