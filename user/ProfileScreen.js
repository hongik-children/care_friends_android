import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Image, Modal, Share } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { BASE_URL } from '@env'; // @env 모듈로 불러옴
import CustomText from '../CustomTextProps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { logout as kakaoLogout } from '@react-native-seoul/kakao-login';
import Clipboard from '@react-native-clipboard/clipboard';
import { useFocusEffect } from '@react-navigation/native';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userType, setUserType] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        try {
          // JWT 토큰 가져오기
          const jwtToken = await AsyncStorage.getItem('jwtToken');
          const userTypeStored = await AsyncStorage.getItem('userType');
          setUserType(userTypeStored);

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

      fetchProfile(); // 포커스가 잡힐 때마다 호출
    }, []) // 빈 의존성 배열을 전달해 화면이 포커스를 받을 때마다 실행되도록 설정
  );

  const handleNavigateToUnregister = () => {
//    console.log("haha " + profile.uuid );
      navigation.navigate('UnregisterScreen', {profile : profile}); // UnregisterScreen으로 이동
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfileScreen', { profile });
  };

  const handleCopyUUID = () => {
    if (profile?.uuid) {
      Clipboard.setString(profile.uuid);
      Alert.alert('UUID 복사됨', '노약자의 UUID가 클립보드에 복사되었습니다.');
    }
  };

  const handleShareUUID = () => {
    if (profile?.uuid) {
      Share.share({
        message: `노약자의 UUID: ${profile.uuid}`,
      });
    }
  };

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

            {/* UUID 표시 및 복사, 공유 버튼 (노약자인 경우) */}
            {userType === 'friend' && (
              <View style={styles.infoRow}>
                <CustomText style={styles.label}>UUID</CustomText>

                {/* UUID를 앞뒤로 잘라서 보여주고 전체 복사는 유지 */}
                <View style={styles.uuidContainer}>
                  <CustomText style={styles.value}>
                    {`${profile.uuid.substring(0, 6)}...${profile.uuid.substring(profile.uuid.length - 6)}`}
                  </CustomText>

                  {/* 복사 버튼 */}
                  <TouchableOpacity onPress={handleCopyUUID}>
                    <Feather name="copy" size={24} color="#333" style={styles.icon} />
                  </TouchableOpacity>

                  {/* 공유 버튼 */}
                  <TouchableOpacity onPress={handleShareUUID}>
                    <Feather name="share" size={24} color="#333" style={styles.icon} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

          {/* 프로필 수정 버튼 */}
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <CustomText style={styles.editButtonText}>프로필 수정</CustomText>
          </TouchableOpacity>

          {/* 탈퇴 버튼 */}
          <TouchableOpacity style={styles.unregisterButton} onPress={handleNavigateToUnregister}>
            <CustomText style={styles.editButtonText}>회원 탈퇴</CustomText>
          </TouchableOpacity>
        </View>
      ) : (
        <CustomText style={styles.noProfileText}>프로필 정보가 없습니다.</CustomText>
      )}

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
    alignItems: 'center',
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
  uuidText: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Pretendard-Bold',
  },
  uuidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    flexWrap: 'wrap', // 여러 줄로 표시되게 하기
    marginHorizontal: 10,
  },
  icon: {
    marginLeft: 5,
  },
  editButton: {
    backgroundColor: '#6495ED',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  unregisterButton: {
      backgroundColor: '#FF6347',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 8,
      marginTop: 20,
    },
  editButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
  },
});

export default ProfileScreen;
