import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type CampCardProps = {
  naziv: string;
  opis: string;
  cijena: number;
  onPress?: () => void;
};

export default function CampCard({
  naziv,
  opis,
  cijena,
  onPress,
}: CampCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.imagePlaceholder}>
        <Text>SLIKA KAMPA</Text>
      </View>

      <View style={styles.content}>

        <Text style={styles.title}>
          {naziv}
        </Text>

        <Text style={styles.description}>
          {opis}
        </Text>

        <Text style={styles.price}>
          {cijena} € / noć
        </Text>

      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({

  card: {
    width: 280,
    borderRadius: 15,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: 15,
  },

  imagePlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    padding: 15,
  },

  title: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  description: {
    fontSize: 14,
    marginBottom: 10,
  },

  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },

});