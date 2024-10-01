import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '@env'; // @env 모듈로 불러옴
import CustomText from '../CustomTextProps';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FriendsRequestListScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);

  // 프렌즈의 UUID를 하드코딩
  //const friendId = 'fce5ae58-7682-429b-b784-6e15e10d0ee9';

  useEffect(() => {
    // 친구 요청 리스트를 가져오는 함수
    const fetchFriendRequests = async () => {
      try {
        const jwtToken = await AsyncStorage.getItem('jwtToken');
        if (!jwtToken) {
          Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
          return;
        }
        console.log(BASE_URL); //BASE_URL이 안불러와지는 에러 해결
        const response = await axios.get(`${BASE_URL}/friendRequest/pendingRequests`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`
          }
        });
        setRequests(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert('오류', '친구 요청 목록을 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchFriendRequests();
  }, []);

  // 친구 요청 수락/거절 버튼 클릭 시 호출되는 함수
  const handleRequestAction = async (requestId, action) => {
    try {
      console.log(requestId);
      console.log(action);
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      console.log(jwtToken);
      if (!jwtToken) {
        Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
        return;
      }
      console.log(`${BASE_URL}/friendRequest/${requestId}/${action}`);
      const response = await axios.post(`${BASE_URL}/friendRequest/${requestId}/${action}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      });
      console.log(response);
      if (response.status === 200) {
        Alert.alert('성공', `친구 요청이 ${action === 'accept' ? '수락' : '거절'}되었습니다.`);
        setRequests(requests.filter(req => req.requestId !== requestId)); // 수락/거절된 요청을 리스트에서 제거
      } else {
        Alert.alert('오류', '친구 요청 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '친구 요청 처리 중 오류가 발생했습니다.');
    }
  };

  // 리스트 항목 렌더링
  const renderRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      <CustomText style={styles.requestText}>{item.caregiverName}님의 친구 요청</CustomText>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleRequestAction(item.requestId, 'accept')}
        >
          <CustomText style={styles.acceptButtonText}>수락</CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleRequestAction(item.requestId, 'reject')}
        >
          <CustomText style={styles.rejectButtonText}>거절</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>친구 요청 리스트</CustomText>
      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={item => item.requestId.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Pretendard-Bold',
    marginBottom: 20,
  },
  requestItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',  // 텍스트와 버튼이 같은 줄에 위치하게 함
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestText: {
    fontSize: 18,
    marginBottom: 10,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: '#6495ED',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
    marginRight: 10,
  },
  acceptButtonText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Bold',
    color: '#fff',
  },
  rejectButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
  },
  rejectButtonText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Bold',
    color: '#fff',
  },
});

export default FriendsRequestListScreen;
