import { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  router,
  useFocusEffect,
} from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Ionicons } from '@expo/vector-icons';

import { logout } from '@/services/auth';

import {
  deactivateProfile,
  getProfile,
} from '@/services/api';


type Korisnik = {
  id: number;
  ime_prezime: string;
  email: string;
  uloga: string;
};


export default function ProfileScreen() {

  const [korisnik, setKorisnik] =
    useState<Korisnik | null>(null);

  const [loading, setLoading] =
    useState(true);


  // =====================================================
  // UČITAVANJE PROFILA
  // =====================================================

  async function ucitajKorisnika() {

    try {

      const token =
        await AsyncStorage.getItem('token');


      if (!token) {

        setKorisnik(null);

        return;
      }


      const data =
        await getProfile(token);


      setKorisnik(
        data.korisnik
      );


    } catch (error) {

      console.error(
        'Greška pri učitavanju profila:',
        error
      );

      setKorisnik(null);

    } finally {

      setLoading(false);

    }

  }


  // =====================================================
  // AUTOMATSKO UČITAVANJE PROFILA
  // =====================================================

  useFocusEffect(
    useCallback(() => {

      ucitajKorisnika();

    }, [])
  );


  // =====================================================
  // ODJAVA
  // =====================================================

  async function odjava() {

    await logout();

    setKorisnik(null);


    Alert.alert(
      'Odjava',
      'Uspješno ste odjavljeni.'
    );

  }


  // =====================================================
  // DEAKTIVACIJA PROFILA
  // =====================================================

  async function deaktivirajProfil() {

    Alert.alert(
      'Deaktivacija računa',
      'Da li ste sigurni da želite deaktivirati svoj račun?',
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
                await AsyncStorage.getItem('token');


              if (!token) {

                Alert.alert(
                  'Greška',
                  'Niste prijavljeni.'
                );

                return;
              }


              await deactivateProfile(token);


              // Brišemo podatke prijavljenog korisnika
              await logout();


              setKorisnik(null);


              Alert.alert(
                'Račun deaktiviran',
                'Vaš korisnički račun je uspješno deaktiviran.'
              );


              router.replace('/login');


            } catch (error: any) {

              Alert.alert(
                'Greška',
                error.message ||
                'Nije moguće deaktivirati račun.'
              );

            }

          },

        },

      ]
    );

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
          Učitavanje profila...
        </Text>

      </View>

    );

  }


  // =====================================================
  // KORISNIK NIJE PRIJAVLJEN
  // =====================================================

  if (!korisnik) {

    return (

      <View style={styles.container}>

        <View style={styles.header}>

          <View style={styles.headerIconContainer}>

            <Ionicons
              name="person-outline"
              size={26}
              color="#81C784"
            />

          </View>

          <View>

            <Text style={styles.title}>
              Moj profil
            </Text>

            <Text style={styles.subtitle}>
              Upravljanje korisničkim računom
            </Text>

          </View>

        </View>


        <View style={styles.loginCard}>

          <View style={styles.largeIconContainer}>

            <Ionicons
              name="person-outline"
              size={44}
              color="#81C784"
            />

          </View>


          <Text style={styles.loginTitle}>
            Niste prijavljeni
          </Text>


          <Text style={styles.message}>
            Prijavite se kako biste mogli koristiti
            svoj profil, rezervacije i listu želja.
          </Text>


          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              router.push('/login')
            }
          >

            <Ionicons
              name="log-in-outline"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.buttonText}>
              PRIJAVA
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              router.push('/register')
            }
          >

            <Ionicons
              name="person-add-outline"
              size={19}
              color="#81C784"
            />

            <Text style={styles.secondaryButtonText}>
              REGISTRACIJA
            </Text>

          </TouchableOpacity>

        </View>

      </View>

    );

  }


  // =====================================================
  // PRIJAVLJEN KORISNIK
  // =====================================================

  return (

    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <View style={styles.headerIconContainer}>

          <Ionicons
            name="person-outline"
            size={26}
            color="#81C784"
          />

        </View>

        <View>

          <Text style={styles.title}>
            Moj profil
          </Text>

          <Text style={styles.subtitle}>
            Podaci korisničkog računa
          </Text>

        </View>

      </View>


      {/* PROFILNA KARTICA */}

      <View style={styles.profileCard}>

        <View style={styles.avatarContainer}>

          <Ionicons
            name="person"
            size={45}
            color="#81C784"
          />

        </View>


        <Text style={styles.name}>
          {korisnik.ime_prezime}
        </Text>


        <View style={styles.roleBadge}>

          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color="#81C784"
          />

          <Text style={styles.roleText}>
            {korisnik.uloga}
          </Text>

        </View>


        <View style={styles.profileSeparator} />


        {/* EMAIL */}

        <View style={styles.profileRow}>

          <View style={styles.infoIconContainer}>

            <Ionicons
              name="mail-outline"
              size={20}
              color="#81C784"
            />

          </View>

          <View style={styles.profileRowContent}>

            <Text style={styles.infoLabel}>
              Email
            </Text>

            <Text style={styles.infoValue}>
              {korisnik.email}
            </Text>

          </View>

        </View>


        {/* ULOGA */}

        <View style={styles.profileRow}>

          <View style={styles.infoIconContainer}>

            <Ionicons
              name="shield-outline"
              size={20}
              color="#81C784"
            />

          </View>

          <View style={styles.profileRowContent}>

            <Text style={styles.infoLabel}>
              Uloga
            </Text>

            <Text style={styles.infoValue}>
              {korisnik.uloga}
            </Text>

          </View>

        </View>

      </View>


      {/* ADMIN PANEL */}

      {korisnik.uloga === 'admin' && (

        <TouchableOpacity
          style={styles.adminButton}
          onPress={() =>
            router.push('/admin')
          }
        >

          <Ionicons
            name="settings-outline"
            size={20}
            color="#81C784"
          />

          <Text style={styles.adminButtonText}>
            ADMIN PANEL
          </Text>

          <Ionicons
            name="chevron-forward-outline"
            size={19}
            color="#81C784"
          />

        </TouchableOpacity>

      )}


      {/* ODJAVA */}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={odjava}
      >

        <Ionicons
          name="log-out-outline"
          size={20}
          color="#FFFFFF"
        />

        <Text style={styles.logoutButtonText}>
          ODJAVA
        </Text>

      </TouchableOpacity>


      {/* DEAKTIVACIJA */}

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={deaktivirajProfil}
      >

        <Ionicons
          name="person-remove-outline"
          size={19}
          color="#EF5350"
        />

        <Text style={styles.deleteButtonText}>
          DEAKTIVIRAJ RAČUN
        </Text>

      </TouchableOpacity>

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
  // PROFILNA KARTICA
  // =====================================================

  profileCard: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },


  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },


  name: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },


  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B3320',
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },


  roleText: {
    fontSize: 13,
    color: '#81C784',
    fontWeight: 'bold',
    marginLeft: 5,
  },


  profileSeparator: {
    width: '100%',
    height: 1,
    backgroundColor: '#2C2C2C',
    marginVertical: 18,
  },


  profileRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },


  infoIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#181818',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },


  profileRowContent: {
    flex: 1,
  },


  infoLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 2,
  },


  infoValue: {
    fontSize: 15,
    color: '#FFFFFF',
  },


  // =====================================================
  // ADMIN
  // =====================================================

  adminButton: {
    width: '100%',
    minHeight: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2E7D32',
    backgroundColor: '#1B3320',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },


  adminButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#81C784',
    marginLeft: 10,
  },


  // =====================================================
  // ODJAVA
  // =====================================================

  logoutButton: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 2,
  },


  logoutButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 7,
  },


  // =====================================================
  // DEAKTIVACIJA
  // =====================================================

  deleteButton: {
    width: '100%',
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#5A2929',
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },


  deleteButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#EF5350',
    marginLeft: 7,
  },


  // =====================================================
  // NEPRIJAVLJEN KORISNIK
  // =====================================================

  loginCard: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    marginTop: 20,
  },


  largeIconContainer: {
    width: 85,
    height: 85,
    borderRadius: 43,
    backgroundColor: '#1B3320',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },


  loginTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },


  message: {
    fontSize: 15,
    color: '#9E9E9E',
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 20,
  },


  button: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },


  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 7,
  },


  secondaryButton: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },


  secondaryButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#81C784',
    marginLeft: 7,
  },

});