import { getToken } from '@/services/auth';
import { getReservationById } from '@/services/api';

import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';

import {
  useLocalSearchParams,
} from 'expo-router';

import { Ionicons } from '@expo/vector-icons';


type Rezervacija = {
  id: string;
  korisnik_id: string;
  kamp_id: string;

  kamp_naziv: string;
  kamp_opis: string;

  cijena_po_noci: string;

  karakteristike?: {
    wifi?: boolean;
    struja?: boolean;
    parking?: boolean;
  };

  latitude?: string;
  longitude?: string;

  datum_prijave: string;
  datum_odjave: string;

  ukupna_cijena: string;

  status: string;
  oprema: RezervacijaOprema[];
};


type RezervacijaOprema = {
  id: string;
  oprema_id: string;
  naziv: string;
  opis?: string;
  kolicina: number;
  cijena_po_jedinici: string;
  broj_dana: number;
  ukupna_cijena: string;
};


export default function ReservationDetailsScreen() {

  const { id } = useLocalSearchParams();

  const [rezervacija, setRezervacija] =
    useState<Rezervacija | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  useEffect(() => {

    async function ucitajRezervaciju() {

      try {

        const token = await getToken();

        if (!token) {

          setError(
            'Morate biti prijavljeni.'
          );

          return;
        }


        const data =
          await getReservationById(
            String(id),
            token
          );


        setRezervacija(
          data.rezervacija
        );


      } catch (error: any) {

        console.error(
          'Greška pri učitavanju rezervacije:',
          error
        );

        setError(
          error.message ||
          'Nije moguće učitati detalje rezervacije.'
        );

      } finally {

        setLoading(false);

      }
    }


    ucitajRezervaciju();

  }, [id]);


  function formatirajDatum(
    datum: string
  ) {

    return new Date(
      datum
    ).toLocaleDateString(
      'bs-BA',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    );
  }


  function getStatusIcon() {

    if (rezervacija?.status === 'aktivna') {
      return 'checkmark-circle-outline';
    }

    if (rezervacija?.status === 'otkazana') {
      return 'close-circle-outline';
    }

    if (rezervacija?.status === 'zavrsena') {
      return 'checkmark-done-circle-outline';
    }

    return 'help-circle-outline';
  }


  function getStatusColor() {

    if (rezervacija?.status === 'aktivna') {
      return '#81C784';
    }

    if (rezervacija?.status === 'otkazana') {
      return '#EF5350';
    }

    if (rezervacija?.status === 'zavrsena') {
      return '#9E9E9E';
    }

    return '#BDBDBD';
  }


  function getEquipmentIcon(
    naziv: string
  ) {

    const nazivLower =
      naziv.toLowerCase();

    if (nazivLower.includes('bicikl')) {
      return 'bicycle-outline';
    }

    if (
      nazivLower.includes('čamac') ||
      nazivLower.includes('camac')
    ) {
      return 'boat-outline';
    }

    if (nazivLower.includes('kajak')) {
      return 'boat-outline';
    }

    if (nazivLower.includes('šator')) {
      return 'bonfire-outline';
    }

    if (nazivLower.includes('roštilj')) {
      return 'flame-outline';
    }

    if (nazivLower.includes('ležalj')) {
      return 'bed-outline';
    }

    return 'construct-outline';
  }


  if (loading) {

    return (

      <View style={styles.center}>

        <ActivityIndicator
          size="large"
          color="#81C784"
        />

        <Text style={styles.loadingText}>
          Učitavanje detalja...
        </Text>

      </View>

    );

  }


  if (error || !rezervacija) {

    return (

      <View style={styles.center}>

        <Ionicons
          name="alert-circle-outline"
          size={52}
          color="#EF5350"
        />

        <Text style={styles.error}>
          {error ||
            'Rezervacija nije pronađena.'}
        </Text>

      </View>

    );

  }


  const statusColor =
    getStatusColor();


  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.scrollContent
      }
      showsVerticalScrollIndicator={false}
    >

      {/* NASLOV */}

      <View style={styles.header}>

        <View style={styles.headerIcon}>

          <Ionicons
            name="receipt-outline"
            size={26}
            color="#81C784"
          />

        </View>

        <View style={styles.headerText}>

          <Text style={styles.title}>
            Detalji rezervacije
          </Text>

          <Text style={styles.reservationId}>
            Rezervacija #{rezervacija.id}
          </Text>

        </View>

      </View>


      {/* KAMP */}

      <View style={styles.card}>

        <View style={styles.sectionHeader}>

          <View style={styles.iconContainer}>

            <Ionicons
              name="bonfire-outline"
              size={22}
              color="#81C784"
            />

          </View>

          <Text style={styles.sectionTitle}>
            Kamp
          </Text>

        </View>


        <Text style={styles.campName}>
          {rezervacija.kamp_naziv}
        </Text>


        <Text style={styles.description}>
          {rezervacija.kamp_opis}
        </Text>

      </View>


      {/* PERIOD */}

      <View style={styles.card}>

        <View style={styles.sectionHeader}>

          <View style={styles.iconContainer}>

            <Ionicons
              name="calendar-outline"
              size={22}
              color="#81C784"
            />

          </View>

          <Text style={styles.sectionTitle}>
            Period boravka
          </Text>

        </View>


        <View style={styles.dateRow}>

          <View style={styles.dateIcon}>

            <Ionicons
              name="log-in-outline"
              size={20}
              color="#81C784"
            />

          </View>

          <View>

            <Text style={styles.dateLabel}>
              Prijava
            </Text>

            <Text style={styles.dateValue}>
              {formatirajDatum(
                rezervacija.datum_prijave
              )}
            </Text>

          </View>

        </View>


        <View style={styles.dateRow}>

          <View style={styles.dateIcon}>

            <Ionicons
              name="log-out-outline"
              size={20}
              color="#81C784"
            />

          </View>

          <View>

            <Text style={styles.dateLabel}>
              Odjava
            </Text>

            <Text style={styles.dateValue}>
              {formatirajDatum(
                rezervacija.datum_odjave
              )}
            </Text>

          </View>

        </View>

      </View>


      {/* CIJENA */}

      <View style={styles.card}>

        <View style={styles.sectionHeader}>

          <View style={styles.iconContainer}>

            <Ionicons
              name="pricetag-outline"
              size={22}
              color="#81C784"
            />

          </View>

          <Text style={styles.sectionTitle}>
            Cijena
          </Text>

        </View>


        <View style={styles.priceRow}>

          <Text style={styles.priceLabel}>
            Cijena po noći
          </Text>

          <Text style={styles.priceValue}>
            {rezervacija.cijena_po_noci} KM
          </Text>

        </View>


        <View style={styles.totalBox}>

          <View>

            <Text style={styles.totalLabel}>
              Ukupna cijena
            </Text>

            <Text style={styles.totalSubtext}>
              Za cijeli period boravka
            </Text>

          </View>

          <Text style={styles.totalValue}>
            {rezervacija.ukupna_cijena} KM
          </Text>

        </View>

      </View>


      {/* OPREMA */}

      <View style={styles.card}>

        <View style={styles.sectionHeader}>

          <View style={styles.iconContainer}>

            <Ionicons
              name="construct-outline"
              size={22}
              color="#81C784"
            />

          </View>

          <Text style={styles.sectionTitle}>
            Dodatna oprema
          </Text>

        </View>


        {rezervacija.oprema &&
        rezervacija.oprema.length > 0 ? (

          rezervacija.oprema.map(
            (stavka) => (

              <View
                key={stavka.id}
                style={styles.equipmentCard}
              >

                <View style={styles.equipmentTop}>

                  <View
                    style={styles.equipmentIcon}
                  >

                    <Ionicons
                      name={
                        getEquipmentIcon(
                          stavka.naziv
                        ) as any
                      }
                      size={22}
                      color="#81C784"
                    />

                  </View>


                  <View
                    style={styles.equipmentTitleContainer}
                  >

                    <Text
                      style={
                        styles.equipmentName
                      }
                    >
                      {stavka.naziv}
                    </Text>

                    {stavka.opis ? (

                      <Text
                        style={
                          styles.equipmentDescription
                        }
                      >
                        {stavka.opis}
                      </Text>

                    ) : null}

                  </View>

                </View>


                <View
                  style={styles.equipmentInfo}
                >

                  <View
                    style={styles.equipmentInfoRow}
                  >

                    <Ionicons
                      name="layers-outline"
                      size={17}
                      color="#9E9E9E"
                    />

                    <Text
                      style={
                        styles.equipmentInfoText
                      }
                    >
                      Količina: {stavka.kolicina}
                    </Text>

                  </View>


                  <View
                    style={styles.equipmentInfoRow}
                  >

                    <Ionicons
                      name="pricetag-outline"
                      size={17}
                      color="#9E9E9E"
                    />

                    <Text
                      style={
                        styles.equipmentInfoText
                      }
                    >
                      {stavka.cijena_po_jedinici} KM
                      {' '}×{' '}
                      {stavka.kolicina}
                      {' '}×{' '}
                      {stavka.broj_dana} dana
                    </Text>

                  </View>

                </View>


                <View
                  style={styles.equipmentTotalRow}
                >

                  <Text
                    style={
                      styles.equipmentTotalLabel
                    }
                  >
                    Ukupno
                  </Text>

                  <Text
                    style={
                      styles.equipmentTotal
                    }
                  >
                    {stavka.ukupna_cijena} KM
                  </Text>

                </View>

              </View>

            )

          )

        ) : (

          <View style={styles.emptyEquipment}>

            <Ionicons
              name="construct-outline"
              size={28}
              color="#757575"
            />

            <Text style={styles.emptyText}>
              Nije odabrana dodatna oprema.
            </Text>

          </View>

        )}

      </View>


      {/* KARAKTERISTIKE */}

      <View style={styles.card}>

        <View style={styles.sectionHeader}>

          <View style={styles.iconContainer}>

            <Ionicons
              name="sparkles-outline"
              size={22}
              color="#81C784"
            />

          </View>

          <Text style={styles.sectionTitle}>
            Karakteristike kampa
          </Text>

        </View>


        <View style={styles.features}>

          {rezervacija.karakteristike?.wifi && (

            <View style={styles.feature}>

              <Ionicons
                name="wifi-outline"
                size={18}
                color="#81C784"
              />

              <Text style={styles.featureText}>
                WiFi
              </Text>

            </View>

          )}


          {rezervacija.karakteristike?.struja && (

            <View style={styles.feature}>

              <Ionicons
                name="flash-outline"
                size={18}
                color="#81C784"
              />

              <Text style={styles.featureText}>
                Struja
              </Text>

            </View>

          )}


          {rezervacija.karakteristike?.parking && (

            <View style={styles.feature}>

              <Ionicons
                name="car-outline"
                size={18}
                color="#81C784"
              />

              <Text style={styles.featureText}>
                Parking
              </Text>

            </View>

          )}

        </View>

      </View>


      {/* LOKACIJA */}

      <View style={styles.card}>

        <View style={styles.sectionHeader}>

          <View style={styles.iconContainer}>

            <Ionicons
              name="location-outline"
              size={22}
              color="#81C784"
            />

          </View>

          <Text style={styles.sectionTitle}>
            Lokacija
          </Text>

        </View>


        <View style={styles.locationRow}>

          <Ionicons
            name="navigate-outline"
            size={18}
            color="#9E9E9E"
          />

          <Text style={styles.locationText}>
            Latitude: {rezervacija.latitude}
          </Text>

        </View>


        <View style={styles.locationRow}>

          <Ionicons
            name="navigate-outline"
            size={18}
            color="#9E9E9E"
          />

          <Text style={styles.locationText}>
            Longitude: {rezervacija.longitude}
          </Text>

        </View>

      </View>


      {/* STATUS */}

      <View
        style={[
          styles.statusCard,
          {
            borderColor: statusColor,
          },
        ]}
      >

        <Ionicons
          name={getStatusIcon() as any}
          size={25}
          color={statusColor}
        />

        <View style={styles.statusTextContainer}>

          <Text style={styles.statusLabel}>
            Status rezervacije
          </Text>

          <Text
            style={[
              styles.statusValue,
              {
                color: statusColor,
              },
            ]}
          >
            {rezervacija.status}
          </Text>

        </View>

      </View>


      <View style={styles.bottomSpace} />

    </ScrollView>

  );

}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#121212',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#BDBDBD',
  },

  error: {
    marginTop: 14,
    fontSize: 16,
    color: '#EF5350',
    textAlign: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  reservationId: {
    marginTop: 3,
    fontSize: 14,
    color: '#9E9E9E',
  },

  card: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  sectionTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  campName: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#BDBDBD',
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
  },

  dateIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  dateLabel: {
    fontSize: 13,
    color: '#9E9E9E',
    marginBottom: 2,
  },

  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },

  priceLabel: {
    fontSize: 15,
    color: '#BDBDBD',
  },

  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1B3320',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  totalSubtext: {
    marginTop: 3,
    fontSize: 12,
    color: '#A5C7A7',
  },

  totalValue: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#81C784',
  },

  equipmentCard: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 13,
    padding: 13,
    marginBottom: 10,
  },

  equipmentTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  equipmentIcon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  equipmentTitleContainer: {
    flex: 1,
  },

  equipmentName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  equipmentDescription: {
    marginTop: 3,
    fontSize: 13,
    color: '#9E9E9E',
  },

  equipmentInfo: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2C',
  },

  equipmentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  equipmentInfoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#BDBDBD',
  },

  equipmentTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },

  equipmentTotalLabel: {
    fontSize: 14,
    color: '#9E9E9E',
  },

  equipmentTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#81C784',
  },

  emptyEquipment: {
    alignItems: 'center',
    paddingVertical: 12,
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#757575',
  },

  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  featureText: {
    marginLeft: 7,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  locationText: {
    marginLeft: 9,
    fontSize: 15,
    color: '#BDBDBD',
  },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderRadius: 15,
    padding: 16,
  },

  statusTextContainer: {
    marginLeft: 12,
  },

  statusLabel: {
    fontSize: 13,
    color: '#9E9E9E',
    marginBottom: 3,
  },

  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },

  bottomSpace: {
    height: 10,
  },

});