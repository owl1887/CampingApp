import { getToken } from '@/services/auth';
import { getReservationById } from '@/services/api';

import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';


type Rezervacija = {
  id: string;
  korisnik_id: string;
  kamp_id: string;

  kamp_naziv: string;
  kamp_opis: string;

  cijena_po_noci: string;

  karakteristike?: {
    wifi?: boolean;
    struja?: boolean;
    parking?: boolean;
  };

  latitude?: string;
  longitude?: string;

  datum_prijave: string;
  datum_odjave: string;

  ukupna_cijena: string;

  status: string;
  oprema: RezervacijaOprema[];
};

type RezervacijaOprema = {
  id: string;
  oprema_id: string;
  naziv: string;
  opis?: string;
  kolicina: number;
  cijena_po_jedinici: string;
  broj_dana: number;
  ukupna_cijena: string;
};


export default function ReservationDetailsScreen() {

  const { id } = useLocalSearchParams();

  const router = useRouter();

  const [rezervacija, setRezervacija] =
    useState<Rezervacija | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  useEffect(() => {

    async function ucitajRezervaciju() {

      try {

        const token = await getToken();

        if (!token) {

          setError(
            'Morate biti prijavljeni.'
          );

          return;
        }


        const data =
          await getReservationById(
            String(id),
            token
          );


        setRezervacija(
          data.rezervacija
        );


      } catch (error: any) {

        console.error(
          'Greška pri učitavanju rezervacije:',
          error
        );

        setError(
          error.message ||
          'Nije moguće učitati detalje rezervacije.'
        );

      } finally {

        setLoading(false);

      }
    }


    ucitajRezervaciju();

  }, [id]);


  function formatirajDatum(
    datum: string
  ) {

    return new Date(
      datum
    ).toLocaleDateString(
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
          Učitavanje detalja...
        </Text>

      </View>

    );

  }


  if (error || !rezervacija) {

    return (

      <View style={styles.center}>

        <Text style={styles.error}>
          {error ||
            'Rezervacija nije pronađena.'}
        </Text>

      </View>

    );

  }


  return (

    <ScrollView
      style={styles.container}
    >

      <View style={styles.content}>


        <Text style={styles.title}>
          Detalji rezervacije
        </Text>


        <Text style={styles.campName}>
          {rezervacija.kamp_naziv}
        </Text>


        <Text style={styles.description}>
          {rezervacija.kamp_opis}
        </Text>


        <View style={styles.separator} />


        <Text style={styles.sectionTitle}>
          Period boravka
        </Text>


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


        <View style={styles.separator} />


        <Text style={styles.sectionTitle}>
          Cijena
        </Text>


        <Text style={styles.info}>
          Cijena po noći:{' '}
          {rezervacija.cijena_po_noci} KM
        </Text>


        <Text style={styles.total}>
          Ukupna cijena:{' '}
          {rezervacija.ukupna_cijena} KM
        </Text>

        <View style={styles.separator} />

<Text style={styles.sectionTitle}>
  Dodatna oprema
</Text>

{rezervacija.oprema && rezervacija.oprema.length > 0 ? (

  rezervacija.oprema.map((stavka) => (

    <View
      key={stavka.id}
      style={styles.equipmentCard}
    >

      <Text style={styles.equipmentName}>
        {stavka.naziv}
      </Text>

      <Text style={styles.info}>
        Količina: {stavka.kolicina}
      </Text>

      <Text style={styles.info}>
        {stavka.cijena_po_jedinici} KM × {stavka.kolicina} × {stavka.broj_dana} dana
      </Text>

      <Text style={styles.equipmentTotal}>
        Ukupno: {stavka.ukupna_cijena} KM
      </Text>

    </View>

  ))

) : (

  <Text style={styles.info}>
    Nije odabrana dodatna oprema.
  </Text>

)}


        <View style={styles.separator} />


        <Text style={styles.sectionTitle}>
          Karakteristike kampa
        </Text>


        <View style={styles.features}>

          {rezervacija.karakteristike?.wifi && (

            <Text style={styles.feature}>
              ✓ WiFi
            </Text>

          )}


          {rezervacija.karakteristike?.struja && (

            <Text style={styles.feature}>
              ✓ Struja
            </Text>

          )}


          {rezervacija.karakteristike?.parking && (

            <Text style={styles.feature}>
              ✓ Parking
            </Text>

          )}

        </View>


        <View style={styles.separator} />


        <Text style={styles.sectionTitle}>
          Lokacija
        </Text>


        <Text style={styles.info}>
          Latitude:{' '}
          {rezervacija.latitude}
        </Text>


        <Text style={styles.info}>
          Longitude:{' '}
          {rezervacija.longitude}
        </Text>


        <View style={styles.separator} />


        <Text style={styles.status}>
          Status: {rezervacija.status}
        </Text>


      </View>

    </ScrollView>

  );
}


const styles = StyleSheet.create({
  equipmentCard: {
  padding: 12,
  borderWidth: 1,
  borderRadius: 10,
  marginBottom: 10,
},

equipmentName: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 6,
},

equipmentTotal: {
  fontSize: 16,
  fontWeight: 'bold',
  marginTop: 4,
},

  container: {
    flex: 1,
  },

  content: {
    padding: 20,
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
    fontSize: 16,
    textAlign: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  campName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  info: {
    fontSize: 16,
    marginBottom: 8,
  },

  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },

  features: {
    gap: 8,
  },

  feature: {
    fontSize: 16,
  },

  separator: {
    borderBottomWidth: 1,
    marginVertical: 20,
  },

  status: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 30,
  },

});