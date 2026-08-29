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

import {
createReservation,
getKampById,
getEquipmentByCamp,
} from '@/services/api';

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

export default function ReservationScreen() {

const { kampId } = useLocalSearchParams();
const router = useRouter();

const [kamp, setKamp] =
useState<Kamp | null>(null);

const [oprema, setOprema] =
useState<Oprema[]>([]);

const [odabranaOprema, setOdabranaOprema] =
useState<OdabranaOprema[]>([]);

const [loadingKamp, setLoadingKamp] =
useState(true);

const [loadingOprema, setLoadingOprema] =
useState(true);

const [datumPrijave, setDatumPrijave] =
useState<Date | null>(null);

const [datumOdjave, setDatumOdjave] =
useState<Date | null>(null);

const [showPrijava, setShowPrijava] =
useState(false);

const [showOdjava, setShowOdjava] =
useState(false);

const [loading, setLoading] =
useState(false);

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


    // =====================================================
    // Učitavanje kampa
    // =====================================================

    const podaci =
      await getKampById(kampIdBroj);


    setKamp(podaci);


    // =====================================================
    // Učitavanje opreme
    // =====================================================

    const opremaPodaci =
      await getEquipmentByCamp(
        kampIdBroj
      );


    setOprema(
      opremaPodaci.oprema || []
    );


  } catch (error) {

    console.error(
      'Greška pri učitavanju podataka:',
      error
    );


    Alert.alert(
      'Greška',
      'Nije moguće učitati podatke o kampu i opremi.'
    );


  } finally {

    setLoadingKamp(false);
    setLoadingOprema(false);

  }

}


ucitajPodatke();


}, [kampId]);

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

const cijenaKampa =
kamp && brojNoci > 0
? brojNoci *
Number(kamp.cijena_po_noci)
: 0;

function pronadjiOdabranuKolicinu(
opremaId: number
) {


const stavka =
  odabranaOprema.find(
    item =>
      item.oprema_id === opremaId
  );


return stavka
  ? stavka.kolicina
  : 0;


}

function povecajKolicinu(
opremaId: number
) {


const stavka =
  oprema.find(
    item =>
      item.id === opremaId
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
          item.oprema_id === opremaId
      );


    if (postoji) {

      return prethodne.map(
        item =>
          item.oprema_id === opremaId
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
        item.oprema_id === opremaId
          ? {
              ...item,
              kolicina:
                item.kolicina - 1,
            }
          : item
    )
);


}

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

const ukupnaCijena =
cijenaKampa +
cijenaOpreme;

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

  Alert.alert(
    'Greška',

    error.message ||
    'Nije moguće napraviti rezervaciju.'
  );


} finally {

  setLoading(false);

}


}

if (loadingKamp) {


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

return (


<ProtectedScreen>

  <ScrollView
    style={styles.container}
    contentContainerStyle={styles.content}
  >

    <Text style={styles.title}>
      Rezervacija
    </Text>


    <Text style={styles.campName}>
      {kamp?.naziv}
    </Text>


    <Text style={styles.label}>
      Cijena po noći
    </Text>


    <Text style={styles.price}>
      {Number(
        kamp?.cijena_po_noci || 0
      ).toFixed(2)} KM
    </Text>


    {/* =====================================================
        DATUM PRIJAVE
    ===================================================== */}

    <Text style={styles.label}>
      Datum prijave
    </Text>


    <TouchableOpacity
      style={styles.dateButton}
      onPress={() =>
        setShowPrijava(true)
      }
    >

      <Text style={styles.dateText}>
        {formatirajDatum(
          datumPrijave
        )}
      </Text>

    </TouchableOpacity>


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


    {/* =====================================================
        DATUM ODJAVE
    ===================================================== */}

    <Text style={styles.label}>
      Datum odjave
    </Text>


    <TouchableOpacity
      style={styles.dateButton}
      onPress={() =>
        setShowOdjava(true)
      }
    >

      <Text style={styles.dateText}>
        {formatirajDatum(
          datumOdjave
        )}
      </Text>

    </TouchableOpacity>


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


    {/* =====================================================
        OPREMA
    ===================================================== */}

    <Text style={styles.sectionTitle}>
      Dodatna oprema
    </Text>


    {loadingOprema ? (

      <View style={styles.equipmentLoading}>

        <ActivityIndicator />

        <Text style={styles.loadingText}>
          Učitavanje opreme...
        </Text>

      </View>

    ) : oprema.length === 0 ? (

      <View style={styles.noEquipment}>

        <Text style={styles.noEquipmentText}>
          Za ovaj kamp trenutno nema dostupne dodatne opreme.
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
                style={styles.equipmentCard}
              >

                <View
                  style={
                    styles.equipmentInfo
                  }
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


                  <Text
                    style={
                      styles.equipmentPrice
                    }
                  >
                    {cijenaPoDanu.toFixed(2)} KM /
                    {' '}
                    {stavka.jedinica}
                  </Text>


                  <Text
                    style={
                      styles.availableText
                    }
                  >
                    Dostupno:
                    {' '}
                    {stavka.kolicina}
                  </Text>


                  {odabranaKolicina > 0 &&
                    brojNoci > 0 && (

                    <Text
                      style={
                        styles.equipmentTotal
                      }
                    >
                      Ukupno:
                      {' '}
                      {ukupnaCijenaStavke.toFixed(2)}
                      {' '}
                      KM
                    </Text>

                  )}

                </View>


                <View
                  style={
                    styles.quantityContainer
                  }
                >

                  <TouchableOpacity
                    style={
                      styles.quantityButton
                    }
                    onPress={() =>
                      smanjiKolicinu(
                        stavka.id
                      )
                    }
                  >

                    <Text
                      style={
                        styles.quantityButtonText
                      }
                    >
                      −
                    </Text>

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

                    <Text
                      style={
                        styles.quantityButtonText
                      }
                    >
                      +
                    </Text>

                  </TouchableOpacity>

                </View>

              </View>

            );

          }
        )}

      </View>

    )}


    {/* =====================================================
        PREGLED REZERVACIJE
    ===================================================== */}

    {brojNoci > 0 && (

      <View style={styles.summary}>

        <Text style={styles.summaryTitle}>
          Pregled rezervacije
        </Text>


        <Text style={styles.summaryText}>
          Broj noći:
          {' '}
          {brojNoci}
        </Text>


        <Text style={styles.summaryText}>
          Cijena kampa:
          {' '}
          {cijenaKampa.toFixed(2)}
          {' '}
          KM
        </Text>


        <Text style={styles.summaryText}>
          Oprema:
          {' '}
          {cijenaOpreme.toFixed(2)}
          {' '}
          KM
        </Text>


        <View
          style={styles.divider}
        />


        <Text style={styles.total}>
          Ukupno:
          {' '}
          {ukupnaCijena.toFixed(2)}
          {' '}
          KM
        </Text>

      </View>

    )}


    {/* =====================================================
        POTVRDA
    ===================================================== */}

    <TouchableOpacity
      style={styles.button}
      onPress={
        potvrdiRezervaciju
      }
      disabled={
        loading ||
        !datumPrijave ||
        !datumOdjave
      }
    >

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

const styles = StyleSheet.create({

container: {
flex: 1,
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
},

loadingText: {
marginTop: 8,
fontSize: 15,
},

title: {
fontSize: 28,
fontWeight: 'bold',
marginBottom: 10,
},

campName: {
fontSize: 20,
fontWeight: 'bold',
marginBottom: 20,
},

label: {
fontSize: 16,
fontWeight: 'bold',
marginTop: 15,
marginBottom: 7,
},

price: {
fontSize: 18,
fontWeight: 'bold',
},

dateButton: {
borderWidth: 1,
borderRadius: 8,
padding: 14,
},

dateText: {
fontSize: 16,
},

sectionTitle: {
fontSize: 21,
fontWeight: 'bold',
marginTop: 25,
marginBottom: 12,
},

equipmentLoading: {
alignItems: 'center',
padding: 20,
},

noEquipment: {
borderWidth: 1,
borderRadius: 10,
padding: 15,
},

noEquipmentText: {
fontSize: 15,
},

equipmentList: {
gap: 12,
},

equipmentCard: {
borderWidth: 1,
borderRadius: 12,
padding: 15,
},

equipmentInfo: {
marginBottom: 12,
},

equipmentName: {
fontSize: 18,
fontWeight: 'bold',
marginBottom: 5,
},

equipmentDescription: {
fontSize: 14,
lineHeight: 20,
marginBottom: 6,
},

equipmentPrice: {
fontSize: 15,
fontWeight: 'bold',
marginTop: 3,
},

availableText: {
fontSize: 14,
marginTop: 5,
},

equipmentTotal: {
fontSize: 15,
fontWeight: 'bold',
marginTop: 5,
},

quantityContainer: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'flex-end',
gap: 12,
},

quantityButton: {
width: 42,
height: 42,
borderWidth: 1,
borderRadius: 8,
justifyContent: 'center',
alignItems: 'center',
},

quantityButtonText: {
fontSize: 25,
fontWeight: 'bold',
},

quantityText: {
fontSize: 18,
fontWeight: 'bold',
minWidth: 25,
textAlign: 'center',
},

summary: {
marginTop: 25,
padding: 16,
borderWidth: 1,
borderRadius: 12,
},

summaryTitle: {
fontSize: 19,
fontWeight: 'bold',
marginBottom: 12,
},

summaryText: {
fontSize: 16,
marginBottom: 7,
},

divider: {
borderTopWidth: 1,
marginVertical: 10,
},

total: {
fontSize: 20,
fontWeight: 'bold',
marginTop: 8,
},

button: {
marginTop: 25,
padding: 15,
borderRadius: 10,
alignItems: 'center',
borderWidth: 1,
},

buttonText: {
fontSize: 18,
fontWeight: 'bold',
},

});
