import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import {
  Map,
  Camera,
  Marker,
} from '@maplibre/maplibre-react-native';

import { getKampovi } from '@/services/api';


type Kamp = {
  id: number;
  naziv: string;
  opis: string;
  cijena_po_noci: number;
  latitude?: number;
  longitude?: number;
};


export default function CampsMap() {

    const router = useRouter();

  const [kampovi, setKampovi] =
    useState<Kamp[]>([]);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    async function ucitajKampove() {

      try {

        const podaci =
          await getKampovi();

        setKampovi(podaci);

      } catch (error) {

        console.error(
          'Greška pri učitavanju kampova za mapu:',
          error
        );

      } finally {

        setLoading(false);

      }

    }

    ucitajKampove();

  }, []);


  const kampoviSaKoordinatama =
    kampovi.filter(
      (kamp) =>
        kamp.latitude !== undefined &&
        kamp.longitude !== undefined
    );


  if (loading) {

    return (
      <View style={styles.loadingContainer}>

        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Učitavanje mape...
        </Text>

      </View>
    );

  }


  if (kampoviSaKoordinatama.length === 0) {

    return (
      <View style={styles.emptyContainer}>

        <Text>
          Nema kampova sa dostupnom lokacijom.
        </Text>

      </View>
    );

  }


  const prviKamp =
    kampoviSaKoordinatama[0];


  return (

    <View style={styles.container}>

      <Map
        style={styles.map}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
      >

        <Camera
          initialViewState={{
            center: [
              Number(prviKamp.longitude),
              Number(prviKamp.latitude),
            ],
            zoom: 7,
          }}
        />


        {kampoviSaKoordinatama.map(
  (kamp) => (

    <Marker
      key={kamp.id}
      id={`kamp-${kamp.id}`}
      lngLat={[
        Number(kamp.longitude),
        Number(kamp.latitude),
      ]}
      onPress={() => {
        router.push(`/camp/${kamp.id}`);
      }}
    >

      <View style={styles.marker}>

        <Text style={styles.markerText}>
          📍
        </Text>

      </View>

    </Marker>

  )
)}

      </Map>

    </View>

  );

}



const styles = StyleSheet.create({

  container: {
    width: '100%',
    height: 350,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },

  map: {
    flex: 1,
  },

  loadingContainer: {
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },

  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },

  marker: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  markerText: {
    fontSize: 30,
  },

});