import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { IMAGE_URL } from '@/services/api';

type CampCardProps = {
  naziv: string;
  opis: string;
  cijena: number;
  slikaUrl?: string;
  onPress?: () => void;
};

export default function CampCard({
  naziv,
  opis,
  cijena,
  slikaUrl,
  onPress,
}: CampCardProps) {

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >

      {/* SLIKA KAMPA */}

      {slikaUrl ? (
        <Image
          source={{
            uri: `${IMAGE_URL}${slikaUrl}`,
          }}
          style={styles.campImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>

          <Ionicons
            name="bonfire-outline"
            size={48}
            color="#81C784"
          />

          <Text style={styles.imageText}>
            Kamp mjesto
          </Text>

        </View>
      )}


      {/* SADRŽAJ KARTICE */}

      <View style={styles.content}>

        <Text
          style={styles.title}
          numberOfLines={1}
        >
          {naziv}
        </Text>


        <Text
          style={styles.description}
          numberOfLines={2}
        >
          {opis}
        </Text>


        <View style={styles.bottomRow}>

          {/* CIJENA */}

          <View>

            <Text style={styles.priceLabel}>
              Cijena po noći
            </Text>

            <View style={styles.priceRow}>

              <Ionicons
                name="pricetag-outline"
                size={16}
                color="#81C784"
              />

              <Text style={styles.price}>
                {cijena} KM
              </Text>

            </View>

          </View>


          {/* DUGME */}

          <View style={styles.detailsButton}>

            <Text style={styles.detailsButtonText}>
              Detalji
            </Text>

            <Ionicons
              name="arrow-forward-outline"
              size={15}
              color="#FFFFFF"
            />

          </View>

        </View>

      </View>

    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({

  /* KARTICA */

  card: {
    width: 285,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    overflow: 'hidden',
    marginRight: 15,
  },


  /* SLIKA */

  campImage: {
    width: '100%',
    height: 155,
  },


  imagePlaceholder: {
    height: 155,
    backgroundColor: '#17251A',
    justifyContent: 'center',
    alignItems: 'center',
  },


  imageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#BDBDBD',
    marginTop: 6,
  },


  /* SADRŽAJ */

  content: {
    padding: 15,
  },


  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 7,
  },


  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#BDBDBD',
    marginBottom: 15,
  },


  /* DONJI RED */

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },


  /* CIJENA */

  priceLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 4,
  },


  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },


  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#81C784',
  },


  /* DUGME DETALJI */

  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2E7D32',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
  },


  detailsButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

});