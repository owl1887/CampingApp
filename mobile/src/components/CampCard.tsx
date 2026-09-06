import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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

      {/* Slika kampa */}

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

          <Text style={styles.imageIcon}>
            ⛺
          </Text>

          <Text style={styles.imageText}>
            Kamp mjesto
          </Text>

        </View>
      )}


      {/* Sadržaj kartice */}

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

          <View>

            <Text style={styles.priceLabel}>
              Cijena
            </Text>

            <Text style={styles.price}>
              {cijena} KM
              <Text style={styles.priceNight}>
                {' '} / noć
              </Text>
            </Text>

          </View>


          <View style={styles.detailsButton}>

            <Text style={styles.detailsButtonText}>
              Detalji
            </Text>

          </View>

        </View>

      </View>

    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({

  card: {
    width: 285,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: 15,
  },


  campImage: {
    width: '100%',
    height: 155,
  },


  imagePlaceholder: {
    height: 155,
    justifyContent: 'center',
    alignItems: 'center',
  },


  imageIcon: {
    fontSize: 42,
    marginBottom: 5,
  },


  imageText: {
    fontSize: 14,
    fontWeight: '500',
  },


  content: {
    padding: 15,
  },


  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 7,
  },


  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },


  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },


  priceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },


  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },


  priceNight: {
    fontSize: 13,
    fontWeight: 'normal',
  },


  detailsButton: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },


  detailsButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },

});