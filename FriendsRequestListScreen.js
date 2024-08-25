import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

const FriendsRequestListScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);

  // 프렌즈의 UUID를 하드코딩
  const friendId = 'bc4527ff-9554-486f-865e-1364591a13f5';

  useEffect(() => {
    // 친구 요청 리스트를 가져오는 함수
    const fetchFriendRequests = async () => {
      try {
        const response = await axios.get(`http://10.0.2.2:8080/friendRequest/pendingRequests/${friendId}`);
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
      const response = await axios.post(`http://10.0.2.2:8080/friendRequest/${requestId}/${action}`);
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
      <Text style={styles.requestText}>{item.caregiverName}님의 친구 요청</Text>
      <View style={styles.buttonContainer}>
        <Button title="수락" onPress={() => handleRequestAction(item.requestId, 'accept')} />
        <Button title="거절" onPress={() => handleRequestAction(item.requestId, 'reject')} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>친구 요청 리스트</Text>
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
    fontWeight: 'bold',
    marginBottom: 20,
  },
  requestItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    borderRadius: 5,
  },
  requestText: {
    fontSize: 18,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default FriendsRequestListScreen;
