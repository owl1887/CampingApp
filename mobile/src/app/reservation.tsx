import { getToken } from '@/services/auth';
import ProtectedScreen from '@/components/protected-screen';

import { useEffect, useState } from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import {
  createReservation,
  getKampById,
} from '@/services/api';


type Kamp = {
  id: number;
  naziv: string;
  cijena_po_noci: number;
};


export default function ReservationScreen() {

  const { kampId } = useLocalSearchParams();
  const router = useRouter();


  const [kamp, setKamp] =
    useState<Kamp | null>(null);

  const [loadingKamp, setLoadingKamp] =
    useState(true);


  const [datumPrijave, setDatumPrijave] =
    useState<Date | null>(null);

  const [datumOdjave, setDatumOdjave] =
    useState<Date | null>(null);


  const [showPrijava, setShowPrijava] =
    useState(false);

  const [showOdjava, setShowOdjava] =
    useState(false);


  const [loading, setLoading] =
    useState(false);


  useEffect(() => {

    async function ucitajKamp() {

      try {

        const podaci =
          await getKampById(Number(kampId));

        setKamp(podaci);

      } catch (error) {

        console.error(error);

        Alert.alert(
          'Greška',
          'Nije moguće učitati podatke o kampu.'
        );

      } finally {

        setLoadingKamp(false);

      }
    }


    ucitajKamp();

  }, [kampId]);


  function formatirajDatum(
    datum: Date | null
  ) {

    if (!datum) {
      return 'Odaberite datum';
    }

    const godina =
      datum.getFullYear();

    const mjesec =
      String(
        datum.getMonth() + 1
      ).padStart(2, '0');

    const dan =
      String(
        datum.getDate()
      ).padStart(2, '0');

    return `${dan}.${mjesec}.${godina}.`;

  }


  function formatirajDatumZaServer(
    datum: Date
  ) {

    const godina =
      datum.getFullYear();

    const mjesec =
      String(
        datum.getMonth() + 1
      ).padStart(2, '0');

    const dan =
      String(
        datum.getDate()
      ).padStart(2, '0');

    return `${godina}-${mjesec}-${dan}`;

  }


  function izracunajBrojNoci() {

    if (
      !datumPrijave ||
      !datumOdjave
    ) {
      return 0;
    }


    const razlika =
      datumOdjave.getTime() -
      datumPrijave.getTime();


    return Math.ceil(
      razlika /
      (1000 * 60 * 60 * 24)
    );

  }


  const brojNoci =
    izracunajBrojNoci();


  const ukupnaCijena =
    kamp && brojNoci > 0
      ? brojNoci *
        Number(kamp.cijena_po_noci)
      : 0;


  async function potvrdiRezervaciju() {

    if (
      !datumPrijave ||
      !datumOdjave
    ) {

      Alert.alert(
        'Greška',
        'Odaberite datum prijave i datum odjave.'
      );

      return;
    }


    if (datumOdjave <= datumPrijave) {

      Alert.alert(
        'Greška',
        'Datum odjave mora biti nakon datuma prijave.'
      );

      return;
    }


    const danas = new Date();

    danas.setHours(
      0,
      0,
      0,
      0
    );


    if (datumPrijave < danas) {

      Alert.alert(
        'Greška',
        'Datum prijave ne može biti u prošlosti.'
      );

      return;
    }


    const token =
      await getToken();


    if (!token) {

      Alert.alert(
        'Niste prijavljeni',
        'Morate se prijaviti prije rezervacije.'
      );

      router.push('/login');

      return;
    }


    try {

      setLoading(true);


      const rezultat =
        await createReservation(
          Number(kampId),
          formatirajDatumZaServer(
            datumPrijave
          ),
          formatirajDatumZaServer(
            datumOdjave
          ),
          token
        );


      Alert.alert(
        'Uspješna rezervacija',
        rezultat.message ||
        'Rezervacija je uspješno kreirana.'
      );


      router.replace(
        '/(tabs)/reservations'
      );


    } catch (error: any) {

      Alert.alert(
        'Greška',
        error.message ||
        'Nije moguće napraviti rezervaciju.'
      );

    } finally {

      setLoading(false);

    }

  }


  if (loadingKamp) {

    return (

      <View style={styles.center}>

        <Text>
          Učitavanje...
        </Text>

      </View>

    );

  }


  return (

    <ProtectedScreen>

      <View style={styles.container}>

        <Text style={styles.title}>
          Rezervacija
        </Text>


        <Text style={styles.campName}>
          {kamp?.naziv}
        </Text>


        <Text style={styles.label}>
          Cijena po noći
        </Text>


        <Text style={styles.price}>
          {Number(
            kamp?.cijena_po_noci || 0
          ).toFixed(2)} KM
        </Text>


        <Text style={styles.label}>
          Datum prijave
        </Text>


        <TouchableOpacity
          style={styles.dateButton}
          onPress={() =>
            setShowPrijava(true)
          }
        >

          <Text style={styles.dateText}>
            {formatirajDatum(
              datumPrijave
            )}
          </Text>

        </TouchableOpacity>


        {showPrijava && (

          <DateTimePicker
            value={
              datumPrijave ||
              new Date()
            }

            mode="date"

            minimumDate={
              new Date()
            }

            onChange={(
              event,
              selectedDate
            ) => {

              setShowPrijava(false);

              if (selectedDate) {

                setDatumPrijave(
                  selectedDate
                );

              }

            }}

          />

        )}


        <Text style={styles.label}>
          Datum odjave
        </Text>


        <TouchableOpacity
          style={styles.dateButton}
          onPress={() =>
            setShowOdjava(true)
          }
        >

          <Text style={styles.dateText}>
            {formatirajDatum(
              datumOdjave
            )}
          </Text>

        </TouchableOpacity>


        {showOdjava && (

          <DateTimePicker
            value={
              datumOdjave ||
              datumPrijave ||
              new Date()
            }

            mode="date"

            minimumDate={
              datumPrijave ||
              new Date()
            }

            onChange={(
              event,
              selectedDate
            ) => {

              setShowOdjava(false);

              if (selectedDate) {

                setDatumOdjave(
                  selectedDate
                );

              }

            }}

          />

        )}


        {brojNoci > 0 && (

          <View style={styles.summary}>

            <Text style={styles.summaryTitle}>
              Pregled rezervacije
            </Text>


            <Text style={styles.summaryText}>
              Broj noći: {brojNoci}
            </Text>


            <Text style={styles.summaryText}>
              Cijena po noći:{' '}
              {Number(
                kamp?.cijena_po_noci || 0
              ).toFixed(2)} KM
            </Text>


            <Text style={styles.total}>
              Ukupno:{' '}
              {ukupnaCijena.toFixed(2)} KM
            </Text>

          </View>

        )}


        <TouchableOpacity
          style={styles.button}
          onPress={
            potvrdiRezervaciju
          }
          disabled={
            loading ||
            !datumPrijave ||
            !datumOdjave
          }
        >

          <Text style={styles.buttonText}>

            {loading
              ? 'Slanje...'
              : 'Potvrdi rezervaciju'}

          </Text>

        </TouchableOpacity>


      </View>

    </ProtectedScreen>

  );

}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  campName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 7,
  },

  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
  },

  dateText: {
    fontSize: 16,
  },

  summary: {
    marginTop: 25,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },

  summaryTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  summaryText: {
    fontSize: 16,
    marginBottom: 7,
  },

  total: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },

  button: {
    marginTop: 25,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },

  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

});