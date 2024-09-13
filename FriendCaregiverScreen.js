import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '@env'; // @env 모듈로 불러옴
import CustomText from './CustomTextProps';

const FriendCaregiverScreen = ({ navigation }) => {
  const [caregiver, setCaregiver] = useState(null);

  // 프렌즈의 UUID를 하드코딩
  const friendId = '1893e4a9-3922-4127-b30f-5fa9723981c0';

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
      <CustomText style={styles.title}>나의 보호자</CustomText>
      {caregiver ? (
        <View style={styles.caregiverBox}>
          <View style={styles.infoRow}>
            <CustomText style={styles.label}>이름</CustomText>
            <CustomText style={styles.value}>{caregiver.name}</CustomText>
          </View>
          <View style={styles.infoRow}>
            <CustomText style={styles.label}>전화번호</CustomText>
            <CustomText style={styles.value}>{caregiver.phoneNumber}</CustomText>
          </View>
          <View style={styles.infoRow}>
            <CustomText style={styles.label}>생년월일</CustomText>
            <CustomText style={styles.value}>{caregiver.birthDate}</CustomText>
          </View>
          <View style={styles.infoRow}>
            <CustomText style={styles.label}>성별</CustomText>
            <CustomText style={styles.value}>{caregiver.gender === 'MALE' ? '남성' : '여성'}</CustomText>
          </View>
        </View>
      ) : (
        <CustomText style={styles.noCaregiverText}>보호자 정보가 없습니다.</CustomText>
      )}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <CustomText style={styles.backButtonText}>뒤로가기</CustomText>
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
    fontSize: 28,
    fontFamily: 'Pretendard-Bold',
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
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 22,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
  },
  value: {
    fontSize: 22,
    color: '#333',
  },
  noCaregiverText: {
    fontSize: 20,
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
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
  },
});

export default FriendCaregiverScreen;
