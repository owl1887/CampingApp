import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import { getKampovi } from '@/services/api';


type Kamp = {
  id: number;
  naziv: string;
  opis: string;
  cijena_po_noci: number;
};


export default function SearchScreen() {

  const router = useRouter();

  const [kampovi, setKampovi] =
    useState<Kamp[]>([]);

  const [pretraga, setPretraga] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  useEffect(() => {

    async function ucitajKampove() {

      try {

        const podaci =
          await getKampovi();

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


  const filtriraniKampovi =
    kampovi.filter((kamp) => {

      const tekst =
        pretraga.toLowerCase().trim();

      if (!tekst) {
        return true;
      }

      return (
        kamp.naziv
          .toLowerCase()
          .includes(tekst)
        ||
        kamp.opis
          .toLowerCase()
          .includes(tekst)
      );

    });


  if (loading) {

    return (
      <View style={styles.center}>

        <ActivityIndicator
          size="large"
        />

        <Text style={styles.loadingText}>
          Učitavanje kampova...
        </Text>

      </View>
    );

  }


  if (error) {

    return (
      <View style={styles.center}>

        <Text style={styles.error}>
          {error}
        </Text>

      </View>
    );

  }


  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Pretraga kamp mjesta
      </Text>


      <TextInput
        style={styles.searchInput}
        placeholder="Pretraži kampove..."
        value={pretraga}
        onChangeText={setPretraga}
        autoCapitalize="none"
      />


      {filtriraniKampovi.length === 0 ? (

        <View style={styles.emptyContainer}>

          <Text style={styles.emptyText}>
            Nema pronađenih kamp mjesta.
          </Text>

        </View>

      ) : (

        <FlatList
          data={filtriraniKampovi}
          keyExtractor={(item) =>
            item.id.toString()
          }

          contentContainerStyle={
            styles.list
          }

          renderItem={({ item }) => (

            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push(
                  `/camp/${item.id}`
                )
              }
            >

              <Text style={styles.cardTitle}>
                {item.naziv}
              </Text>


              <Text
                style={styles.description}
                numberOfLines={2}
              >
                {item.opis}
              </Text>


              <Text style={styles.price}>
                {Number(
                  item.cijena_po_noci
                ).toFixed(2)} KM / noć
              </Text>

            </TouchableOpacity>

          )}
        />

      )}

    </View>

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
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  searchInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },

  list: {
    paddingBottom: 20,
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

  price: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },

  error: {
    fontSize: 16,
    textAlign: 'center',
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