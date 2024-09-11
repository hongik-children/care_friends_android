import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '@env'; // @env 모듈로 불러옴

const AddFriendScreen = ({ navigation }) => {
  const [uuid, setUuid] = useState('');
  const [requests, setRequests] = useState([]);

  // 보호자의 ID를 하드코딩 (예시)
  const caregiverId = '036c9858-439b-4bb1-b999-970cd85f2f7f';

  const handleAddFriend = async () => {
    if (uuid.trim() === '') {
      Alert.alert('Error', '유효한 UUID를 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/friendRequest`, {
        friendId: uuid,
        caregiver: {
          id: caregiverId,
          name: 'caregiver',
          phoneNumber: '01012345678',
          gender: 'MALE',
        },
      });

      if (response.status === 200) {
        Alert.alert('성공', '친구 요청이 완료되었습니다.');
        fetchFriendRequests(); // 친구 요청 전송 후 목록을 새로고침
      } else {
        Alert.alert('오류', '친구 요청에 실패하였습니다.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '친구 추가 중 오류가 발생하였습니다.');
    }
  };

  // 친구 요청 목록 가져오기
  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/friendRequest/getRequests/${caregiverId}`);

      // 대기중(pending) 및 거절된(rejected) 요청만 필터링
      const filteredRequests = response.data.filter(request => request.status === 'pending' || request.status === 'rejected');
      setRequests(filteredRequests);
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '친구 요청 목록을 불러오는 중 오류가 발생하였습니다.');
    }
  };

  useEffect(() => {
    fetchFriendRequests(); // 화면 로드 시 친구 요청 목록 불러오기
  }, []);

  // 친구 요청 취소
  const handleCancelRequest = async (requestId) => {
    try {
      await axios.post(`${BASE_URL}/friendRequest/${requestId}/cancel`);
      Alert.alert('성공', '친구 요청이 취소되었습니다.');
      fetchFriendRequests(); // 취소 후 목록을 새로고침
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '친구 요청 취소 중 오류가 발생하였습니다.');
    }
  };

  // 친구 요청 목록 렌더링
  const renderRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Text style={styles.requestText}>{item.friendName}님에게 보낸 친구 요청</Text>
      {item.status === 'pending' ? (
        <TouchableOpacity onPress={() => handleCancelRequest(item.requestId)} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>요청 취소</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.rejectedText}>거절됨</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>친구 코드를 입력해주세요.</Text>
      <TextInput
        style={styles.input}
        placeholder="UUID"
        value={uuid}
        onChangeText={setUuid}
        placeholderTextColor="#9CA3AF"
      />
      <TouchableOpacity style={styles.button} onPress={handleAddFriend}>
        <Text style={styles.buttonText}>친구 요청 보내기</Text>
      </TouchableOpacity>

      <Text style={styles.title}>대기중/거절된 친구 요청 목록</Text>
      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.requestId.toString()}
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
  label: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  button: {
    backgroundColor: '#6495ED',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  requestItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestText: {
    fontSize: 16,
    color: '#333',
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  rejectedText: {
    fontSize: 16,
    color: 'red',
  },
});

export default AddFriendScreen;
