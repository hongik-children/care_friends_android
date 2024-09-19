import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { GOOGLE_MAP_PLATFORM_API_KEY } from '@env';

const RecommendScreen = ({ route }) => {
  const [places, setPlaces] = useState([]);
  const { latitude, longitude } = route.params; // 위치를 설정 (예: 뉴욕의 위도와 경도)

  useEffect(() => {
    const radius = 1000; // 검색 반경 (미터)
    const apiKey = GOOGLE_MAP_PLATFORM_API_KEY; // 실제 API 키를 입력하세요.

    const includedTypes = ['cafe'];
    const excludedTypes = [];

    // Google Places API Nearby Search 엔드포인트 호출
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${includedTypes.join(
      '|'
    )}&key=${apiKey}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const filteredPlaces = data.results.filter(
          (place) =>
            !excludedTypes.some((excludedType) =>
              place.types.includes(excludedType)
            )
        );
        setPlaces(filteredPlaces);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Places</Text>
      <FlatList
        data={places}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.text}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    color: '#100',
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    color: 'black'
  },
  text: {
    color: 'black',
  },
});

export default RecommendScreen;
