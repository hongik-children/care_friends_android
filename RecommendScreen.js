import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // react-native-vector-icons 사용
import { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, NAVER_CLOUD_ID, NAVER_CLOUD_SECRET, GOOGLE_MAP_PLATFORM_API_KEY } from '@env'; // 환경변수에 네이버 및 구글 API 키 저장
import CustomText from './CustomTextProps';

const RecommendScreen = ({ route, navigation }) => {
  const [places, setPlaces] = useState([]);
  const { latitude, longitude, selectedArea } = route.params;

  useEffect(() => {
    const geocodingUrl = `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${longitude},${latitude}&output=json&orders=roadaddr,addr`;

    // Reverse Geocoding을 사용하여 좌표의 주소를 가져오기
    fetch(geocodingUrl, {
      method: 'GET',
      headers: {
        'X-NCP-APIGW-API-KEY-ID': NAVER_CLOUD_ID,
        'X-NCP-APIGW-API-KEY': NAVER_CLOUD_SECRET,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.results.length > 0) {
          // 주소 정보 가져오기
          const regionInfo = data.results[0].region;
          // 시, 도 (area1), 시, 군, 구 (area2), 읍, 면, 동 (area3)
          const address = `${regionInfo.area1.name} ${regionInfo.area2.name} ${regionInfo.area3.name}`;

          // 지역 이름으로 검색하기
          const searchUrl = `https://openapi.naver.com/v1/search/local.json?query=${address} ${selectedArea}&display=10&start=1&sort=random`;

          return fetch(searchUrl, {
            method: 'GET',
            headers: {
              'X-Naver-Client-Id': NAVER_CLIENT_ID,
              'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
            },
          });
        } else {
          throw new Error('No results found from reverse geocoding');
        }
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.items) {
          const placesWithPhotos = data.items.map(async (place) => {
            const googlePlacesUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${place.title}&inputtype=textquery&fields=photos,place_id&locationbias=point:${latitude},${longitude}&key=${GOOGLE_MAP_PLATFORM_API_KEY}`;

            const photoResponse = await fetch(googlePlacesUrl);
            const photoData = await photoResponse.json();

            if (photoData.candidates.length > 0 && photoData.candidates[0].photos) {
              const photoReference = photoData.candidates[0].photos[0].photo_reference;
              place.photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_MAP_PLATFORM_API_KEY}`;
            } else {
              place.photoUrl = null; // 사진이 없는 경우
            }

            return place;
          });

          Promise.all(placesWithPhotos).then((results) => {
            setPlaces(results);
          });
        } else {
          console.error('No items found');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleCardPress = (place) => {
    // 네이버 지도 링크 생성
    const encodedPlaceName = encodeURIComponent(place.title.replace(/<[^>]+>/g, ''));
    const naverMapUrl = `https://map.naver.com/v5/search/${encodedPlaceName}`;

    Linking.openURL(naverMapUrl).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>주변 병원</Text>
      <FlatList
        data={places}
        keyExtractor={(item) => item.link}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleCardPress(item)}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.hospitalName}>{item.title.replace(/<[^>]+>/g, '')}</Text>
              </View>
              <Image
                source={
                  item.photoUrl
                    ? { uri: item.photoUrl }
                    : require('./assets/default_hospital.png') // 기본 이미지 설정
                }
                style={styles.hospitalImage}
              />
              <View style={styles.cardContent}>
                <Text style={styles.text}>주소: {item.roadAddress}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hospitalName: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    marginLeft: 8,
    color: '#333',
  },
  hospitalImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  cardContent: {
    marginTop: 8,
  },
  text: {
    fontSize: 14,
    color: '#666',
  },
});

export default RecommendScreen;
