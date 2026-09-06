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
  useFocusEffect,
  useRouter,
} from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { getToken } from '@/services/auth';

import {
  getWishlist,
  removeFromWishlist,
} from '@/services/api';


type WishlistItem = {
  id: number;
  naziv: string;
  opis: string;
  cijena_po_noci: string;
  karakteristike?: {
    wifi?: boolean;
    struja?: boolean;
    parking?: boolean;
  };
  latitude?: string;
  longitude?: string;
};


export default function WishlistScreen() {

  const router = useRouter();

  const [listaZelja, setListaZelja] =
    useState<WishlistItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);


  // =====================================================
  // UČITAVANJE LISTE ŽELJA
  // =====================================================

  async function ucitajListuZelja() {

    try {

      const token = await getToken();


      if (!token) {

        setListaZelja([]);

        return;
      }


      const data =
        await getWishlist(token);


      setListaZelja(
        data.lista_zelja || []
      );


    } catch (error: any) {

      console.error(
        'Greška pri učitavanju liste želja:',
        error
      );


      Alert.alert(
        'Greška',
        error.message ||
        'Nije moguće učitati listu želja.'
      );


    } finally {

      setLoading(false);

    }

  }


  // =====================================================
  // AUTOMATSKO UČITAVANJE
  // =====================================================

  useFocusEffect(
    useCallback(() => {

      ucitajListuZelja();

    }, [])
  );


  // =====================================================
  // OSVJEŽAVANJE LISTE
  // =====================================================

  async function osvjeziListuZelja() {

    setRefreshing(true);

    await ucitajListuZelja();

    setRefreshing(false);

  }


  // =====================================================
  // UKLANJANJE IZ LISTE ŽELJA
  // =====================================================

  async function ukloniIzListeZelja(
    kampId: number
  ) {

    try {

      const token = await getToken();


      if (!token) {

        Alert.alert(
          'Niste prijavljeni',
          'Morate se prijaviti.'
        );

        return;
      }


      await removeFromWishlist(
        kampId,
        token
      );


      await ucitajListuZelja();


      Alert.alert(
        'Uspješno',
        'Kamp je uklonjen iz liste želja.'
      );


    } catch (error: any) {

      Alert.alert(
        'Greška',
        error.message ||
        'Nije moguće ukloniti kamp iz liste želja.'
      );

    }

  }


  // =====================================================
  // EKRAN UČITAVANJA
  // =====================================================

  if (loading) {

    return (

      <View style={styles.center}>

        <ActivityIndicator
          size="large"
          color="#81C784"
        />

        <Text style={styles.loadingText}>
          Učitavanje liste želja...
        </Text>

      </View>

    );

  }


  // =====================================================
  // GLAVNI EKRAN
  // =====================================================

  return (

    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <View style={styles.headerIconContainer}>

          <Ionicons
            name="heart"
            size={25}
            color="#81C784"
          />

        </View>

        <View>

          <Text style={styles.title}>
            Lista želja
          </Text>

          <Text style={styles.subtitle}>
            Sačuvani kampovi
          </Text>

        </View>

      </View>


      {listaZelja.length === 0 ? (

        /* PRAZNO STANJE */

        <View style={styles.emptyContainer}>

          <View style={styles.emptyIconContainer}>

            <Ionicons
              name="heart-outline"
              size={48}
              color="#81C784"
            />

          </View>


          <Text style={styles.emptyTitle}>
            Lista želja je prazna
          </Text>


          <Text style={styles.emptyText}>
            Kampove koje želite posjetiti možete
            sačuvati u svoju listu želja.
          </Text>

        </View>

      ) : (

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}

          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={osvjeziListuZelja}
              tintColor="#81C784"
              colors={['#81C784']}
            />
          }
        >

          {listaZelja.map(
            (kamp) => (

              <View
                key={kamp.id}
                style={styles.card}
              >

                {/* NASLOV KAMPA */}

                <View style={styles.cardHeader}>

                  <View style={styles.campIconContainer}>

                    <Ionicons
                      name="bonfire-outline"
                      size={24}
                      color="#81C784"
                    />

                  </View>


                  <View style={styles.cardTitleContainer}>

                    <Text style={styles.cardTitle}>
                      {kamp.naziv}
                    </Text>

                    <Text style={styles.savedText}>
                      Sačuvano u listi želja
                    </Text>

                  </View>


                  <Ionicons
                    name="heart"
                    size={22}
                    color="#81C784"
                  />

                </View>


                {/* OPIS */}

                <Text style={styles.description}>
                  {kamp.opis}
                </Text>


                {/* KARAKTERISTIKE */}

                {kamp.karakteristike && (

                  <View style={styles.features}>

                    {kamp.karakteristike.wifi && (

                      <View style={styles.feature}>

                        <Ionicons
                          name="wifi-outline"
                          size={16}
                          color="#81C784"
                        />

                        <Text style={styles.featureText}>
                          Wi-Fi
                        </Text>

                      </View>

                    )}


                    {kamp.karakteristike.struja && (

                      <View style={styles.feature}>

                        <Ionicons
                          name="flash-outline"
                          size={16}
                          color="#81C784"
                        />

                        <Text style={styles.featureText}>
                          Struja
                        </Text>

                      </View>

                    )}


                    {kamp.karakteristike.parking && (

                      <View style={styles.feature}>

                        <Ionicons
                          name="car-outline"
                          size={16}
                          color="#81C784"
                        />

                        <Text style={styles.featureText}>
                          Parking
                        </Text>

                      </View>

                    )}

                  </View>

                )}


                {/* CIJENA */}

                <View style={styles.priceContainer}>

                  <Ionicons
                    name="pricetag-outline"
                    size={19}
                    color="#81C784"
                  />

                  <Text style={styles.price}>
                    {kamp.cijena_po_noci} KM
                  </Text>

                  <Text style={styles.priceUnit}>
                    / noć
                  </Text>

                </View>


                {/* DETALJI */}

                <TouchableOpacity
                  style={styles.detailsButton}

                  onPress={() =>
                    router.push(
                      `/camp/${kamp.id}`
                    )
                  }
                >

                  <Ionicons
                    name="eye-outline"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text style={styles.detailsButtonText}>
                    DETALJI
                  </Text>

                </TouchableOpacity>


                {/* UKLANJANJE */}

                <TouchableOpacity
                  style={styles.removeButton}

                  onPress={() =>
                    ukloniIzListeZelja(
                      kamp.id
                    )
                  }
                >

                  <Ionicons
                    name="heart-dislike-outline"
                    size={19}
                    color="#EF5350"
                  />

                  <Text style={styles.removeButtonText}>
                    UKLONI IZ LISTE ŽELJA
                  </Text>

                </TouchableOpacity>

              </View>

            )
          )}

        </ScrollView>

      )}

    </View>

  );

}


// =====================================================
// STILOVI
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 20,
    paddingTop: 20,
  },


  // =====================================================
  // HEADER
  // =====================================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },


  headerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
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
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 2,
  },


  // =====================================================
  // LOADING
  // =====================================================

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },


  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#BDBDBD',
  },


  // =====================================================
  // LISTA
  // =====================================================

  list: {
    flex: 1,
  },


  listContent: {
    paddingBottom: 25,
  },


  // =====================================================
  // KARTICA
  // =====================================================

  card: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },


  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },


  campIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },


  cardTitleContainer: {
    flex: 1,
  },


  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },


  savedText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 3,
  },


  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#BDBDBD',
    marginBottom: 12,
  },


  // =====================================================
  // KARAKTERISTIKE
  // =====================================================

  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },


  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginRight: 7,
    marginBottom: 6,
  },


  featureText: {
    fontSize: 12,
    color: '#BDBDBD',
    marginLeft: 5,
  },


  // =====================================================
  // CIJENA
  // =====================================================

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2C',
    paddingTop: 13,
    marginBottom: 14,
  },


  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#81C784',
    marginLeft: 7,
  },


  priceUnit: {
    fontSize: 14,
    color: '#9E9E9E',
    marginLeft: 4,
  },


  // =====================================================
  // DETALJI
  // =====================================================

  detailsButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },


  detailsButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 7,
  },


  // =====================================================
  // UKLANJANJE
  // =====================================================

  removeButton: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#5A2929',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 9,
  },


  removeButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#EF5350',
    marginLeft: 7,
  },


  // =====================================================
  // PRAZNO STANJE
  // =====================================================

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingBottom: 60,
  },


  emptyIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },


  emptyTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },


  emptyText: {
    fontSize: 15,
    color: '#9E9E9E',
    textAlign: 'center',
    lineHeight: 21,
  },

});