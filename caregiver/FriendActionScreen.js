import React, { useLayoutEffect } from 'react'; // useLayoutEffect 추가
import { View, TouchableOpacity, StyleSheet, Alert, Linking, Image } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import CustomText from '../CustomTextProps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import DefaultProfileImage from '../assets/Default-Profile.png';

const FriendActionScreen = ({ route, navigation }) => {
  const { friend } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
      ),
      headerTitle: '',  // 헤더 타이틀을 빈 문자열로 설정
      headerShown: true,  // 헤더가 보이도록 설정
    });
  }, [navigation]);

  const handleCall = () => {
    const phoneNumber = `tel:${friend.phoneNumber}`;
    Linking.openURL(phoneNumber)
      .catch(err => console.error('Error calling phone number', err));
  };

  const handleSendMessage = () => {
    const sms = `sms:${friend.phoneNumber}`;
    Linking.openURL(sms)
      .catch(err => console.error('Error sending SMS', err));
  };

  const handleAddSchedule = () => {
    navigation.navigate('AddScheduleScreen', { friend });
  };

  const handleCheckLocation = () => {
    Alert.alert('위치 확인하기', `${friend.name}님의 위치를 확인합니다.`);
  };

  const handleDeleteFriend = async () => {
    Alert.alert(
      '친구 삭제',
      `${friend.name}님을 정말 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const jwtToken = await AsyncStorage.getItem('jwtToken');
              if (!jwtToken) {
                Alert.alert('오류', '로그인 정보가 없습니다.');
                return;
              }

              await axios.delete(`${BASE_URL}/friendRequest/${friend.friendId}`, {
                headers: {
                  Authorization: `Bearer ${jwtToken}`,
                },
              });

              Alert.alert('삭제 완료', `${friend.name}님을 삭제했습니다.`);
              // 삭제 후 이전 화면으로 돌아가기
              navigation.goBack();
            } catch (error) {
              console.error('친구 삭제 오류:', error);
              Alert.alert('오류', '친구를 삭제하는 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Image
        source={friend.profileImg ? { uri: friend.profileImg } : DefaultProfileImage} // 프로필 이미지가 없으면 기본 이미지 사용
        style={styles.profileImage}
      />

      <CustomText style={styles.title}>{friend.name}님에게</CustomText>

      <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
        <Feather name="phone" size={24} color="#fff" />
        <CustomText style={styles.actionButtonText}>전화 걸기</CustomText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleSendMessage}>
        <Feather name="message-circle" size={24} color="#fff" />
        <CustomText style={styles.actionButtonText}>문자 보내기</CustomText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleAddSchedule}>
        <Feather name="calendar" size={24} color="#fff" />
        <CustomText style={styles.actionButtonText}>일정 추가하기</CustomText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('LocationScreen', { friendId: friend.friendId })}>
        <Feather name="map-pin" size={24} color="#fff" />
        <CustomText style={styles.actionButtonText}>위치 확인하기</CustomText>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FF6347' }]} onPress={handleDeleteFriend}>
        <Feather name="trash-2" size={24} color="#fff" />
        <CustomText style={styles.actionButtonText}>친구 삭제하기</CustomText>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  profileImage: {
    width: 120,  // 이미지 크기
    height: 120,
    borderRadius: 60,  // 원형 이미지
    alignSelf: 'center',  // 가운데 정렬
    marginBottom: 20,  // 이미지와 텍스트 사이 간격
  },
  title: {
    fontSize: 28,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6495ED',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
  backButton: {
    paddingLeft: 10,
  },
});

export default FriendActionScreen;
