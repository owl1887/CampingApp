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

  karakteristike?: {
    wifi?: boolean;
    struja?: boolean;
    parking?: boolean;
  };
};


export default function SearchScreen() {

  const router = useRouter();

  const [kampovi, setKampovi] =
    useState<Kamp[]>([]);

  const [pretraga, setPretraga] =
    useState('');

  const [minimalnaCijena, setMinimalnaCijena] =
    useState('');



  const [maksimalnaCijena, setMaksimalnaCijena] =
    useState('');

    const [wifiFilter, setWifiFilter] =
  useState(false);

const [strujaFilter, setStrujaFilter] =
  useState(false);

const [parkingFilter, setParkingFilter] =
  useState(false);

  const [primijeniFilter, setPrimijeniFilter] =
    useState(false);

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


      // PRETRAGA PO TEKSTU

      const odgovaraTekst =
        !tekst ||
        kamp.naziv
          .toLowerCase()
          .includes(tekst) ||
        kamp.opis
          .toLowerCase()
          .includes(tekst);


      if (!odgovaraTekst) {
        return false;
      }


      // AKO FILTER NIJE AKTIVAN

      if (!primijeniFilter) {
        return true;
      }


      // MINIMALNA CIJENA

      if (
        minimalnaCijena &&
        Number(kamp.cijena_po_noci) <
        Number(minimalnaCijena)
      ) {

        return false;

      }


      // MAKSIMALNA CIJENA

      if (
  maksimalnaCijena &&
  Number(kamp.cijena_po_noci) >
  Number(maksimalnaCijena)
) {

  return false;

}


// WIFI

if (
  wifiFilter &&
  !kamp.karakteristike?.wifi
) {

  return false;

}


// STRUJA

if (
  strujaFilter &&
  !kamp.karakteristike?.struja
) {

  return false;

}


// PARKING

if (
  parkingFilter &&
  !kamp.karakteristike?.parking
) {

  return false;

}


return true;

    });


  function primijeniCjenovniFilter() {

    setPrimijeniFilter(true);

  }


  function resetujFiltere() {

  setMinimalnaCijena('');

  setMaksimalnaCijena('');

  setWifiFilter(false);

  setStrujaFilter(false);

  setParkingFilter(false);

  setPrimijeniFilter(false);

}


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


      {/* PRETRAGA */}

      <TextInput
        style={styles.searchInput}
        placeholder="Pretraži kampove..."
        value={pretraga}
        onChangeText={setPretraga}
        autoCapitalize="none"
      />


      {/* FILTERI */}

      <Text style={styles.filterTitle}>
        Cijena po noći
      </Text>


      <View style={styles.priceRow}>

        <TextInput
          style={styles.priceInput}
          placeholder="Od"
          value={minimalnaCijena}
          onChangeText={setMinimalnaCijena}
          keyboardType="numeric"
        />


        <Text style={styles.priceSeparator}>
          -
        </Text>


        <TextInput
          style={styles.priceInput}
          placeholder="Do"
          value={maksimalnaCijena}
          onChangeText={setMaksimalnaCijena}
          keyboardType="numeric"
        />

      </View>


      <View style={styles.buttonRow}>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={primijeniCjenovniFilter}
        >

          <Text style={styles.filterButtonText}>
            Primijeni filter
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetujFiltere}
        >

          <Text style={styles.resetButtonText}>
            Resetuj
          </Text>

        </TouchableOpacity>

      </View>

      <View style={styles.featuresRow}>

  <TouchableOpacity
    style={[
      styles.featureButton,
      wifiFilter && styles.featureButtonActive,
    ]}
    onPress={() =>
      setWifiFilter(!wifiFilter)
    }
  >

    <Text style={styles.featureButtonText}>
      📶 WiFi
    </Text>

  </TouchableOpacity>


  <TouchableOpacity
    style={[
      styles.featureButton,
      strujaFilter && styles.featureButtonActive,
    ]}
    onPress={() =>
      setStrujaFilter(!strujaFilter)
    }
  >

    <Text style={styles.featureButtonText}>
      ⚡ Struja
    </Text>

  </TouchableOpacity>


  <TouchableOpacity
    style={[
      styles.featureButton,
      parkingFilter && styles.featureButtonActive,
    ]}
    onPress={() =>
      setParkingFilter(!parkingFilter)
    }
  >

    <Text style={styles.featureButtonText}>
      🚗 Parking
    </Text>

  </TouchableOpacity>

</View>


      {/* REZULTATI */}

      <Text style={styles.resultCount}>
        Pronađeno:{' '}
        {filtriraniKampovi.length}
      </Text>


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

  featuresRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 10,
  marginBottom: 15,
},

featureButton: {
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 8,
  borderWidth: 1,
},

featureButtonActive: {
  borderWidth: 2,
},

featureButtonText: {
  fontSize: 14,
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


  filterTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
  },


  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },


  priceInput: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },


  priceSeparator: {
    marginHorizontal: 10,
    fontSize: 18,
  },


  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },


  filterButton: {
    flex: 1,
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },


  filterButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },


  resetButton: {
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    minWidth: 90,
  },


  resetButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },


  resultCount: {
    fontSize: 15,
    marginBottom: 10,
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