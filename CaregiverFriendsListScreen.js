import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '@env'; // @env 모듈로 불러옴
import CustomText from './CustomTextProps';

const CaregiverFriendsListScreen = ({ navigation }) => {
  const [friends, setFriends] = useState([]);
  // 보호자의 UUID를 하드코딩
  const caregiverId = '036c9858-439b-4bb1-b999-970cd85f2f7f';

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/friendRequest/getFriends/${caregiverId}`);
        setFriends(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert('오류', '프렌즈 리스트를 불러오는 중 오류가 발생하였습니다.');
      }
    };

    fetchFriends();
  }, [caregiverId]);



  // 프렌드 정보 렌더링
  const renderFriendItem = ({ item }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => navigation.navigate('FriendActionScreen', { friend: item })} // 프렌즈 정보 전달
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
        <FlatList
          data={friends}
          keyExtractor={(item) => item.name}
          renderItem={renderFriendItem}
        />
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
  backButton: {
    marginTop: 20,
    backgroundColor: '#6495ED',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
  },
});


export default CaregiverFriendsListScreen;
