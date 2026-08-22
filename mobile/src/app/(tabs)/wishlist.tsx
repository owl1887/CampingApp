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

import { useFocusEffect } from 'expo-router';

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

  const [listaZelja, setListaZelja] =
    useState<WishlistItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);


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


  useFocusEffect(
    useCallback(() => {

      ucitajListuZelja();

    }, [])
  );


  async function osvjeziListuZelja() {

    setRefreshing(true);

    await ucitajListuZelja();

    setRefreshing(false);

  }


  if (loading) {

    return (

      <View style={styles.center}>

        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Učitavanje liste želja...
        </Text>

      </View>

    );

  }

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

    // Ponovo učitavamo listu
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


  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Lista želja
      </Text>


      {listaZelja.length === 0 ? (

        <View style={styles.emptyContainer}>

          <Text style={styles.emptyText}>
            Lista želja je prazna.
          </Text>

        </View>

      ) : (

        <ScrollView
          style={styles.list}

          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={osvjeziListuZelja}
            />
          }
        >

          {listaZelja.map(
            (kamp) => (

              <View
                key={kamp.id}
                style={styles.card}
              >

                <Text style={styles.cardTitle}>
                  {kamp.naziv}
                </Text>


                <Text style={styles.description}>
                  {kamp.opis}
                </Text>


                <Text style={styles.price}>
                  {kamp.cijena_po_noci} KM / noć
                </Text>

                <TouchableOpacity
  style={styles.removeButton}
  onPress={() =>
    ukloniIzListeZelja(kamp.id)
  }
>
  <Text style={styles.removeButtonText}>
    Ukloni iz liste želja
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


const styles = StyleSheet.create({

  removeButton: {
  marginTop: 15,
  padding: 12,
  borderRadius: 8,
  alignItems: 'center',
  borderWidth: 1,
},

removeButtonText: {
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

  price: {
    fontSize: 17,
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