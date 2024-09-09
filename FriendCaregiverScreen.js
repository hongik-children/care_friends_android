import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '@env'; // @env 모듈로 불러옴

const FriendCaregiverScreen = ({ navigation }) => {
  const [caregiver, setCaregiver] = useState(null);

  // 프렌즈의 UUID를 하드코딩
  const friendId = '8ff12205-8fc4-433a-9357-8d0a891beaa1';

  useEffect(() => {
    const fetchCaregiver = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/friendRequest/getCaregiver/${friendId}`);
        setCaregiver(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert('오류', '보호자 정보를 불러오는 중 오류가 발생하였습니다.');
      }
    };

    fetchCaregiver();
  }, [friendId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>나의 보호자</Text>
      {caregiver ? (
        <View style={styles.caregiverBox}>
          <Text style={styles.caregiverText}>보호자 ID: {caregiver}</Text>
        </View>
      ) : (
        <Text style={styles.noCaregiverText}>보호자 정보가 없습니다.</Text>
      )}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>뒤로가기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  caregiverBox: {
    backgroundColor: '#e6f2ff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#6495ED',
    width: '100%',
    alignItems: 'center',
  },
  caregiverText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  noCaregiverText: {
    fontSize: 16,
    color: '#ff4d4d',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#6495ED',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FriendCaregiverScreen;
