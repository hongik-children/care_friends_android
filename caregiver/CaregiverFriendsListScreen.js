import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '@env'; // @env 모듈로 불러옴
import CustomText from '../CustomTextProps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DefaultProfileImage from '../assets/Default-Profile.png'; // 기본 프로필 이미지 경로
import { useFocusEffect } from '@react-navigation/native';

const CaregiverFriendsListScreen = ({ navigation }) => {
  const [friends, setFriends] = useState([]);

  const fetchFriends = async () => {
    try {
      // JWT 토큰 가져오기
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!jwtToken) {
        Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
        return;
      }

      const apiUrl = `${BASE_URL}/friendRequest/getFriends`; // API URL

      // 서버로 요청 보내기
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${jwtToken}` // JWT 토큰을 헤더에 추가
        }
      });

      setFriends(response.data);

    } catch (error) {
      console.error(error);
      Alert.alert('오류', '프렌즈 리스트를 불러오는 중 오류가 발생하였습니다.');
    }
  };

  // useFocusEffect 사용: 화면이 포커스를 받을 때마다 데이터를 다시 요청
  useFocusEffect(
    useCallback(() => {
      fetchFriends(); // 최신 친구 데이터를 요청
    }, [])
  );

  // 친구 삭제 시 리스트에서 제거하는 함수
  const handleDeleteFriend = (friendId) => {
    setFriends((prevFriends) => prevFriends.filter(friend => friend.friendId !== friendId));
  };

  // 프렌드 정보 렌더링
  const renderFriendItem = ({ item }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => navigation.navigate('FriendActionScreen', {
        friend: item,
        onDeleteFriend: handleDeleteFriend
      })}
    >
      {/* 1열: 프로필 이미지 */}
      <Image
        source={item.profileImg ? { uri: item.profileImg } : require('../assets/Default-Profile.png')} // 프로필 이미지 URL이 없으면 기본 이미지 사용
        style={styles.profileImage}
      />

      {/* 2열: 이름 (굵은 글씨) */}
      <View style={styles.nameContainer}>
        <CustomText style={styles.friendName}>{item.name}</CustomText>
      </View>

      {/* 3열: 전화번호, 생년월일, 성별 */}
      <View style={styles.infoContainer}>
        <CustomText style={styles.friendPhone}>{item.phoneNumber}</CustomText>
        <CustomText style={styles.friendBirthday}>{item.birthDate}</CustomText>
        <CustomText style={styles.friendGender}>{item.gender === 'MALE' ? '남성' : '여성'}</CustomText>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 친구가 없는 경우 메시지 표시 */}
      {friends.length === 0 ? (
        <View style={styles.noFriendsContainer}>
          <CustomText style={styles.noFriendsText}>등록된 친구가 없습니다.</CustomText>
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.friendId.toString()}
          renderItem={renderFriendItem}
        />
      )}
      {/* 친구 추가 버튼 */}
      <TouchableOpacity style={styles.Button} onPress={() => navigation.navigate('AddFriendScreen')}>
        <CustomText style={styles.ButtonText}>친구 추가하기</CustomText>
      </TouchableOpacity>
    </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  noFriendsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noFriendsText: {
    fontSize: 18,
    color: '#a0a0a0', // 연한 회색
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    marginBottom: 20,
  },
  friendItem: {
    flexDirection: 'row', // 가로로 배치
    alignItems: 'center', // 세로 축 가운데 정렬
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  friendDetails: {
    flexDirection: 'row', // 프로필 이미지와 텍스트를 가로로 배치
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 60, // 이미지 크기 조정
    height: 60,
    borderRadius: 25, // 원형 이미지
    marginRight: 15, // 텍스트와의 간격
  },
  nameContainer: {
    flex: 1, // 이름을 가운데 정렬하기 위한 공간 차지
    justifyContent: 'center',
    alignItems: 'center', // 세로축 가운데 정렬
  },
  infoContainer: {
    flex: 2, // 전화번호, 생년월일, 성별을 오른쪽에 정렬
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  friendName: {
    fontSize: 25,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
  },
  friendPhone: {
    fontSize: 18,
    color: '#555',
    marginBottom: 5, // 아래 간격 추가
  },
  friendBirthday: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5, // 아래 간격 추가
  },
  friendGender: {
    fontSize: 18,
    color: '#555',
  },
  Button: {
    marginTop: 20,
    backgroundColor: '#6495ED',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  ButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
  },
});


export default CaregiverFriendsListScreen;