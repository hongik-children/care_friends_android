import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Alert, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomText from '../CustomTextProps'; // 추가

const LocationScreen = ({ route }) => {
  const { friendId } = route.params;
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  // 노약자 위치 정보 가져오기
  const fetchLocations = async () => {
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!friendId) {
        throw new Error('friendId가 정의되지 않았습니다.');
      }
      const response = await axios.get(`${BASE_URL}/location/get`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
        params: { friendId: friendId },
      });
      setLocations(response.data);
    } catch (error) {
      console.error('위치 데이터 가져오기 실패:', error);
      Alert.alert('오류', '위치 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };

  // 리스트 항목 클릭 시 위치를 선택해 지도에 표시
  const handleLocationPress = (location) => {
    setSelectedLocation(location);
  };

  // 위치 정보 렌더링
  const renderLocationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleLocationPress(item)}
    >
      <View style={styles.locationDetails}>
        <CustomText style={styles.locationTimestamp}>{new Date(item.timestamp).toLocaleString()}</CustomText>
      </View>
      <View style={styles.locationInfo}>
        <CustomText style={styles.locationText}>위도: {item.latitude.toFixed(6)}</CustomText>
        <CustomText style={styles.locationText}>경도: {item.longitude.toFixed(6)}</CustomText>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 위치 목록이 없는 경우 메시지 표시 */}
      {locations.length === 0 ? (
        <View style={styles.noLocationsContainer}>
          <CustomText style={styles.noLocationsText}>위치 정보가 없습니다.</CustomText>
        </View>
      ) : (
        <FlatList
          data={locations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderLocationItem}
        />
      )}

      {/* 지도 표시 */}
      {selectedLocation && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title="노약자 위치"
          />
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  noLocationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLocationsText: {
    fontSize: 18,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationDetails: {
    flex: 1,
  },
  locationInfo: {
    alignItems: 'flex-end',
  },
  locationTimestamp: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  locationText: {
    fontSize: 14,
    color: '#555',
  },
  map: {
    width: '100%',
    height: 300,
    marginTop: 20,
  },
});

export default LocationScreen;