import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // react-native-vector-icons 사용
import { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, NAVER_CLOUD_ID, NAVER_CLOUD_SECRET } from '@env'; // 환경변수에 네이버 API 키 저장

const RecommendScreen = ({ route, navigation }) => {
  const [places, setPlaces] = useState([]);
  const { latitude, longitude } = route.params;

  useEffect(() => {
    const geocodingUrl = `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${longitude},${latitude}&output=json&orders=roadaddr,addr`;
    console.log(geocodingUrl);

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
        console.log(data); // 응답 데이터 출력
        if (data.results.length > 0) {
          // 주소 정보 가져오기
          const regionInfo = data.results[0].region;
          // 시, 도 (area1), 시, 군, 구 (area2), 읍, 면, 동 (area3)
          const address = `${regionInfo.area1.name} ${regionInfo.area2.name} ${regionInfo.area3.name}`;
          console.log('검색 주소:', address);

          // 지역 이름으로 검색하기
          const searchUrl = `https://openapi.naver.com/v1/search/local.json?query=${address} 병원&display=10&start=1&sort=random`;
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
          setPlaces(data.items);
        } else {
          console.error('No items found');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  console.log(places);

  const handleCardPress = (place) => {
    const url = place.link; // 네이버 제공 장소 링크
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
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
                <MaterialIcons name="local-hospital" size={24} color="red" />
                <Text style={styles.hospitalName}>{item.title.replace(/<[^>]+>/g, '')}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.text}>주소: {item.roadAddress}</Text>
                <Text style={styles.text}>전화번호: {item.telephone ? item.telephone : 'N/A'}</Text>
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
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

//import React, { useEffect, useState } from 'react';
//import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking } from 'react-native';
//import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // react-native-vector-icons 사용
//import { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET,NAVER_CLOUD_ID, NAVER_CLOUD_SECRET } from '@env'; // 환경변수에 네이버 API 키 저장
//
//const RecommendScreen = ({ route, navigation }) => {
//  const [places, setPlaces] = useState([]);
//  const { latitude, longitude } = route.params;
//
//  useEffect(() => {
//
//    const testLatitude = 37.5665; // 서울특별시 위도
//    const testLongitude = 126.9780; // 서울특별시 경도
//    const geocodingUrl = `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${testLongitude},${testLatitude}&output=json&orders=roadaddr`;
//
//
////    const geocodingUrl = `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${longitude},${latitude}&output=json&orders=roadaddr,addr`;
//    console.log(geocodingUrl);
//    // Reverse Geocoding을 사용하여 좌표의 주소를 가져오기
//    fetch(geocodingUrl, {
//      method: 'GET',
//      headers: {
//        'X-NCP-APIGW-API-KEY-ID': NAVER_CLOUD_ID,
//        'X-NCP-APIGW-API-KEY': NAVER_CLOUD_SECRET,
//      },
//    })
//      .then((response) => response.json())
//      .then((data) => {
//        if (data.results.length > 0) {
//          const address = data.results[0].region.area1.name; // 예시: 지역 이름 가져오기
//
//          console.log(address);
//          // 지역 이름으로 검색하기
//          const searchUrl = `https://openapi.naver.com/v1/search/local.json?query=${address} 병원&display=5&start=1&sort=random`;
//          return fetch(searchUrl, {
//            method: 'GET',
//            headers: {
//              'X-Naver-Client-Id': NAVER_CLIENT_ID,
//              'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
//            },
//          });
//        } else {
//          throw new Error('No results found from reverse geocoding');
//        }
//      })
//      .then((response) => response.json())
//      .then((data) => {
//        if (data.items) {
//          setPlaces(data.items);
//        } else {
//          console.error('No items found');
//        }
//      })
//      .catch((error) => {
//        console.error(error);
//      });
//
//  }, []);
//
//  console.log(places);
//
//  const handleCardPress = (place) => {
//    const url = place.link; // 네이버 제공 장소 링크
//    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
//  };
//
//  return (
//    <View style={styles.container}>
//      <Text style={styles.title}>주변 병원</Text>
//      <FlatList
//        data={places}
//        keyExtractor={(item) => item.link}
//        renderItem={({ item }) => (
//          <TouchableOpacity onPress={() => handleCardPress(item)}>
//            <View style={styles.card}>
//              <View style={styles.cardHeader}>
//                <MaterialIcons name="local-hospital" size={24} color="red" />
//                <Text style={styles.hospitalName}>{item.title.replace(/<[^>]+>/g, '')}</Text>
//              </View>
//              <View style={styles.cardContent}>
//                <Text style={styles.text}>주소: {item.roadAddress}</Text>
//                <Text style={styles.text}>전화번호: {item.telephone ? item.telephone : 'N/A'}</Text>
//              </View>
//            </View>
//          </TouchableOpacity>
//        )}
//      />
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    padding: 16,
//    backgroundColor: '#f9f9f9',
//  },
//  title: {
//    fontSize: 24,
//    marginBottom: 16,
//    fontWeight: 'bold',
//    color: '#333',
//  },
//  card: {
//    backgroundColor: '#fff',
//    borderRadius: 8,
//    padding: 16,
//    marginBottom: 16,
//    shadowColor: '#000',
//    shadowOpacity: 0.1,
//    shadowOffset: { width: 0, height: 2 },
//    shadowRadius: 4,
//    elevation: 2,
//  },
//  cardHeader: {
//    flexDirection: 'row',
//    alignItems: 'center',
//    marginBottom: 8,
//  },
//  hospitalName: {
//    fontSize: 18,
//    fontWeight: 'bold',
//    marginLeft: 8,
//    color: '#333',
//  },
//  cardContent: {
//    marginTop: 8,
//  },
//  text: {
//    fontSize: 14,
//    color: '#666',
//  },
//});
//
//export default RecommendScreen;


//import React, { useEffect, useState } from 'react';
//import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking } from 'react-native';
//import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // react-native-vector-icons 사용
//import { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET } from '@env'; // 환경변수에 네이버 API 키 저장
//
//const RecommendScreen = ({ route, navigation }) => {
//  const [places, setPlaces] = useState([]);
//  const { latitude, longitude } = route.params;
//
//  useEffect(() => {
//    const radius = 1000; // 검색 반경 (미터)
//    const clientId = NAVER_CLIENT_ID;
//    const clientSecret = NAVER_CLIENT_SECRET;
//    const keyword = '병원';
//
//    console.log(clientId);
//
//    // 네이버 Place API 호출
//    const url = `https://openapi.naver.com/v1/search/local.json?query=${keyword}&display=5&start=1&sort=random&x=${longitude}&y=${latitude}&radius=${radius}`;
//    console.log(url);
//
//    fetch(url, {
//      method: 'GET',
//      headers: {
//        'X-Naver-Client-Id': clientId,
//        'X-Naver-Client-Secret': clientSecret,
//      },
//    })
//      .then((response) => response.json())
//      .then((data) => {
//        if (data.items) {
//          setPlaces(data.items);
//        } else {
//          console.error('No items found');
//        }
//      })
//      .catch((error) => {
//        console.error(error);
//      });
//  }, []);
//
//  console.log(places);
//
//  const handleCardPress = (place) => {
//    const url = place.link; // 네이버 제공 장소 링크
//    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
//  };
//
//  return (
//    <View style={styles.container}>
//      <Text style={styles.title}>주변 병원</Text>
//      <FlatList
//        data={places}
//        keyExtractor={(item) => item.link}
//        renderItem={({ item }) => (
//          <TouchableOpacity onPress={() => handleCardPress(item)}>
//            <View style={styles.card}>
//              <View style={styles.cardHeader}>
//                <MaterialIcons name="local-hospital" size={24} color="red" />
//                <Text style={styles.hospitalName}>{item.title.replace(/<[^>]+>/g, '')}</Text>
//              </View>
//              <View style={styles.cardContent}>
//                <Text style={styles.text}>주소: {item.roadAddress}</Text>
//                <Text style={styles.text}>전화번호: {item.telephone ? item.telephone : 'N/A'}</Text>
//              </View>
//            </View>
//          </TouchableOpacity>
//        )}
//      />
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    padding: 16,
//    backgroundColor: '#f9f9f9',
//  },
//  title: {
//    fontSize: 24,
//    marginBottom: 16,
//    fontWeight: 'bold',
//    color: '#333',
//  },
//  card: {
//    backgroundColor: '#fff',
//    borderRadius: 8,
//    padding: 16,
//    marginBottom: 16,
//    shadowColor: '#000',
//    shadowOpacity: 0.1,
//    shadowOffset: { width: 0, height: 2 },
//    shadowRadius: 4,
//    elevation: 2,
//  },
//  cardHeader: {
//    flexDirection: 'row',
//    alignItems: 'center',
//    marginBottom: 8,
//  },
//  hospitalName: {
//    fontSize: 18,
//    fontWeight: 'bold',
//    marginLeft: 8,
//    color: '#333',
//  },
//  cardContent: {
//    marginTop: 8,
//  },
//  text: {
//    fontSize: 14,
//    color: '#666',
//  },
//});
//
//export default RecommendScreen;









//import React, { useEffect, useState } from 'react';
//import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking } from 'react-native';
//import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // react-native-vector-icons 사용
//import { GOOGLE_MAP_PLATFORM_API_KEY } from '@env';
//
//const RecommendScreen = ({ route, navigation }) => {
//  const [places, setPlaces] = useState([]);
//  const { latitude, longitude } = route.params;
//
//  useEffect(() => {
//    const radius = 1000; // 검색 반경 (미터)
//    const apiKey = GOOGLE_MAP_PLATFORM_API_KEY;
//
//    const includedTypes = ['hospital'];
//    const excludedTypes = [];
//
//    // Google Places API Nearby Search 엔드포인트 호출
//    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${includedTypes.join(
//      '|'
//    )}&key=${apiKey}`;
//
//    fetch(url)
//      .then((response) => response.json())
//      .then((data) => {
//        const filteredPlaces = data.results.filter(
//          (place) =>
//            !excludedTypes.some((excludedType) =>
//              place.types.includes(excludedType)
//            )
//        );
//        setPlaces(filteredPlaces);
//      })
//      .catch((error) => {
//        console.error(error);
//      });
//  }, []);
//
////  const handleCardPress = (place) => {
////    // 방법 1: 외부 링크로 이동 (예: 구글 맵)
////    const url = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
////    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
////
////    // 방법 2: 내부 화면으로 이동 (자세한 정보 보기)
////    // navigation.navigate('HospitalDetail', { place });
////  };
//
//    const handleCardPress = (place) => {
//      // 방법 1: 네이버 지도 웹/앱으로 이동
//      const { lat, lng } = place.geometry.location; // latitude와 longitude를 가져옵니다.
//      const url = `nmap://place?lat=${lat}&lng=${lng}&name=${encodeURIComponent(
//        place.name
//      )}&appname=com.yourapp.package`; // 네이버 지도 앱 URL 스키마
//
//      // 앱으로 이동이 실패할 경우 웹 브라우저로 이동합니다.
//      Linking.openURL(url).catch((err) => {
//        const webUrl = `https://map.naver.com/v5/search/${encodeURIComponent(
//          place.name
//        )}/place/${lat},${lng}`;
//        Linking.openURL(webUrl).catch((error) =>
//          console.error("Couldn't load page", error)
//        );
//      });
//
//      // 방법 2: 내부 화면으로 이동 (자세한 정보 보기)
//      // navigation.navigate('HospitalDetail', { place });
//    };
//
//
//  return (
//    <View style={styles.container}>
//      <Text style={styles.title}>주변 병원</Text>
//      <FlatList
//        data={places}
//        keyExtractor={(item) => item.place_id}
//        renderItem={({ item }) => (
//          <TouchableOpacity onPress={() => handleCardPress(item)}>
//            <View style={styles.card}>
//              <View style={styles.cardHeader}>
//                <MaterialIcons name="local-hospital" size={24} color="red" />
//                <Text style={styles.hospitalName}>{item.name}</Text>
//              </View>
//              <View style={styles.cardContent}>
//                <Text style={styles.text}>평점: {item.rating ? item.rating : 'N/A'}</Text>
//                <Text style={styles.text}>주소: {item.vicinity}</Text>
//              </View>
//            </View>
//          </TouchableOpacity>
//        )}
//      />
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    padding: 16,
//    backgroundColor: '#f9f9f9',
//  },
//  title: {
//    fontSize: 24,
//    marginBottom: 16,
//    fontWeight: 'bold',
//    color: '#333',
//  },
//  card: {
//    backgroundColor: '#fff',
//    borderRadius: 8,
//    padding: 16,
//    marginBottom: 16,
//    shadowColor: '#000',
//    shadowOpacity: 0.1,
//    shadowOffset: { width: 0, height: 2 },
//    shadowRadius: 4,
//    elevation: 2,
//  },
//  cardHeader: {
//    flexDirection: 'row',
//    alignItems: 'center',
//    marginBottom: 8,
//  },
//  hospitalName: {
//    fontSize: 18,
//    fontWeight: 'bold',
//    marginLeft: 8,
//    color: '#333',
//  },
//  cardContent: {
//    marginTop: 8,
//  },
//  text: {
//    fontSize: 14,
//    color: '#666',
//  },
//});
//
//export default RecommendScreen;
