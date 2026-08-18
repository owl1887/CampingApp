import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import CampCard from '@/components/CampCard';

export default function HomeScreen() {

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >

      {/* HEADER */}

      <View style={styles.header}>

        <View>
          <Text style={styles.welcome}>
            Dobrodošli! 👋
          </Text>

          <Text style={styles.subtitle}>
            Pronađite savršeno mjesto za kampovanje.
          </Text>
        </View>

        <Text style={styles.logo}>
          ⛺
        </Text>

      </View>


      {/* POPULARNA KAMP MJESTA */}

      <Text style={styles.sectionTitle}>
        Popularna kamp mjesta
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >

        <CampCard
          naziv="Kamp Plivsko jezero"
          opis="Prekrasna lokacija uz jezero."
          cijena={25}
        />

        <CampCard
          naziv="Kamp Una"
          opis="Mirna lokacija uz rijeku."
          cijena={22}
        />

        <CampCard
          naziv="Kamp Vrbas"
          opis="Idealno mjesto za odmor."
          cijena={20}
        />

      </ScrollView>


      {/* AKCIJE */}

      <Text style={styles.sectionTitle}>
        Kamp mjesta na akciji
      </Text>

      <CampCard
        naziv="Kamp Jajce"
        opis="Posebna ponuda ovog mjeseca."
        cijena={18}
      />

      <CampCard
        naziv="Kamp Drina"
        opis="Odlična lokacija za ljubitelje prirode."
        cijena={20}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },

  welcome: {
    fontSize: 25,
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: 15,
    marginTop: 5,
    maxWidth: 280,
  },

  logo: {
    fontSize: 40,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
  },

});