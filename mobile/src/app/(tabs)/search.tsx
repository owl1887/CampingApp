
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

import { Ionicons } from '@expo/vector-icons';

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
          color="#81C784"
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

        <Ionicons
          name="alert-circle-outline"
          size={45}
          color="#EF5350"
        />

        <Text style={styles.error}>
          {error}
        </Text>

      </View>
    );

  }


  return (

    <View style={styles.container}>

      {/* NASLOV */}

      <View style={styles.header}>

        <View style={styles.headerIcon}>

          <Ionicons
            name="search-outline"
            size={28}
            color="#81C784"
          />

        </View>

        <View>

          <Text style={styles.title}>
            Pretraga
          </Text>

          <Text style={styles.subtitle}>
            Pronađite kamp prema svojim željama.
          </Text>

        </View>

      </View>


      {/* PRETRAGA */}

      <View style={styles.searchContainer}>

        <Ionicons
          name="search-outline"
          size={21}
          color="#9E9E9E"
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Pretraži kampove..."
          placeholderTextColor="#757575"
          value={pretraga}
          onChangeText={setPretraga}
          autoCapitalize="none"
        />

        {pretraga.length > 0 && (

          <TouchableOpacity
            onPress={() => setPretraga('')}
          >

            <Ionicons
              name="close-circle"
              size={21}
              color="#757575"
            />

          </TouchableOpacity>

        )}

      </View>


      {/* FILTERI */}

      <Text style={styles.filterTitle}>
        Cijena po noći
      </Text>


      <View style={styles.priceRow}>

        <View style={styles.priceInputContainer}>

          <Text style={styles.priceLabel}>
            Od
          </Text>

          <TextInput
            style={styles.priceInput}
            placeholder="0"
            placeholderTextColor="#757575"
            value={minimalnaCijena}
            onChangeText={setMinimalnaCijena}
            keyboardType="numeric"
          />

          <Text style={styles.currency}>
            KM
          </Text>

        </View>


        <Text style={styles.priceSeparator}>
          -
        </Text>


        <View style={styles.priceInputContainer}>

          <Text style={styles.priceLabel}>
            Do
          </Text>

          <TextInput
            style={styles.priceInput}
            placeholder="∞"
            placeholderTextColor="#757575"
            value={maksimalnaCijena}
            onChangeText={setMaksimalnaCijena}
            keyboardType="numeric"
          />

          <Text style={styles.currency}>
            KM
          </Text>

        </View>

      </View>


      {/* DUGMAD */}

      <View style={styles.buttonRow}>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={primijeniCjenovniFilter}
        >

          <Ionicons
            name="filter-outline"
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.filterButtonText}>
            Primijeni filter
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetujFiltere}
        >

          <Ionicons
            name="refresh-outline"
            size={18}
            color="#BDBDBD"
          />

          <Text style={styles.resetButtonText}>
            Resetuj
          </Text>

        </TouchableOpacity>

      </View>


      {/* DODATNE KARAKTERISTIKE */}

      <Text style={styles.filterTitle}>
        Dodatne karakteristike
      </Text>


      <View style={styles.featuresRow}>

        {/* WIFI */}

        <TouchableOpacity
          style={[
            styles.featureButton,
            wifiFilter &&
            styles.featureButtonActive,
          ]}
          onPress={() =>
            setWifiFilter(!wifiFilter)
          }
        >

          <Ionicons
            name="wifi-outline"
            size={18}
            color={
              wifiFilter
                ? '#FFFFFF'
                : '#BDBDBD'
            }
          />

          <Text
            style={[
              styles.featureButtonText,
              wifiFilter &&
              styles.featureButtonTextActive,
            ]}
          >
            WiFi
          </Text>

        </TouchableOpacity>


        {/* STRUJA */}

        <TouchableOpacity
          style={[
            styles.featureButton,
            strujaFilter &&
            styles.featureButtonActive,
          ]}
          onPress={() =>
            setStrujaFilter(!strujaFilter)
          }
        >

          <Ionicons
            name="flash-outline"
            size={18}
            color={
              strujaFilter
                ? '#FFFFFF'
                : '#BDBDBD'
            }
          />

          <Text
            style={[
              styles.featureButtonText,
              strujaFilter &&
              styles.featureButtonTextActive,
            ]}
          >
            Struja
          </Text>

        </TouchableOpacity>


        {/* PARKING */}

        <TouchableOpacity
          style={[
            styles.featureButton,
            parkingFilter &&
            styles.featureButtonActive,
          ]}
          onPress={() =>
            setParkingFilter(!parkingFilter)
          }
        >

          <Ionicons
            name="car-outline"
            size={18}
            color={
              parkingFilter
                ? '#FFFFFF'
                : '#BDBDBD'
            }
          />

          <Text
            style={[
              styles.featureButtonText,
              parkingFilter &&
              styles.featureButtonTextActive,
            ]}
          >
            Parking
          </Text>

        </TouchableOpacity>

      </View>


      {/* REZULTATI */}

      <View style={styles.resultHeader}>

        <Text style={styles.resultTitle}>
          Rezultati
        </Text>

        <View style={styles.resultBadge}>

          <Text style={styles.resultBadgeText}>
            {filtriraniKampovi.length}
          </Text>

        </View>

      </View>


      {filtriraniKampovi.length === 0 ? (

        <View style={styles.emptyContainer}>

          <Ionicons
            name="search-outline"
            size={50}
            color="#81C784"
          />

          <Text style={styles.emptyTitle}>
            Nema pronađenih kamp mjesta
          </Text>

          <Text style={styles.emptyText}>
            Pokušajte promijeniti kriterije pretrage.
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

          showsVerticalScrollIndicator={false}

          renderItem={({ item }) => (

            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() =>
                router.push(
                  `/camp/${item.id}`
                )
              }
            >

              <View style={styles.cardContent}>

                <View style={styles.cardTopRow}>

                  <View style={styles.cardTitleContainer}>

                    <Text
                      style={styles.cardTitle}
                      numberOfLines={1}
                    >
                      {item.naziv}
                    </Text>

                  </View>

                  <Ionicons
                    name="chevron-forward-outline"
                    size={22}
                    color="#81C784"
                  />

                </View>


                <Text
                  style={styles.description}
                  numberOfLines={2}
                >
                  {item.opis}
                </Text>


                <View style={styles.cardBottomRow}>

                  <View style={styles.cardPriceContainer}>

                    <Ionicons
                      name="pricetag-outline"
                      size={17}
                      color="#81C784"
                    />

                    <Text style={styles.price}>
                      {Number(
                        item.cijena_po_noci
                      ).toFixed(2)} KM
                    </Text>

                    <Text style={styles.priceNight}>
                      / noć
                    </Text>

                  </View>


                  <Text style={styles.detailsText}>
                    Pogledaj detalje
                  </Text>

                </View>

              </View>

            </TouchableOpacity>

          )}

        />

      )}

    </View>

  );
}


const styles = StyleSheet.create({

  /* GLAVNI KONTEJNER */

  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },


  /* LOADING / ERROR */

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },


  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#BDBDBD',
  },


  error: {
    fontSize: 16,
    textAlign: 'center',
    color: '#EF5350',
    marginTop: 10,
  },


  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },


  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    fontSize: 13,
    color: '#9E9E9E',
    marginTop: 3,
  },


  /* PRETRAGA */

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 22,
  },


  searchInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#FFFFFF',
  },


  /* FILTERI */

  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },


  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },


  priceInputContainer: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 10,
    paddingHorizontal: 12,
  },


  priceLabel: {
    fontSize: 12,
    color: '#757575',
    marginRight: 7,
  },


  priceInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#FFFFFF',
  },


  currency: {
    fontSize: 12,
    color: '#9E9E9E',
  },


  priceSeparator: {
    marginHorizontal: 10,
    fontSize: 18,
    color: '#757575',
  },


  /* DUGMAD */

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },


  filterButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    padding: 13,
    borderRadius: 9,
    backgroundColor: '#2E7D32',
  },


  filterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },


  resetButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 9,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    minWidth: 100,
  },


  resetButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#BDBDBD',
  },


  /* KARAKTERISTIKE */

  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },


  featureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 9,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },


  featureButtonActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#81C784',
  },


  featureButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#BDBDBD',
  },


  featureButtonTextActive: {
    color: '#FFFFFF',
  },


  /* REZULTATI */

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },


  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },


  resultBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 9,
  },


  resultBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#81C784',
  },


  /* LISTA */

  list: {
    paddingBottom: 30,
  },


  /* KARTICA */

  card: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 14,
    marginBottom: 12,
  },


  cardContent: {
    padding: 16,
  },


  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },


  cardTitleContainer: {
    flex: 1,
    paddingRight: 10,
  },


  cardTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },


  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#BDBDBD',
    marginBottom: 14,
  },


  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },


  cardPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },


  price: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#81C784',
  },


  priceNight: {
    fontSize: 12,
    color: '#9E9E9E',
  },


  detailsText: {
    fontSize: 12,
    color: '#81C784',
    fontWeight: '600',
  },


  /* PRAZNI REZULTATI */

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },


  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 12,
  },


  emptyText: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 6,
  },

});

