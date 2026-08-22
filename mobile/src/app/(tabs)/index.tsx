import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import CampCard from '@/components/CampCard';
import { getKampovi } from '@/services/api';

type Kamp = {
  id: number;
  naziv: string;
  opis: string;
  cijena_po_noci: number;
};

export default function HomeScreen() {

  const [kampovi, setKampovi] = useState<Kamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {

    async function ucitajKampove() {

      try {

        const podaci = await getKampovi();

        setKampovi(podaci);

      } catch (error) {

        console.error(error);

        setError(
          'Nije moguće učitati kamp mjesta.'
        );

      } finally {

        setLoading(false);

      }
    }

    ucitajKampove();

  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >

      <View style={styles.header}>

        <View>

          <Text style={styles.welcome}>
            Dobrodošli! 👋
          </Text>

          <Text style={styles.subtitle}>
            Pronađite savršeno mjesto za kampovanje.
          </Text>

        </View>

        <Text style={styles.logo}>
          ⛺
        </Text>

      </View>


      <Text style={styles.sectionTitle}>
        Kamp mjesta
      </Text>


      {loading && (
        <ActivityIndicator size="large" />
      )}


      {error !== '' && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}


      {!loading && !error && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >

          {kampovi.map((kamp) => (

            <CampCard
              key={kamp.id}
              naziv={kamp.naziv}
              opis={kamp.opis}
              cijena={Number(kamp.cijena_po_noci)}
            />

          ))}

        </ScrollView>
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
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },

  welcome: {
    fontSize: 25,
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: 15,
    marginTop: 5,
    maxWidth: 280,
  },

  logo: {
    fontSize: 40,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  error: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },

});