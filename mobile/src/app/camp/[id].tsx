import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { getKampById } from '@/services/api';

type Kamp = {
  id: number;
  naziv: string;
  opis: string;
  cijena_po_noci: number;
  karakteristike?: {
    wifi?: boolean;
    struja?: boolean;
    parking?: boolean;
  };
  latitude?: number;
  longitude?: number;
};

export default function CampDetailsScreen() {

  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [kamp, setKamp] = useState<Kamp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {

    async function ucitajKamp() {

      try {

        const kampId = Number(id);

        const podaci = await getKampById(kampId);

        setKamp(podaci);

      } catch (error) {

        console.error(error);

        setError(
          'Nije moguće učitati podatke o kampu.'
        );

      } finally {

        setLoading(false);

      }
    }

    ucitajKamp();

  }, [id]);


  if (loading) {

    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  }


  if (error || !kamp) {

    return (
      <View style={styles.center}>

        <Text style={styles.error}>
          {error || 'Kamp nije pronađen.'}
        </Text>

      </View>
    );

  }


  return (
    <ScrollView style={styles.container}>

      {/* Slika */}

      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageText}>
          SLIKA KAMPA
        </Text>
      </View>


      {/* Informacije */}

      <View style={styles.content}>

        <Text style={styles.title}>
          {kamp.naziv}
        </Text>


        <Text style={styles.description}>
          {kamp.opis}
        </Text>


        <Text style={styles.price}>
          {Number(kamp.cijena_po_noci)} € / noć
        </Text>


        {/* Karakteristike */}

        <Text style={styles.sectionTitle}>
          Karakteristike
        </Text>


        <View style={styles.features}>

          {kamp.karakteristike?.wifi && (
            <Text style={styles.feature}>
              ✓ WiFi
            </Text>
          )}

          {kamp.karakteristike?.struja && (
            <Text style={styles.feature}>
              ✓ Struja
            </Text>
          )}

          {kamp.karakteristike?.parking && (
            <Text style={styles.feature}>
              ✓ Parking
            </Text>
          )}

        </View>


        {/* Lokacija */}

        {kamp.latitude && kamp.longitude && (

          <>
            <Text style={styles.sectionTitle}>
              Lokacija
            </Text>

            <Text>
              Latitude: {kamp.latitude}
            </Text>

            <Text>
              Longitude: {kamp.longitude}
            </Text>
          </>

        )}


        {/* Rezervacija */}

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            // Za sada samo vraćamo korisnika
            // na prethodnu stranicu.
            router.back();
          }}
        >

          <Text style={styles.buttonText}>
            Rezerviši kamp
          </Text>

        </TouchableOpacity>

      </View>

    </ScrollView>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  imagePlaceholder: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageText: {
    fontSize: 20,
  },

  content: {
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },

  price: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },

  features: {
    gap: 8,
  },

  feature: {
    fontSize: 16,
  },

  button: {
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  error: {
    fontSize: 16,
    textAlign: 'center',
  },

});