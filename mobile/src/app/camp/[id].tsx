import { useEffect, useState } from 'react';

import {
ActivityIndicator,
Alert,
ScrollView,
StyleSheet,
Text,
TouchableOpacity,
View,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import {
Map,
Camera,
Marker,
} from '@maplibre/maplibre-react-native';

import {
getKampById,
addToWishlist,
} from '@/services/api';

import { getToken } from '@/services/auth';

type Karakteristike = {
wifi?: boolean;
struja?: boolean;
parking?: boolean;

rostilj?: boolean;
vanjska_kuhinja?: boolean;

kajak?: boolean;
camac?: boolean;
bicikl?: boolean;

hladovina?: boolean;
voda?: boolean;
wc?: boolean;
tus?: boolean;
vatra?: boolean;
dozvoljeni_kucni_ljubimci?: boolean;
};

type Kamp = {
id: number;
naziv: string;
opis: string;
cijena_po_noci: number;

karakteristike?: Karakteristike;

latitude?: number;
longitude?: number;
};

export default function CampDetailsScreen() {

const { id } = useLocalSearchParams();

const router = useRouter();

const [kamp, setKamp] =
useState<Kamp | null>(null);

const [loading, setLoading] =
useState(true);

const [error, setError] =
useState('');

const [dodavanjeWishlist, setDodavanjeWishlist] =
useState(false);

useEffect(() => {


async function ucitajKamp() {

  try {

    const kampId = Number(id);


    if (!kampId) {

      setError(
        'ID kampa nije ispravan.'
      );

      return;
    }


    const podaci =
      await getKampById(kampId);


    setKamp(podaci);


  } catch (error) {

    console.error(
      'Greška pri učitavanju kampa:',
      error
    );


    setError(
      'Nije moguće učitati podatke o kampu.'
    );


  } finally {

    setLoading(false);

  }

}


ucitajKamp();


}, [id]);

async function dodajUListuZelja() {


try {

  const token =
    await getToken();


  if (!token) {

    Alert.alert(
      'Niste prijavljeni',
      'Morate se prijaviti prije dodavanja u listu želja.'
    );


    router.push('/login');

    return;

  }


  setDodavanjeWishlist(true);


  if (!kamp) {

    return;

  }


  await addToWishlist(
    kamp.id,
    token
  );


  Alert.alert(
    'Uspješno',
    'Kamp mjesto je dodano u listu želja.'
  );


} catch (error: any) {

  Alert.alert(
    'Greška',
    error.message ||
    'Nije moguće dodati kamp u listu želja.'
  );


} finally {

  setDodavanjeWishlist(false);

}


}

if (loading) {


return (

  <View style={styles.center}>

    <ActivityIndicator
      size="large"
    />

    <Text style={styles.loadingText}>
      Učitavanje kampa...
    </Text>

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


<ScrollView
  style={styles.container}
  contentContainerStyle={styles.scrollContent}
>

  {/* ========================================= */}
  {/* SLIKA */}
  {/* ========================================= */}

  <View style={styles.imagePlaceholder}>

    <Text style={styles.imageText}>
      SLIKA KAMPA
    </Text>

  </View>


  <View style={styles.content}>


    {/* ========================================= */}
    {/* OSNOVNE INFORMACIJE */}
    {/* ========================================= */}

    <Text style={styles.title}>
      {kamp.naziv}
    </Text>


    <Text style={styles.description}>
      {kamp.opis}
    </Text>


    <Text style={styles.price}>
      {Number(kamp.cijena_po_noci).toFixed(2)} KM / noć
    </Text>


    {/* ========================================= */}
    {/* KARAKTERISTIKE */}
    {/* ========================================= */}

    <Text style={styles.sectionTitle}>
      Karakteristike kampa
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


      {kamp.karakteristike?.rostilj && (

        <Text style={styles.feature}>
          ✓ Roštilj
        </Text>

      )}


      {kamp.karakteristike?.vanjska_kuhinja && (

        <Text style={styles.feature}>
          ✓ Vanjska kuhinja
        </Text>

      )}


      {kamp.karakteristike?.hladovina && (

        <Text style={styles.feature}>
          ✓ Hladovina
        </Text>

      )}


      {kamp.karakteristike?.voda && (

        <Text style={styles.feature}>
          ✓ Pitka voda
        </Text>

      )}


      {kamp.karakteristike?.wc && (

        <Text style={styles.feature}>
          ✓ WC
        </Text>

      )}


      {kamp.karakteristike?.tus && (

        <Text style={styles.feature}>
          ✓ Tuš
        </Text>

      )}


      {kamp.karakteristike?.vatra && (

        <Text style={styles.feature}>
          ✓ Mjesto za loženje vatre
        </Text>

      )}


      {kamp.karakteristike?.dozvoljeni_kucni_ljubimci && (

        <Text style={styles.feature}>
          ✓ Dozvoljeni kućni ljubimci
        </Text>

      )}

    </View>


    {/* ========================================= */}
    {/* OPREMA */}
    {/* ========================================= */}

    {(kamp.karakteristike?.kajak ||
      kamp.karakteristike?.camac ||
      kamp.karakteristike?.bicikl) && (

      <>

        <Text style={styles.sectionTitle}>
          Oprema za iznajmljivanje
        </Text>


        <View style={styles.equipmentContainer}>


          {kamp.karakteristike?.kajak && (

            <View style={styles.equipmentItem}>

              <Text style={styles.equipmentIcon}>
                🛶
              </Text>

              <Text style={styles.equipmentText}>
                Kajak
              </Text>

            </View>

          )}


          {kamp.karakteristike?.camac && (

            <View style={styles.equipmentItem}>

              <Text style={styles.equipmentIcon}>
                🚣
              </Text>

              <Text style={styles.equipmentText}>
                Čamac
              </Text>

            </View>

          )}


          {kamp.karakteristike?.bicikl && (

            <View style={styles.equipmentItem}>

              <Text style={styles.equipmentIcon}>
                🚲
              </Text>

              <Text style={styles.equipmentText}>
                Bicikl
              </Text>

            </View>

          )}

        </View>

      </>

    )}


    {/* ========================================= */}
    {/* LOKACIJA */}
    {/* ========================================= */}

    {kamp.latitude !== undefined &&
     kamp.longitude !== undefined && (

      <>

        <Text style={styles.sectionTitle}>
          Lokacija
        </Text>


        <Map
          style={styles.map}
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
        >

          <Camera
            initialViewState={{
              center: [
                Number(kamp.longitude),
                Number(kamp.latitude),
              ],
              zoom: 14,
            }}
          />


          <Marker
            id={`kamp-${kamp.id}`}
            lngLat={[
              Number(kamp.longitude),
              Number(kamp.latitude),
            ]}
          >

            <View style={styles.marker}>

              <Text style={styles.markerText}>
                📍
              </Text>

            </View>

          </Marker>

        </Map>

      </>

    )}


    {/* ========================================= */}
    {/* LISTA ŽELJA */}
    {/* ========================================= */}

    <TouchableOpacity
      style={styles.wishlistButton}
      onPress={dodajUListuZelja}
      disabled={dodavanjeWishlist}
    >

      <Text style={styles.wishlistButtonText}>

        {dodavanjeWishlist
          ? 'Dodavanje...'
          : '♡ Dodaj u listu želja'}

      </Text>

    </TouchableOpacity>


    {/* ========================================= */}
    {/* REZERVACIJA */}
    {/* ========================================= */}

    <TouchableOpacity
      style={styles.button}
      onPress={() => {

        router.push(
          `/reservation?kampId=${kamp.id}`
        );

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

scrollContent: {
paddingBottom: 40,
},

center: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
padding: 20,
},

loadingText: {
marginTop: 10,
fontSize: 16,
},

error: {
fontSize: 16,
textAlign: 'center',
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
marginBottom: 12,
},

features: {
gap: 8,
},

feature: {
fontSize: 16,
},

equipmentContainer: {
gap: 10,
},

equipmentItem: {
flexDirection: 'row',
alignItems: 'center',
borderWidth: 1,
borderRadius: 10,
padding: 12,
},

equipmentIcon: {
fontSize: 25,
marginRight: 12,
},

equipmentText: {
fontSize: 17,
fontWeight: 'bold',
},

marker: {
width: 30,
height: 30,
justifyContent: 'center',
alignItems: 'center',
},

markerDot: {
width: 18,
height: 18,
borderRadius: 9,
backgroundColor: 'red',
borderWidth: 3,
borderColor: 'white',
},

markerText: {
fontSize: 30,
},

map: {
width: '100%',
height: 250,
borderRadius: 12,
marginBottom: 20,
},

wishlistButton: {
marginTop: 20,
padding: 15,
borderRadius: 10,
alignItems: 'center',
borderWidth: 1,
},

wishlistButtonText: {
fontSize: 17,
fontWeight: 'bold',
},

button: {
marginTop: 15,
padding: 15,
borderRadius: 10,
alignItems: 'center',
},

buttonText: {
fontSize: 18,
fontWeight: 'bold',
},

});
