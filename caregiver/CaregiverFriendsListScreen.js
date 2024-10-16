import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '@env'; // @env 모듈로 불러옴
import CustomText from '../CustomTextProps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const CaregiverFriendsListScreen = ({ navigation }) => {
  const [friends, setFriends] = useState([]);

  const fetchFriends = async () => {
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!jwtToken) {
        Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
        return;
      }
      const response = await axios.get(`${BASE_URL}/friendRequest/getFriends`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        }
      });

      setFriends(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '프렌즈 리스트를 불러오는 중 오류가 발생하였습니다.');
    }
  };

  // 화면이 포커스될 때마다 친구 목록을 새로 불러오는 함수
  useFocusEffect(
    useCallback(() => {
      fetchFriends();
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
      <View style={styles.friendDetails}>
        <CustomText style={styles.friendName}>{item.name}</CustomText>
        <CustomText style={styles.friendPhone}>{item.phoneNumber}</CustomText>
      </View>
      <View style={styles.friendInfo}>
        <CustomText style={styles.friendBirthday}>생년월일: {item.birthDate}</CustomText>
        <CustomText style={styles.friendGender}>성별: {item.gender === 'MALE' ? '남성' : '여성'}</CustomText>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  friendDetails: {
    flex: 1,
    flexDirection: 'column',
  },
  friendInfo: {
    flexShrink: 0,
    alignItems: 'flex-end',
  },
  friendName: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
  },
  friendPhone: {
    fontSize: 14,
    color: '#555',
  },
  friendBirthday: {
    fontSize: 14,
    color: '#333',
  },
  friendGender: {
    fontSize: 14,
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