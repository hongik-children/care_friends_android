import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Image, Modal } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '@env'; // @env 모듈로 불러옴
import CustomText from '../CustomTextProps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { logout as kakaoLogout } from '@react-native-seoul/kakao-login';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // JWT 토큰 가져오기
        const jwtToken = await AsyncStorage.getItem('jwtToken');
        if (!jwtToken) {
          Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
          return;
        }
        const response = await axios.get(`${BASE_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          }
        });
        setProfile(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert('오류', '프로필 정보를 불러오는 중 오류가 발생하였습니다.');
      }
    };

    fetchProfile();
  }, []);

  const handleImagePick = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.error('ImagePicker Error: ', response.errorMessage);
        Alert.alert('오류', '이미지 선택 중 오류가 발생하였습니다.');
      } else if (response.assets && response.assets.length > 0) {
        const imageUri = response.assets[0].uri;
        uploadProfileImage(imageUri);
      }
    });
  };

  const uploadProfileImage = async (imageUri) => {
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!jwtToken) {
        Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
        return;
      }

      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      });

      const response = await axios.post(`${BASE_URL}/profile/img`, formData, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfile(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '프로필 이미지 업로드 중 오류가 발생하였습니다.');
    }
  };

  const handleDeleteImage = async () => {
    try {
      // Delete image by setting it to "null" or default URL
      await uploadProfileImage(null);
      Alert.alert('알림', '프로필 이미지가 삭제되었습니다.');
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '프로필 이미지 삭제 중 오류가 발생하였습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      // Kakao 로그아웃
      await kakaoLogout();
      // JWT 삭제
      await AsyncStorage.removeItem('jwtToken');
      await AsyncStorage.removeItem('userType');
      Alert.alert("로그아웃 성공", "로그아웃되었습니다.");
      // 로그인 화면으로 이동
      navigation.navigate('KakaoLoginScreen');
    } catch (err) {
      console.error('Logout error', err);
      Alert.alert('오류', '로그아웃 중 오류가 발생하였습니다.');
    }
  };

  return (
    <View style={styles.container}>
      {profile && (
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image
            source={
              profile.profileImg && profile.profileImg !== 'null'
                ? { uri: profile.profileImg }
                : require('../assets/Default-Profile.png') // 기본 프로필 이미지
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
      )}
      <CustomText style={styles.title}>내 정보</CustomText>
      {profile ? (
        <View style={styles.profileBox}>
          <View style={styles.infoRow}>
            <CustomText style={styles.label}>이름</CustomText>
            <CustomText style={styles.value}>{profile.name}</CustomText>
          </View>
          <View style={styles.infoRow}>
            <CustomText style={styles.label}>전화번호</CustomText>
            <CustomText style={styles.value}>{profile.phoneNumber}</CustomText>
          </View>
          <View style={styles.infoRow}>
            <CustomText style={styles.label}>생년월일</CustomText>
            <CustomText style={styles.value}>{profile.birthDate}</CustomText>
          </View>
          <View style={styles.infoRow}>
            <CustomText style={styles.label}>성별</CustomText>
            <CustomText style={styles.value}>{profile.gender === 'MALE' ? '남성' : '여성'}</CustomText>
          </View>
        </View>
      ) : (
        <CustomText style={styles.noProfileText}>프로필 정보가 없습니다.</CustomText>
      )}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <CustomText style={styles.backButtonText}>뒤로가기</CustomText>
      </TouchableOpacity>

      {/* 로그아웃 버튼 추가 */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <CustomText style={styles.logoutButtonText}>로그아웃</CustomText>
      </TouchableOpacity>

      {/* 이미지 수정/삭제 모달 */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.modalButton} onPress={handleImagePick}>
              <CustomText style={styles.modalButtonText}>수정</CustomText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleDeleteImage}>
              <CustomText style={styles.modalButtonText}>삭제</CustomText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <CustomText style={styles.modalButtonText}>취소</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    marginBottom: 30,
  },
  profileBox: {
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
  noProfileText: {
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
  logoutButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: 250,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalButton: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#6495ED',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
  },
});

export default ProfileScreen;
