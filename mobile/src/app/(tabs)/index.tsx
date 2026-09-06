import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import CampCard from '@/components/CampCard';
import CampsMap from '@/components/CampsMap';
import { getKampovi } from '@/services/api';

type Kamp = {
  id: number;
  naziv: string;
  opis: string;
  cijena_po_noci: number;
  slika_url?: string;
};

export default function HomeScreen() {

  const router = useRouter();

  const [kampovi, setKampovi] =
    useState<Kamp[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


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
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}

      <View style={styles.header}>

        <View style={styles.headerText}>

          <Text style={styles.welcome}>
            Dobrodošli!
          </Text>

          <Text style={styles.subtitle}>
            Pronađite savršeno mjesto
            za vaše kampovanje.
          </Text>

        </View>

        <View style={styles.logoContainer}>

          <Ionicons
            name="bonfire-outline"
            size={48}
            color="#81C784"
          />

        </View>

      </View>


      {/* KAMP MJESTA */}

      <View style={styles.sectionHeader}>

        <View>

          <Text style={styles.sectionTitle}>
            Kamp mjesta
          </Text>

          {!loading && !error && (
            <Text style={styles.sectionSubtitle}>
              {kampovi.length}{' '}
              {kampovi.length === 1
                ? 'dostupno mjesto'
                : 'dostupnih mjesta'}
            </Text>
          )}

        </View>

      </View>


      {/* LOADING */}

      {loading && (

        <View style={styles.loadingContainer}>

          <ActivityIndicator
            size="large"
            color="#81C784"
          />

          <Text style={styles.loadingText}>
            Učitavanje kamp mjesta...
          </Text>

        </View>

      )}


      {/* ERROR */}

      {error !== '' && (

        <View style={styles.errorContainer}>

          <Ionicons
            name="alert-circle-outline"
            size={42}
            color="#EF5350"
          />

          <Text style={styles.error}>
            {error}
          </Text>

        </View>

      )}


      {/* KARTICE */}

      {!loading &&
        !error &&
        kampovi.length > 0 && (

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.cardsContainer
          }
        >

          {kampovi.map((kamp) => (

            <CampCard
              key={kamp.id}

              naziv={kamp.naziv}

              opis={kamp.opis}

              cijena={
                Number(
                  kamp.cijena_po_noci
                )
              }

              slikaUrl={kamp.slika_url}

              onPress={() => {
                router.push(
                  `/camp/${kamp.id}`
                );
              }}
            />

          ))}

        </ScrollView>

      )}


      {/* NEMA KAMPOVA */}

      {!loading &&
        !error &&
        kampovi.length === 0 && (

        <View style={styles.emptyContainer}>

          <Ionicons
            name="bonfire-outline"
            size={50}
            color="#81C784"
          />

          <Text style={styles.emptyTitle}>
            Trenutno nema kamp mjesta
          </Text>

          <Text style={styles.emptyText}>
            Pokušajte ponovo kasnije.
          </Text>

        </View>

      )}


      {/* MAPA */}

      {!loading &&
        !error &&
        kampovi.length > 0 && (

        <View style={styles.mapSection}>

          <View style={styles.mapHeader}>

            <Ionicons
              name="location-outline"
              size={26}
              color="#81C784"
            />

            <View style={styles.mapHeaderText}>

              <Text style={styles.sectionTitle}>
                Kampovi na mapi
              </Text>

              <Text style={styles.mapSubtitle}>
                Pogledajte lokacije dostupnih
                kamp mjesta.
              </Text>

            </View>

          </View>

          <CampsMap />

        </View>

      )}

    </ScrollView>

  );
}


const styles = StyleSheet.create({

  /* GLAVNI KONTEJNER */

  container: {
    flex: 1,
    backgroundColor: '#121212',
  },


  content: {
    padding: 20,
    paddingBottom: 40,
  },


  /* HEADER */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },


  headerText: {
    flex: 1,
    paddingRight: 15,
  },


  welcome: {
    fontSize: 29,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },


  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    marginTop: 7,
    color: '#BDBDBD',
  },


  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
  },


  /* SEKCIJA */

  sectionHeader: {
    marginBottom: 15,
  },


  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },


  sectionSubtitle: {
    fontSize: 14,
    marginTop: 4,
    color: '#9E9E9E',
  },


  /* KARTICE */

  cardsContainer: {
    paddingRight: 5,
  },


  /* LOADING */

  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },


  loadingText: {
    fontSize: 15,
    marginTop: 10,
    color: '#BDBDBD',
  },


  /* ERROR */

  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },


  error: {
    fontSize: 16,
    textAlign: 'center',
    color: '#EF5350',
    marginTop: 10,
  },


  /* EMPTY */

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 35,
  },


  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },


  emptyText: {
    fontSize: 14,
    marginTop: 5,
    color: '#9E9E9E',
  },


  /* MAPA */

  mapSection: {
    marginTop: 35,
  },


  mapHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },


  mapHeaderText: {
    flex: 1,
    marginLeft: 10,
  },


  mapSubtitle: {
    fontSize: 14,
    marginTop: 5,
    color: '#9E9E9E',
  },

});