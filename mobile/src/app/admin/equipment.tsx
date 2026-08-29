import { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import {
  getEquipmentByCamp,
  addEquipment,
  updateEquipment,
  deleteEquipment,
  getKampById,
} from '@/services/api';

import { getToken } from '@/services/auth';


type Oprema = {
  id: number;
  kamp_id: number;
  naziv: string;
  opis: string;
  cijena: number | string;
  jedinica: string;
  kolicina: number;
  aktivno: boolean;
};


type Kamp = {
  id: number;
  naziv: string;
};


export default function EquipmentScreen() {

  const { id } =
    useLocalSearchParams<{ id: string }>();


  const kampId =
    Number(id);


  const [kamp, setKamp] =
    useState<Kamp | null>(null);


  const [oprema, setOprema] =
    useState<Oprema[]>([]);


  const [loading, setLoading] =
    useState(true);


  const [modalVisible, setModalVisible] =
    useState(false);


  const [editMode, setEditMode] =
    useState(false);


  const [selectedEquipmentId, setSelectedEquipmentId] =
    useState<number | null>(null);


  const [naziv, setNaziv] =
    useState('');


  const [opis, setOpis] =
    useState('');


  const [cijena, setCijena] =
    useState('');


  const [jedinica, setJedinica] =
    useState('dan');


  const [kolicina, setKolicina] =
    useState('1');


  const [saving, setSaving] =
    useState(false);


  async function ucitajPodatke() {

    try {

      setLoading(true);


      if (!kampId || Number.isNaN(kampId)) {

        Alert.alert(
          'Greška',
          'ID kampa nije ispravan.'
        );

        return;
      }


      const kampPodaci =
        await getKampById(kampId);


      setKamp(kampPodaci);


      const opremaPodaci =
        await getEquipmentByCamp(kampId);


      setOprema(
        opremaPodaci.oprema || []
      );


    } catch (error: any) {

      console.error(
        'Greška pri učitavanju opreme:',
        error
      );


      Alert.alert(
        'Greška',
        error.message ||
        'Nije moguće učitati opremu.'
      );


    } finally {

      setLoading(false);

    }

  }


  useFocusEffect(
    useCallback(() => {

      ucitajPodatke();

    }, [kampId])
  );


  function otvoriDodavanje() {

    setEditMode(false);

    setSelectedEquipmentId(null);

    setNaziv('');

    setOpis('');

    setCijena('');

    setJedinica('dan');

    setKolicina('1');

    setModalVisible(true);

  }


  function otvoriUredjivanje(
    stavka: Oprema
  ) {

    setEditMode(true);

    setSelectedEquipmentId(
      stavka.id
    );

    setNaziv(
      stavka.naziv
    );

    setOpis(
      stavka.opis || ''
    );

    setCijena(
      String(stavka.cijena)
    );

    setJedinica(
      stavka.jedinica
    );

    setKolicina(
      String(stavka.kolicina)
    );

    setModalVisible(true);

  }


  function zatvoriFormu() {

    setModalVisible(false);

    setEditMode(false);

    setSelectedEquipmentId(null);

  }


  async function sacuvajOpremu() {

    try {

      if (!naziv.trim()) {

        Alert.alert(
          'Greška',
          'Naziv opreme je obavezan.'
        );

        return;
      }


      const cijenaBroj =
        Number(
          cijena.replace(',', '.')
        );


      const kolicinaBroj =
        Number(kolicina);


      if (
        Number.isNaN(cijenaBroj) ||
        cijenaBroj < 0
      ) {

        Alert.alert(
          'Greška',
          'Cijena mora biti ispravan broj.'
        );

        return;
      }


      if (
        Number.isNaN(kolicinaBroj) ||
        kolicinaBroj < 1
      ) {

        Alert.alert(
          'Greška',
          'Količina mora biti najmanje 1.'
        );

        return;
      }


      const token =
        await getToken();


      if (!token) {

        Alert.alert(
          'Niste prijavljeni',
          'Morate se prijaviti kao administrator.'
        );

        router.replace('/login');

        return;
      }


      setSaving(true);


      if (
        editMode &&
        selectedEquipmentId !== null
      ) {

        await updateEquipment(
          selectedEquipmentId,
          naziv.trim(),
          opis.trim(),
          cijenaBroj,
          jedinica.trim() || 'dan',
          kolicinaBroj,
          true,
          token
        );


        Alert.alert(
          'Uspješno',
          'Oprema je uspješno izmijenjena.'
        );


      } else {

        await addEquipment(
          kampId,
          naziv.trim(),
          opis.trim(),
          cijenaBroj,
          jedinica.trim() || 'dan',
          kolicinaBroj,
          token
        );


        Alert.alert(
          'Uspješno',
          'Oprema je uspješno dodana.'
        );

      }


      zatvoriFormu();

      await ucitajPodatke();


    } catch (error: any) {

      console.error(
        'Greška pri čuvanju opreme:',
        error
      );


      Alert.alert(
        'Greška',
        error.message ||
        'Nije moguće sačuvati opremu.'
      );


    } finally {

      setSaving(false);

    }

  }


  function potvrdiDeaktivaciju(
    stavka: Oprema
  ) {

    Alert.alert(
      'Deaktivacija opreme',
      `Da li ste sigurni da želite deaktivirati "${stavka.naziv}"?`,
      [
        {
          text: 'Odustani',
          style: 'cancel',
        },

        {
          text: 'Deaktiviraj',
          style: 'destructive',

          onPress: async () => {

            try {

              const token =
                await getToken();


              if (!token) {

                Alert.alert(
                  'Greška',
                  'Niste prijavljeni.'
                );

                return;
              }


              await deleteEquipment(
                stavka.id,
                token
              );


              Alert.alert(
                'Uspješno',
                'Oprema je uspješno deaktivirana.'
              );


              await ucitajPodatke();


            } catch (error: any) {

              console.error(
                'Greška pri deaktivaciji opreme:',
                error
              );


              Alert.alert(
                'Greška',
                error.message ||
                'Nije moguće deaktivirati opremu.'
              );

            }

          },

        },

      ]
    );

  }


  if (loading) {

    return (

      <View style={styles.center}>

        <ActivityIndicator
          size="large"
        />

        <Text style={styles.loadingText}>
          Učitavanje opreme...
        </Text>

      </View>

    );

  }


  return (

    <View style={styles.container}>

      <ScrollView
        contentContainerStyle={styles.content}
      >

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >

          <Text style={styles.backButtonText}>
            ← Nazad
          </Text>

        </TouchableOpacity>


        <Text style={styles.title}>
          Oprema
        </Text>


        {kamp && (

          <Text style={styles.campName}>
            {kamp.naziv}
          </Text>

        )}


        <TouchableOpacity
          style={styles.addButton}
          onPress={otvoriDodavanje}
        >

          <Text style={styles.buttonText}>
            + Dodaj opremu
          </Text>

        </TouchableOpacity>


        <Text style={styles.sectionTitle}>
          Dostupna oprema
        </Text>


        {oprema.length === 0 ? (

          <View style={styles.emptyContainer}>

            <Text style={styles.emptyText}>
              Ovaj kamp trenutno nema
              dostupne opreme.
            </Text>

          </View>

        ) : (

          oprema.map((stavka) => (

            <View
              key={stavka.id}
              style={styles.card}
            >

              <Text style={styles.cardTitle}>
                {stavka.naziv}
              </Text>


              {stavka.opis ? (

                <Text style={styles.description}>
                  {stavka.opis}
                </Text>

              ) : null}


              <Text style={styles.price}>
                {Number(
                  stavka.cijena
                ).toFixed(2)} KM / {stavka.jedinica}
              </Text>


              <Text style={styles.quantity}>
                Dostupna količina:
                {' '}
                {stavka.kolicina}
              </Text>


              <View style={styles.actions}>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    otvoriUredjivanje(stavka)
                  }
                >

                  <Text style={styles.buttonText}>
                    Uredi
                  </Text>

                </TouchableOpacity>


                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    potvrdiDeaktivaciju(stavka)
                  }
                >

                  <Text style={styles.deleteButtonText}>
                    Deaktiviraj
                  </Text>

                </TouchableOpacity>

              </View>

            </View>

          ))

        )}

      </ScrollView>


      {modalVisible && (

        <View style={styles.formOverlay}>

          <View style={styles.formContainer}>

            <ScrollView>

              <Text style={styles.formTitle}>
                {editMode
                  ? 'Uredi opremu'
                  : 'Dodaj opremu'}
              </Text>


              <Text style={styles.inputLabel}>
                Naziv opreme
              </Text>

              <TextInput
                style={styles.input}
                value={naziv}
                onChangeText={setNaziv}
                placeholder="npr. Kajak"
              />


              <Text style={styles.inputLabel}>
                Opis
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                ]}
                value={opis}
                onChangeText={setOpis}
                placeholder="Opis opreme"
                multiline
              />


              <Text style={styles.inputLabel}>
                Cijena
              </Text>

              <TextInput
                style={styles.input}
                value={cijena}
                onChangeText={setCijena}
                placeholder="npr. 20"
                keyboardType="decimal-pad"
              />


              <Text style={styles.inputLabel}>
                Jedinica
              </Text>

              <TextInput
                style={styles.input}
                value={jedinica}
                onChangeText={setJedinica}
                placeholder="npr. dan"
              />


              <Text style={styles.inputLabel}>
                Količina
              </Text>

              <TextInput
                style={styles.input}
                value={kolicina}
                onChangeText={setKolicina}
                placeholder="npr. 5"
                keyboardType="numeric"
              />


              <TouchableOpacity
                style={styles.saveButton}
                onPress={sacuvajOpremu}
                disabled={saving}
              >

                {saving ? (

                  <ActivityIndicator
                    size="small"
                  />

                ) : (

                  <Text style={styles.buttonText}>
                    {editMode
                      ? 'SAČUVAJ IZMJENE'
                      : 'DODAJ OPREMU'}
                  </Text>

                )}

              </TouchableOpacity>


              <TouchableOpacity
                style={styles.cancelButton}
                onPress={zatvoriFormu}
                disabled={saving}
              >

                <Text style={styles.cancelButtonText}>
                  ODUSTANI
                </Text>

              </TouchableOpacity>

            </ScrollView>

          </View>

        </View>

      )}

    </View>

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
    marginTop: 10,
    fontSize: 16,
  },


  backButton: {
    marginBottom: 15,
  },


  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },


  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 5,
  },


  campName: {
    fontSize: 19,
    marginBottom: 20,
  },


  addButton: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 25,
  },


  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },


  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
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
    marginBottom: 5,
  },


  quantity: {
    fontSize: 15,
    marginTop: 3,
  },


  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },


  editButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },


  deleteButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },


  deleteButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },


  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },


  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },


  formOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },


  formContainer: {
    maxHeight: '90%',
    borderWidth: 1,
    borderRadius: 15,
    padding: 20,
  },


  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },


  inputLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },


  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },


  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },


  saveButton: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },


  cancelButton: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },


  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

});