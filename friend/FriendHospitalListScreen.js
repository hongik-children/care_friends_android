import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert, Linking } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';

const FriendHospitalListScreen = ({ navigation }) => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [treatments, setTreatments] = useState([]);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      const response = await axios.get(`${BASE_URL}/treatment/hospital`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      setHospitals(response.data);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      Alert.alert("오류", "병원 목록을 불러오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTreatmentsByHospital = async (hospitalLink) => {
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      const decodedHospitalLink = decodeURIComponent(hospitalLink);
      const response = await axios.get(`${BASE_URL}/treatment/treatment`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
        params: { hospitalLink },
      });
      setTreatments(response.data);
      setSelectedHospital(hospitalLink);
    } catch (error) {
      console.error('Error fetching treatments:', error);
      Alert.alert("오류", "진료 일정을 불러오는 중 문제가 발생했습니다.");
    }
  };

  const formatDateTime = (dateString, timeString) => {
    const date = new Date(`${dateString}T${timeString}`);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분`;
  };

  const formatDate = (dateString, timeString) => {
    const date = new Date(`${dateString}T${timeString}`);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  const formatTime = (dateString, timeString) => {
    const date = new Date(`${dateString}T${timeString}`);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}시 ${minutes}분`;
  };

  const renderTreatment = ({ item }) => (
    <View style={styles.treatmentItem}>
      <Text style={styles.treatmentTitle}>{item.title}</Text>
      <Text style={styles.treatmentDetail}>{formatDate(item.date, item.time)}</Text>
      <Text style={styles.treatmentDetail}>{formatTime(item.date, item.time)}</Text>
      <Text style={styles.treatmentDetail}>메모: {item.memo}</Text>
    </View>
  );

  const renderHospital = ({ item }) => {
    const cleanHospitalName = item.title.replace(/<[^>]+>/g, '');
    const searchQuery = `${cleanHospitalName} ${item.address}`;
    const naverMapLink = `https://map.naver.com/v5/search/${encodeURIComponent(searchQuery)}`;

    return (
      <View style={styles.hospitalItem}>
        <Text style={styles.hospitalTitle}>{cleanHospitalName}</Text>
        <Text style={styles.hospitalDetail}>주소: {item.address}</Text>

        <TouchableOpacity onPress={() => fetchTreatmentsByHospital(item.link)} style={styles.viewDetailsButton}>
          <Text style={styles.viewDetailsButtonText}>진료 일정 보기</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL(naverMapLink)} style={styles.mapButton}>
          <Text style={styles.mapButtonText}>네이버 지도에서 보기</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>방문 병원 목록</Text>
      {selectedHospital ? (
        <>
          <TouchableOpacity onPress={() => setSelectedHospital(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← 병원 목록으로 돌아가기</Text>
          </TouchableOpacity>
          <FlatList
            data={treatments}
            keyExtractor={(item, index) => `${item.link}-${index}`}
            renderItem={renderTreatment}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={styles.noDataText}>진료 일정이 없습니다.</Text>}
          />
        </>
      ) : (
        <FlatList
          data={hospitals}
          keyExtractor={(item) => item.link}
          renderItem={renderHospital}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.noDataText}>방문한 병원이 없습니다.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  listContainer: {
    paddingBottom: 16,
  },
  hospitalItem: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  hospitalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  hospitalDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  treatmentItem: {
    backgroundColor: '#EFF5FB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  treatmentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  treatmentDetail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#33415c',
    marginTop: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: '#6495ED',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewDetailsButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  viewDetailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mapButton: {
    backgroundColor: '#6495ED',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default FriendHospitalListScreen;




//import React, { useEffect, useState } from 'react';
//import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert, Linking } from 'react-native';
//import axios from 'axios';
//import AsyncStorage from '@react-native-async-storage/async-storage';
//import { BASE_URL } from '@env';
//
//const FriendHospitalListScreen = ({ navigation }) => {
//  const [hospitals, setHospitals] = useState([]); // 병원 목록
//  const [loading, setLoading] = useState(true); // 로딩 상태
//  const [selectedHospital, setSelectedHospital] = useState(null); // 선택된 병원
//  const [treatments, setTreatments] = useState([]); // 선택된 병원의 진료 일정
//
//  useEffect(() => {
//    fetchHospitals();
//  }, []);
//
//  // 병원 목록을 가져오는 함수
//  const fetchHospitals = async () => {
//    try {
//      const jwtToken = await AsyncStorage.getItem('jwtToken');
//      const response = await axios.get(`${BASE_URL}/treatment/hospital`, {
//        headers: { Authorization: `Bearer ${jwtToken}` },
//      });
//      setHospitals(response.data);
//    } catch (error) {
//      console.error('Error fetching hospitals:', error);
//      Alert.alert("오류", "병원 목록을 불러오는 중 문제가 발생했습니다.");
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  // 병원별 진료 일정 목록을 가져오는 함수
//  const fetchTreatmentsByHospital = async (hospitalLink) => {
//    try {
//      const jwtToken = await AsyncStorage.getItem('jwtToken');
//      console.log('Original Hospital Link:', hospitalLink);
//      // hospitalLink를 디코딩
//      const decodedHospitalLink = decodeURIComponent(hospitalLink);
//
//      // 디코딩된 hospitalLink 로그
//      console.log('Decoded Hospital Link:', decodedHospitalLink);
//      const response = await axios.get(`${BASE_URL}/treatment/treatment`, {
//        headers: { Authorization: `Bearer ${jwtToken}` },
//        params: { hospitalLink },
//      });
//      setTreatments(response.data);
//      setSelectedHospital(hospitalLink); // 선택된 병원을 업데이트
//    } catch (error) {
//      console.error('Error fetching treatments:', error);
//      Alert.alert("오류", "진료 일정을 불러오는 중 문제가 발생했습니다.");
//    }
//  };
//
//  // 진료 일정을 렌더링하는 함수
//  const renderTreatment = ({ item }) => (
//    <View style={styles.treatmentItem}>
//      <Text style={styles.treatmentTitle}>{item.title}</Text>
//      <Text style={styles.treatmentDetail}>날짜: {item.date}</Text>
//      <Text style={styles.treatmentDetail}>시간: {item.time}</Text>
//      <Text style={styles.treatmentDetail}>메모: {item.memo}</Text>
//    </View>
//  );
//
//  // 병원 항목을 렌더링하는 함수
//  const renderHospital = ({ item }) => {
//    const cleanHospitalName = item.title.replace(/<[^>]+>/g, ''); // 병원 이름에서 HTML 태그 제거
//    const searchQuery = `${cleanHospitalName} ${item.address}`; // 병원 이름과 주소 결합
//    const naverMapLink = `https://map.naver.com/v5/search/${encodeURIComponent(searchQuery)}`;
//
//    return (
//      <View style={styles.hospitalItem}>
//        <Text style={styles.hospitalTitle}>{cleanHospitalName}</Text>
//        <Text style={styles.hospitalDetail}>주소: {item.address}</Text>
//
//        <TouchableOpacity onPress={() => fetchTreatmentsByHospital(item.link)} style={styles.viewDetailsButton}>
//          <Text style={styles.viewDetailsButtonText}>진료 일정 보기</Text>
//        </TouchableOpacity>
//
//        <TouchableOpacity onPress={() => Linking.openURL(naverMapLink)} style={styles.mapButton}>
//          <Text style={styles.mapButtonText}>네이버 지도에서 보기</Text>
//        </TouchableOpacity>
//      </View>
//    );
//  };
//
//  if (loading) {
//    return (
//      <View style={styles.loadingContainer}>
//        <ActivityIndicator size="large" color="#0000ff" />
//      </View>
//    );
//  }
//
//  return (
//    <View style={styles.container}>
//      <Text style={styles.title}>방문 병원 목록</Text>
//      {selectedHospital ? (
//        <>
//          <TouchableOpacity onPress={() => setSelectedHospital(null)} style={styles.backButton}>
//            <Text style={styles.backButtonText}>← 병원 목록으로 돌아가기</Text>
//          </TouchableOpacity>
//          <FlatList
//            data={treatments}
//            keyExtractor={(item, index) => `${item.link}-${index}`}
//            renderItem={renderTreatment}
//            contentContainerStyle={styles.listContainer}
//            ListEmptyComponent={<Text style={styles.noDataText}>진료 일정이 없습니다.</Text>}
//          />
//        </>
//      ) : (
//        <FlatList
//          data={hospitals}
//          keyExtractor={(item) => item.link}
//          renderItem={renderHospital}
//          contentContainerStyle={styles.listContainer}
//          ListEmptyComponent={<Text style={styles.noDataText}>방문한 병원이 없습니다.</Text>}
//        />
//      )}
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    padding: 16,
//    backgroundColor: '#ffffff',
//  },
//  title: {
//    fontSize: 24,
//    fontWeight: 'bold',
//    marginBottom: 16,
//    textAlign: 'center',
//    color: '#333',
//  },
//  listContainer: {
//    paddingBottom: 16,
//  },
//  hospitalItem: {
//    backgroundColor: '#f5f5f5',
//    padding: 16,
//    borderRadius: 8,
//    marginBottom: 12,
//  },
//  hospitalTitle: {
//    fontSize: 18,
//    fontWeight: 'bold',
//    color: '#333',
//  },
//  hospitalDetail: {
//    fontSize: 14,
//    color: '#666',
//    marginTop: 4,
//  },
//  treatmentItem: {
//    backgroundColor: '#e8f4fa',
//    padding: 16,
//    borderRadius: 8,
//    marginBottom: 12,
//  },
//  treatmentTitle: {
//    fontSize: 18,
//    fontWeight: 'bold',
//    color: '#333',
//  },
//  treatmentDetail: {
//    fontSize: 14,
//    color: '#666',
//    marginTop: 4,
//  },
//  loadingContainer: {
//    flex: 1,
//    justifyContent: 'center',
//    alignItems: 'center',
//  },
//  noDataText: {
//    textAlign: 'center',
//    fontSize: 16,
//    color: '#666',
//    marginTop: 20,
//  },
//  backButton: {
//    marginBottom: 12,
//  },
//  backButtonText: {
//    color: '#6495ED',
//    fontSize: 16,
//    fontWeight: 'bold',
//  },
//  viewDetailsButton: {
//    backgroundColor: '#4CAF50',
//    paddingVertical: 8,
//    paddingHorizontal: 16,
//    borderRadius: 8,
//    marginTop: 10,
//    alignItems: 'center',
//  },
//  viewDetailsButtonText: {
//    color: '#fff',
//    fontSize: 14,
//    fontWeight: 'bold',
//  },
//  mapButton: {
//    backgroundColor: '#6495ED',
//    paddingVertical: 8,
//    paddingHorizontal: 16,
//    borderRadius: 8,
//    marginTop: 10,
//    alignItems: 'center',
//  },
//  mapButtonText: {
//    color: '#fff',
//    fontSize: 14,
//    fontWeight: 'bold',
//  },
//});
//
//export default FriendHospitalListScreen;
