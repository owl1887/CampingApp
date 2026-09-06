import { getToken } from '@/services/auth';
import ProtectedScreen from '@/components/protected-screen';

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

import DateTimePicker from '@react-native-community/datetimepicker';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import {
  createReservation,
  getKampById,
  getOpremaKampa,
} from '@/services/api';


// =====================================================
// TIPOVI
// =====================================================

type Kamp = {
  id: number;
  naziv: string;
  cijena_po_noci: number;
};


type Oprema = {
  id: number;
  kamp_id: number;
  naziv: string;
  opis?: string;
  cijena: number;
  jedinica: string;
  kolicina: number;
  aktivno: boolean;
};


type OdabranaOprema = {
  oprema_id: number;
  kolicina: number;
};


// =====================================================
// REZERVACIJA
// =====================================================

export default function ReservationScreen() {

  const { kampId } = useLocalSearchParams();
  const router = useRouter();


  // =====================================================
  // STATE - KAMP
  // =====================================================

  const [kamp, setKamp] =
    useState<Kamp | null>(null);


  // =====================================================
  // STATE - OPREMA
  // =====================================================

  const [oprema, setOprema] =
    useState<Oprema[]>([]);

  const [odabranaOprema, setOdabranaOprema] =
    useState<OdabranaOprema[]>([]);


  // =====================================================
  // STATE - LOADING
  // =====================================================

  const [loadingKamp, setLoadingKamp] =
    useState(true);

  const [loadingOprema, setLoadingOprema] =
    useState(true);

  const [loading, setLoading] =
    useState(false);


  // =====================================================
  // STATE - DATUMI
  // =====================================================

  const [datumPrijave, setDatumPrijave] =
    useState<Date | null>(null);

  const [datumOdjave, setDatumOdjave] =
    useState<Date | null>(null);


  const [showPrijava, setShowPrijava] =
    useState(false);

  const [showOdjava, setShowOdjava] =
    useState(false);


  // =====================================================
  // UČITAVANJE KAMPA I OPREME
  // =====================================================

  useEffect(() => {

    async function ucitajPodatke() {

      try {

        const kampIdBroj =
          Number(kampId);


        if (!kampIdBroj) {

          Alert.alert(
            'Greška',
            'ID kampa nije ispravan.'
          );

          router.back();

          return;
        }


        const podaciKampa =
          await getKampById(
            kampIdBroj
          );

        setKamp(
          podaciKampa
        );

        setLoadingKamp(false);


        try {

          const podaciOpreme =
            await getOpremaKampa(
              kampIdBroj
            );

          setOprema(
            podaciOpreme || []
          );

        } catch (error) {

          console.error(
            'Greška pri učitavanju opreme:',
            error
          );

          setOprema([]);

        } finally {

          setLoadingOprema(false);

        }


      } catch (error) {

        console.error(
          'Greška pri učitavanju podataka:',
          error
        );


        Alert.alert(
          'Greška',
          'Nije moguće učitati podatke o kampu.'
        );


        setLoadingKamp(false);
        setLoadingOprema(false);

      }

    }


    ucitajPodatke();

  }, [kampId]);


  // =====================================================
  // FORMAT DATUMA ZA PRIKAZ
  // =====================================================

  function formatirajDatum(
    datum: Date | null
  ) {

    if (!datum) {

      return 'Odaberite datum';

    }


    const godina =
      datum.getFullYear();

    const mjesec =
      String(
        datum.getMonth() + 1
      ).padStart(2, '0');

    const dan =
      String(
        datum.getDate()
      ).padStart(2, '0');


    return `${dan}.${mjesec}.${godina}.`;

  }


  // =====================================================
  // FORMAT DATUMA ZA SERVER
  // =====================================================

  function formatirajDatumZaServer(
    datum: Date
  ) {

    const godina =
      datum.getFullYear();

    const mjesec =
      String(
        datum.getMonth() + 1
      ).padStart(2, '0');

    const dan =
      String(
        datum.getDate()
      ).padStart(2, '0');


    return `${godina}-${mjesec}-${dan}`;

  }


  // =====================================================
  // BROJ NOĆI
  // =====================================================

  function izracunajBrojNoci() {

    if (
      !datumPrijave ||
      !datumOdjave
    ) {

      return 0;

    }


    const razlika =
      datumOdjave.getTime() -
      datumPrijave.getTime();


    return Math.ceil(
      razlika /
      (1000 * 60 * 60 * 24)
    );

  }


  const brojNoci =
    izracunajBrojNoci();


  // =====================================================
  // CIJENA KAMPA
  // =====================================================

  const cijenaKampa =
    kamp && brojNoci > 0
      ? brojNoci *
        Number(
          kamp.cijena_po_noci
        )
      : 0;


  // =====================================================
  // PRONAĐI ODABRANU KOLIČINU
  // =====================================================

  function pronadjiOdabranuKolicinu(
    opremaId: number
  ) {

    const stavka =
      odabranaOprema.find(
        item =>
          item.oprema_id ===
          opremaId
      );


    return stavka
      ? stavka.kolicina
      : 0;

  }


  // =====================================================
  // POVEĆAJ KOLIČINU OPREME
  // =====================================================

  function povecajKolicinu(
    opremaId: number
  ) {

    const stavka =
      oprema.find(
        item =>
          item.id ===
          opremaId
      );


    if (!stavka) {

      return;

    }


    const trenutnaKolicina =
      pronadjiOdabranuKolicinu(
        opremaId
      );


    if (
      trenutnaKolicina >=
      Number(stavka.kolicina)
    ) {

      Alert.alert(
        'Nema dovoljno opreme',
        `Dostupno je najviše ${stavka.kolicina} komada.`
      );

      return;

    }


    const novaKolicina =
      trenutnaKolicina + 1;


    setOdabranaOprema(
      prethodne => {

        const postoji =
          prethodne.some(
            item =>
              item.oprema_id ===
              opremaId
          );


        if (postoji) {

          return prethodne.map(
            item =>
              item.oprema_id ===
              opremaId
                ? {
                    ...item,
                    kolicina:
                      novaKolicina,
                  }
                : item
          );

        }


        return [
          ...prethodne,
          {
            oprema_id:
              opremaId,

            kolicina:
              novaKolicina,
          },
        ];

      }
    );

  }


  // =====================================================
  // SMANJI KOLIČINU OPREME
  // =====================================================

  function smanjiKolicinu(
    opremaId: number
  ) {

    const trenutnaKolicina =
      pronadjiOdabranuKolicinu(
        opremaId
      );


    if (
      trenutnaKolicina <= 0
    ) {

      return;

    }


    if (
      trenutnaKolicina === 1
    ) {

      setOdabranaOprema(
        prethodne =>
          prethodne.filter(
            item =>
              item.oprema_id !==
              opremaId
          )
      );

      return;

    }


    setOdabranaOprema(
      prethodne =>
        prethodne.map(
          item =>
            item.oprema_id ===
            opremaId
              ? {
                  ...item,
                  kolicina:
                    item.kolicina - 1,
                }
              : item
        )
    );

  }


  // =====================================================
  // CIJENA OPREME
  // =====================================================

  function izracunajCijenuOpreme() {

    if (
      brojNoci <= 0
    ) {

      return 0;

    }


    return odabranaOprema.reduce(
      (
        ukupno,
        odabrano
      ) => {

        const stavka =
          oprema.find(
            item =>
              item.id ===
              odabrano.oprema_id
          );


        if (!stavka) {

          return ukupno;

        }


        return (
          ukupno +
          Number(stavka.cijena) *
          odabrano.kolicina *
          brojNoci
        );

      },
      0
    );

  }


  const cijenaOpreme =
    izracunajCijenuOpreme();


  // =====================================================
  // UKUPNA CIJENA
  // =====================================================

  const ukupnaCijena =
    cijenaKampa +
    cijenaOpreme;


  // =====================================================
  // POTVRDA REZERVACIJE
  // =====================================================

  async function potvrdiRezervaciju() {

    if (
      !datumPrijave ||
      !datumOdjave
    ) {

      Alert.alert(
        'Greška',
        'Odaberite datum prijave i datum odjave.'
      );

      return;

    }


    if (
      datumOdjave <=
      datumPrijave
    ) {

      Alert.alert(
        'Greška',
        'Datum odjave mora biti nakon datuma prijave.'
      );

      return;

    }


    const danas =
      new Date();


    danas.setHours(
      0,
      0,
      0,
      0
    );


    if (
      datumPrijave < danas
    ) {

      Alert.alert(
        'Greška',
        'Datum prijave ne može biti u prošlosti.'
      );

      return;

    }


    const token =
      await getToken();


    if (!token) {

      Alert.alert(
        'Niste prijavljeni',
        'Morate se prijaviti prije rezervacije.'
      );


      router.push('/login');

      return;

    }


    try {

      setLoading(true);


      const rezultat =
        await createReservation(
          Number(kampId),

          formatirajDatumZaServer(
            datumPrijave
          ),

          formatirajDatumZaServer(
            datumOdjave
          ),

          token,

          odabranaOprema
        );


      Alert.alert(
        'Uspješna rezervacija',

        rezultat.message ||
        'Rezervacija je uspješno kreirana.'
      );


      router.replace(
        '/(tabs)/reservations'
      );


    } catch (error: any) {

      console.error(
        'Greška pri rezervaciji:',
        error
      );


      Alert.alert(
        'Greška',

        error.message ||
        'Nije moguće napraviti rezervaciju.'
      );


    } finally {

      setLoading(false);

    }

  }


  // =====================================================
  // LOADING KAMPA
  // =====================================================

  if (loadingKamp) {

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


  // =====================================================
  // INTERFEJS
  // =====================================================

  return (

    <ProtectedScreen>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* =================================================
            UVODNA KARTICA
        ================================================= */}

        <View style={styles.campCard}>

          <View style={styles.campIconContainer}>

            <Ionicons
              name="bonfire-outline"
              size={30}
              color="#81C784"
            />

          </View>


          <View style={styles.campInfo}>

            <Text style={styles.campLabel}>
              Rezervacija kampa
            </Text>

            <Text style={styles.campName}>
              {kamp?.naziv}
            </Text>

          </View>

        </View>


        {/* =================================================
            CIJENA KAMPA
        ================================================= */}

        <View style={styles.basePriceCard}>

          <View style={styles.basePriceIcon}>

            <Ionicons
              name="pricetag-outline"
              size={22}
              color="#81C784"
            />

          </View>


          <View>

            <Text style={styles.basePriceLabel}>
              Cijena smještaja
            </Text>

            <Text style={styles.price}>

              {Number(
                kamp?.cijena_po_noci || 0
              ).toFixed(2)}

              <Text style={styles.priceUnit}>
                {' '}KM / noć
              </Text>

            </Text>

          </View>

        </View>


        {/* =================================================
            DATUMI
        ================================================= */}

        <Text style={styles.sectionTitle}>
          Odaberite period boravka
        </Text>


        <View style={styles.dateCard}>

          {/* DATUM PRIJAVE */}

          <View style={styles.dateSection}>

            <View style={styles.dateIconContainer}>

              <Ionicons
                name="log-in-outline"
                size={22}
                color="#81C784"
              />

            </View>


            <View style={styles.dateInfo}>

              <Text style={styles.dateLabel}>
                Datum prijave
              </Text>

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() =>
                  setShowPrijava(true)
                }
              >

                <Text
                  style={
                    datumPrijave
                      ? styles.dateText
                      : styles.datePlaceholder
                  }
                >
                  {formatirajDatum(
                    datumPrijave
                  )}
                </Text>


                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#81C784"
                />

              </TouchableOpacity>

            </View>

          </View>


          <View style={styles.dateDivider} />


          {/* DATUM ODJAVE */}

          <View style={styles.dateSection}>

            <View style={styles.dateIconContainer}>

              <Ionicons
                name="log-out-outline"
                size={22}
                color="#81C784"
              />

            </View>


            <View style={styles.dateInfo}>

              <Text style={styles.dateLabel}>
                Datum odjave
              </Text>

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() =>
                  setShowOdjava(true)
                }
              >

                <Text
                  style={
                    datumOdjave
                      ? styles.dateText
                      : styles.datePlaceholder
                  }
                >
                  {formatirajDatum(
                    datumOdjave
                  )}
                </Text>


                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#81C784"
                />

              </TouchableOpacity>

            </View>

          </View>

        </View>


        {/* =================================================
            DATE PICKERI
        ================================================= */}

        {showPrijava && (

          <DateTimePicker

            value={
              datumPrijave ||
              new Date()
            }

            mode="date"

            minimumDate={
              new Date()
            }

            onChange={(
              event,
              selectedDate
            ) => {

              setShowPrijava(false);


              if (selectedDate) {

                setDatumPrijave(
                  selectedDate
                );


                if (
                  datumOdjave &&
                  datumOdjave <=
                  selectedDate
                ) {

                  setDatumOdjave(
                    null
                  );

                }

              }

            }}

          />

        )}


        {showOdjava && (

          <DateTimePicker

            value={
              datumOdjave ||
              datumPrijave ||
              new Date()
            }

            mode="date"

            minimumDate={
              datumPrijave ||
              new Date()
            }

            onChange={(
              event,
              selectedDate
            ) => {

              setShowOdjava(false);


              if (selectedDate) {

                setDatumOdjave(
                  selectedDate
                );

              }

            }}

          />

        )}


        {/* =================================================
            DODATNA OPREMA
        ================================================= */}

        <View style={styles.sectionHeader}>

          <Ionicons
            name="construct-outline"
            size={21}
            color="#81C784"
          />

          <Text style={styles.sectionTitleInline}>
            Dodatna oprema
          </Text>

        </View>


        {loadingOprema ? (

          <View style={styles.equipmentLoading}>

            <ActivityIndicator
              color="#81C784"
            />

            <Text style={styles.loadingText}>
              Učitavanje opreme...
            </Text>

          </View>

        ) : oprema.length === 0 ? (

          <View style={styles.noEquipment}>

            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#9E9E9E"
            />

            <Text style={styles.noEquipmentText}>
              Za ovaj kamp trenutno nema dostupne
              dodatne opreme.
            </Text>

          </View>

        ) : (

          <View style={styles.equipmentList}>

            {oprema.map(
              stavka => {

                const odabranaKolicina =
                  pronadjiOdabranuKolicinu(
                    stavka.id
                  );


                const cijenaPoDanu =
                  Number(
                    stavka.cijena
                  );


                const ukupnaCijenaStavke =
                  brojNoci > 0
                    ? cijenaPoDanu *
                      odabranaKolicina *
                      brojNoci
                    : 0;


                return (

                  <View
                    key={stavka.id}
                    style={[
                      styles.equipmentCard,
                      odabranaKolicina > 0 &&
                      styles.equipmentCardSelected,
                    ]}
                  >

                    <View style={styles.equipmentTop}>

                      <View style={styles.equipmentIconContainer}>

                        <Ionicons
                          name={
                            stavka.naziv === 'Bicikl'
                              ? 'bicycle-outline'
                              : stavka.naziv === 'Kajak'
                              ? 'boat-outline'
                              : stavka.naziv === 'Čamac'
                              ? 'boat-outline'
                              : 'bonfire-outline'
                          }
                          size={25}
                          color="#81C784"
                        />

                      </View>


                      <View style={styles.equipmentInfo}>

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


                        <View
                          style={
                            styles.equipmentPriceRow
                          }
                        >

                          <Ionicons
                            name="pricetag-outline"
                            size={15}
                            color="#81C784"
                          />

                          <Text
                            style={
                              styles.equipmentPrice
                            }
                          >
                            {cijenaPoDanu.toFixed(2)}
                            {' '}KM
                          </Text>

                          <Text
                            style={
                              styles.equipmentUnit
                            }
                          >
                            / {stavka.jedinica}
                          </Text>

                        </View>


                        <Text
                          style={
                            styles.availableText
                          }
                        >
                          Dostupno: {stavka.kolicina}
                        </Text>


                        {odabranaKolicina > 0 &&
                          brojNoci > 0 && (

                          <Text
                            style={
                              styles.equipmentTotal
                            }
                          >
                            Ukupno: {' '}
                            {ukupnaCijenaStavke.toFixed(2)}
                            {' '}KM
                          </Text>

                        )}

                      </View>

                    </View>


                    {/* KOLIČINA */}

                    <View style={styles.quantityRow}>

                      <Text style={styles.quantityLabel}>
                        Količina
                      </Text>


                      <View
                        style={
                          styles.quantityContainer
                        }
                      >

                        <TouchableOpacity
                          style={[
                            styles.quantityButton,
                            odabranaKolicina === 0 &&
                            styles.quantityButtonDisabled,
                          ]}
                          onPress={() =>
                            smanjiKolicinu(
                              stavka.id
                            )
                          }
                          disabled={
                            odabranaKolicina === 0
                          }
                        >

                          <Ionicons
                            name="remove"
                            size={21}
                            color={
                              odabranaKolicina === 0
                                ? '#555555'
                                : '#81C784'
                            }
                          />

                        </TouchableOpacity>


                        <Text
                          style={
                            styles.quantityText
                          }
                        >
                          {odabranaKolicina}
                        </Text>


                        <TouchableOpacity
                          style={
                            styles.quantityButton
                          }
                          onPress={() =>
                            povecajKolicinu(
                              stavka.id
                            )
                          }
                        >

                          <Ionicons
                            name="add"
                            size={21}
                            color="#81C784"
                          />

                        </TouchableOpacity>

                      </View>

                    </View>

                  </View>

                );

              }
            )}

          </View>

        )}


        {/* =================================================
            PREGLED REZERVACIJE
        ================================================= */}

        {brojNoci > 0 && (

          <View style={styles.summary}>

            <View style={styles.summaryHeader}>

              <View style={styles.summaryIconContainer}>

                <Ionicons
                  name="receipt-outline"
                  size={22}
                  color="#81C784"
                />

              </View>


              <Text style={styles.summaryTitle}>
                Pregled rezervacije
              </Text>

            </View>


            <View style={styles.summaryRow}>

              <View style={styles.summaryLabelContainer}>

                <Ionicons
                  name="moon-outline"
                  size={17}
                  color="#9E9E9E"
                />

                <Text style={styles.summaryLabel}>
                  Broj noći
                </Text>

              </View>

              <Text style={styles.summaryValue}>
                {brojNoci}
              </Text>

            </View>


            <View style={styles.summaryRow}>

              <View style={styles.summaryLabelContainer}>

                <Ionicons
                  name="bonfire-outline"
                  size={17}
                  color="#9E9E9E"
                />

                <Text style={styles.summaryLabel}>
                  Cijena kampa
                </Text>

              </View>

              <Text style={styles.summaryValue}>
                {cijenaKampa.toFixed(2)} KM
              </Text>

            </View>


            <View style={styles.summaryRow}>

              <View style={styles.summaryLabelContainer}>

                <Ionicons
                  name="construct-outline"
                  size={17}
                  color="#9E9E9E"
                />

                <Text style={styles.summaryLabel}>
                  Oprema
                </Text>

              </View>

              <Text style={styles.summaryValue}>
                {cijenaOpreme.toFixed(2)} KM
              </Text>

            </View>


            <View style={styles.divider} />


            <View style={styles.totalRow}>

              <Text style={styles.totalLabel}>
                Ukupno
              </Text>

              <Text style={styles.total}>
                {ukupnaCijena.toFixed(2)} KM
              </Text>

            </View>

          </View>

        )}


        {/* =================================================
            POTVRDA
        ================================================= */}

        <TouchableOpacity
          style={[
            styles.button,
            (
              loading ||
              !datumPrijave ||
              !datumOdjave
            ) &&
            styles.buttonDisabled,
          ]}
          onPress={
            potvrdiRezervaciju
          }
          disabled={
            loading ||
            !datumPrijave ||
            !datumOdjave
          }
        >

          {loading ? (

            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />

          ) : (

            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color="#FFFFFF"
            />

          )}


          <Text style={styles.buttonText}>

            {loading
              ? 'Slanje...'
              : 'Potvrdi rezervaciju'}

          </Text>

        </TouchableOpacity>


      </ScrollView>

    </ProtectedScreen>

  );

}


// =====================================================
// STILOVI
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#121212',
  },


  content: {
    padding: 20,
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
    marginTop: 8,
    fontSize: 15,
    color: '#BDBDBD',
  },


  campCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
  },


  campIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },


  campInfo: {
    flex: 1,
  },


  campLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 3,
  },


  campName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },


  basePriceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 15,
    padding: 15,
    marginBottom: 6,
  },


  basePriceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },


  basePriceLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 2,
  },


  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#81C784',
  },


  priceUnit: {
    fontSize: 13,
    fontWeight: 'normal',
    color: '#BDBDBD',
  },


  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 22,
    marginBottom: 12,
  },


  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 12,
  },


  sectionTitleInline: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },


  dateCard: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 15,
    padding: 15,
  },


  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  dateIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },


  dateInfo: {
    flex: 1,
  },


  dateLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 5,
  },


  dateButton: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#2C2C2C',
    backgroundColor: '#181818',
    borderRadius: 9,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },


  dateText: {
    fontSize: 15,
    color: '#FFFFFF',
  },


  datePlaceholder: {
    fontSize: 15,
    color: '#757575',
  },


  dateDivider: {
    height: 1,
    backgroundColor: '#2C2C2C',
    marginVertical: 15,
  },


  equipmentLoading: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
  },


  noEquipment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 12,
    padding: 15,
  },


  noEquipmentText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#9E9E9E',
    marginLeft: 10,
  },


  equipmentList: {
    gap: 12,
  },


  equipmentCard: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 14,
    padding: 15,
  },


  equipmentCardSelected: {
    borderColor: '#2E7D32',
  },


  equipmentTop: {
    flexDirection: 'row',
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


  equipmentInfo: {
    flex: 1,
  },


  equipmentName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },


  equipmentDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#BDBDBD',
    marginBottom: 7,
  },


  equipmentPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  equipmentPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#81C784',
    marginLeft: 5,
  },


  equipmentUnit: {
    fontSize: 13,
    color: '#9E9E9E',
    marginLeft: 4,
  },


  availableText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 5,
  },


  equipmentTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#81C784',
    marginTop: 5,
  },


  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2C',
    marginTop: 13,
    paddingTop: 13,
  },


  quantityLabel: {
    fontSize: 13,
    color: '#BDBDBD',
  },


  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  quantityButton: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 9,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
  },


  quantityButtonDisabled: {
    borderColor: '#2C2C2C',
    backgroundColor: '#181818',
  },


  quantityText: {
    width: 40,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },


  summary: {
    marginTop: 24,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 15,
    padding: 17,
  },


  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },


  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },


  summaryTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },


  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
  },


  summaryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  summaryLabel: {
    fontSize: 14,
    color: '#BDBDBD',
    marginLeft: 7,
  },


  summaryValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },


  divider: {
    height: 1,
    backgroundColor: '#2C2C2C',
    marginVertical: 5,
  },


  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },


  totalLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },


  total: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#81C784',
  },


  button: {
    height: 52,
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },


  buttonDisabled: {
    backgroundColor: '#263527',
  },


  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },

});