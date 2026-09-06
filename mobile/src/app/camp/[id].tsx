import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
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

import { Ionicons } from '@expo/vector-icons';

import {
  getKampById,
  getOpremaKampa,
  addToWishlist,
  IMAGE_URL,
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
  slika_url?: string;
};


type Oprema = {
  id: number;
  kamp_id: number;
  naziv: string;
  opis: string;
  cijena: number;
  jedinica: string;
  kolicina: number;
  aktivno: boolean;
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

  const [oprema, setOprema] =
    useState<Oprema[]>([]);


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


        const opremaKampa =
          await getOpremaKampa(kampId);

        setOprema(opremaKampa);


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
          color="#81C784"
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

        <Ionicons
          name="alert-circle-outline"
          size={55}
          color="#EF5350"
        />

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
      showsVerticalScrollIndicator={false}
    >

      {/* ========================================= */}
      {/* SLIKA KAMPA */}
      {/* ========================================= */}

      {kamp.slika_url ? (

        <Image
          source={{
            uri: `${IMAGE_URL}${kamp.slika_url}`,
          }}
          style={styles.campImage}
          resizeMode="cover"
        />

      ) : (

        <View style={styles.imagePlaceholder}>

          <Ionicons
            name="bonfire-outline"
            size={60}
            color="#81C784"
          />

          <Text style={styles.imageText}>
            Nema slike kampa
          </Text>

        </View>

      )}


      <View style={styles.content}>

        {/* ========================================= */}
        {/* OSNOVNE INFORMACIJE */}
        {/* ========================================= */}

        <View style={styles.titleRow}>

          <View style={styles.titleIconContainer}>

            <Ionicons
              name="bonfire-outline"
              size={27}
              color="#81C784"
            />

          </View>


          <View style={styles.titleContent}>

            <Text style={styles.title}>
              {kamp.naziv}
            </Text>

          </View>

        </View>


        <Text style={styles.description}>
          {kamp.opis}
        </Text>


        <View style={styles.priceCard}>

          <View style={styles.priceIconContainer}>

            <Ionicons
              name="pricetag-outline"
              size={23}
              color="#81C784"
            />

          </View>


          <View>

            <Text style={styles.priceLabel}>
              Cijena smještaja
            </Text>

            <Text style={styles.price}>
              {Number(kamp.cijena_po_noci).toFixed(2)} KM
              <Text style={styles.priceUnit}>
                {' '} / noć
              </Text>
            </Text>

          </View>

        </View>


        {/* ========================================= */}
        {/* KARAKTERISTIKE */}
        {/* ========================================= */}

        <Text style={styles.sectionTitle}>
          Karakteristike kampa
        </Text>


        <View style={styles.features}>

          {kamp.karakteristike?.wifi && (
            <View style={styles.feature}>

              <Ionicons
                name="wifi-outline"
                size={20}
                color="#81C784"
              />

              <Text style={styles.featureText}>
                WiFi
              </Text>

            </View>
          )}


          {kamp.karakteristike?.struja && (
            <View style={styles.feature}>

              <Ionicons
                name="flash-outline"
                size={20}
                color="#81C784"
              />

              <Text style={styles.featureText}>
                Struja
              </Text>

            </View>
          )}


          {kamp.karakteristike?.parking && (
            <View style={styles.feature}>

              <Ionicons
                name="car-outline"
                size={20}
                color="#81C784"
              />

              <Text style={styles.featureText}>
                Parking
              </Text>

            </View>
          )}


          {kamp.karakteristike?.rostilj && (
            <View style={styles.feature}>

              <Ionicons
                name="flame-outline"
                size={20}
                color="#81C784"
              />

              <Text style={styles.featureText}>
                Roštilj
              </Text>

            </View>
          )}


          {kamp.karakteristike?.vanjska_kuhinja && (
            <View style={styles.feature}>

              <Ionicons
                name="restaurant-outline"
                size={20}
                color="#81C784"
              />

              <Text style={styles.featureText}>
                Vanjska kuhinja
              </Text>

            </View>
          )}


          {kamp.karakteristike?.hladovina && (
            <View style={styles.feature}>

              <Ionicons
                name="leaf-outline"
                size={20}
                color="#81C784"
              />

              <Text style={styles.featureText}>
                Hladovina
              </Text>

            </View>
          )}


          {kamp.karakteristike?.voda && (
            <View style={styles.feature}>

              <Ionicons
                name="water-outline"
                size={20}
                color="#81C784"
              />

              <Text style={styles.featureText}>
                Pitka voda
              </Text>

            </View>
          )}


          {kamp.karakteristike?.wc && (
            <View style={styles.feature}>

              <Ionicons
                name="water-outline"
                size={20}
                color="#81C784"
              />

              <Text style={styles.featureText}>
                WC
              </Text>

            </View>
          )}


          {kamp.karakteristike?.tus && (
            <View style={styles.feature}>

              <Ionicons
                name="water-outline"
                size={20}
                color="#81C784"
              />

              <Text style={styles.featureText}>
                Tuš
              </Text>

            </View>
          )}


          {kamp.karakteristike?.vatra && (
            <View style={styles.feature}>

              <Ionicons
                name="flame-outline"
                size={20}
                color="#81C784"
              />

              <Text style={styles.featureText}>
                Mjesto za loženje vatre
              </Text>

            </View>
          )}


          {kamp.karakteristike?.dozvoljeni_kucni_ljubimci && (
            <View style={styles.feature}>

              <Ionicons
                name="paw-outline"
                size={20}
                color="#81C784"
              />

              <Text style={styles.featureText}>
                Dozvoljeni kućni ljubimci
              </Text>

            </View>
          )}

        </View>


        {/* ========================================= */}
        {/* OPREMA */}
        {/* ========================================= */}

        {oprema.length > 0 && (

          <>

            <View style={styles.sectionTitleRow}>

              <Ionicons
                name="construct-outline"
                size={21}
                color="#81C784"
              />

              <Text style={styles.sectionTitleInline}>
                Oprema za iznajmljivanje
              </Text>

            </View>


            <View style={styles.equipmentContainer}>

              {oprema.map((stavka) => (

                <View
                  key={stavka.id}
                  style={styles.equipmentItem}
                >

                  <View style={styles.equipmentHeader}>

                    <View style={styles.equipmentIconContainer}>

                      <Ionicons
                        name={
                          stavka.naziv === 'Kajak'
                            ? 'boat-outline'
                            : stavka.naziv === 'Čamac'
                            ? 'boat-outline'
                            : stavka.naziv === 'Bicikl'
                            ? 'bicycle-outline'
                            : 'bonfire-outline'
                        }
                        size={25}
                        color="#81C784"
                      />

                    </View>


                    <View style={styles.equipmentTitleContainer}>

                      <Text style={styles.equipmentText}>
                        {stavka.naziv}
                      </Text>

                      <Text style={styles.equipmentQuantity}>
                        Dostupno: {stavka.kolicina}
                      </Text>

                    </View>

                  </View>


                  <Text style={styles.equipmentDescription}>
                    {stavka.opis}
                  </Text>


                  <View style={styles.equipmentPriceRow}>

                    <Ionicons
                      name="pricetag-outline"
                      size={17}
                      color="#81C784"
                    />

                    <Text style={styles.equipmentPrice}>
                      {Number(stavka.cijena).toFixed(2)} KM
                    </Text>

                    <Text style={styles.equipmentUnit}>
                      / {stavka.jedinica}
                    </Text>

                  </View>

                </View>

              ))}

            </View>

          </>

        )}


        {/* ========================================= */}
        {/* LOKACIJA */}
        {/* ========================================= */}

        {kamp.latitude !== undefined &&
         kamp.longitude !== undefined && (

          <>

            <View style={styles.sectionTitleRow}>

              <Ionicons
                name="location-outline"
                size={21}
                color="#81C784"
              />

              <Text style={styles.sectionTitleInline}>
                Lokacija
              </Text>

            </View>


            <View style={styles.mapContainer}>

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

                    <Ionicons
                      name="location"
                      size={30}
                      color="#EF5350"
                    />

                  </View>

                </Marker>

              </Map>

            </View>

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

          {dodavanjeWishlist ? (

            <ActivityIndicator
              size="small"
              color="#81C784"
            />

          ) : (

            <>

              <Ionicons
                name="heart-outline"
                size={21}
                color="#81C784"
              />

              <Text style={styles.wishlistButtonText}>
                Dodaj u listu želja
              </Text>

            </>

          )}

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

          <Ionicons
            name="calendar-outline"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.buttonText}>
            Rezerviši kamp
          </Text>

          <Ionicons
            name="arrow-forward-outline"
            size={20}
            color="#FFFFFF"
          />

        </TouchableOpacity>


      </View>

    </ScrollView>

  );

}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#121212',
  },


  scrollContent: {
    paddingBottom: 40,
  },


  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#121212',
  },


  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#BDBDBD',
  },


  error: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    color: '#EF5350',
  },


  campImage: {
    width: '100%',
    height: 250,
  },


  imagePlaceholder: {
    height: 250,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },


  imageText: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 8,
  },


  content: {
    padding: 20,
  },


  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },


  titleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },


  titleContent: {
    flex: 1,
  },


  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },


  description: {
    fontSize: 15,
    lineHeight: 23,
    color: '#BDBDBD',
    marginBottom: 17,
  },


  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
  },


  priceIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },


  priceLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 2,
  },


  price: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#81C784',
  },


  priceUnit: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#BDBDBD',
  },


  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
  },


  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },


  sectionTitleInline: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },


  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },


  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },


  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 7,
  },


  equipmentContainer: {
    gap: 10,
  },


  equipmentItem: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 14,
    padding: 15,
  },


  equipmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },


  equipmentIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },


  equipmentTitleContainer: {
    flex: 1,
  },


  equipmentText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },


  equipmentQuantity: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 3,
  },


  equipmentDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#BDBDBD',
    marginBottom: 10,
  },


  equipmentPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  equipmentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#81C784',
    marginLeft: 6,
  },


  equipmentUnit: {
    fontSize: 14,
    color: '#9E9E9E',
    marginLeft: 4,
  },


  mapContainer: {
    overflow: 'hidden',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },


  map: {
    width: '100%',
    height: 250,
  },


  marker: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },


  wishlistButton: {
    marginTop: 20,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },


  wishlistButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#81C784',
    marginLeft: 7,
  },


  button: {
    marginTop: 10,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 15,
  },


  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },

});