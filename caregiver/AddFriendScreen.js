import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, Modal, StyleSheet } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '@env'; // @env 모듈로 불러옴
import CustomText from '../CustomTextProps';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddFriendScreen = ({ navigation }) => {
  const [uuid, setUuid] = useState('');
  const [friend, setFriend] = useState(null); // 친구 정보 저장
  const [requests, setRequests] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // 팝업 모달 상태

  // 보호자의 ID를 하드코딩 (예시)
  //const caregiverId = '036c9858-439b-4bb1-b999-970cd85f2f7f';

  // 친구 UUID로 검색
  const handleSearchFriend = async () => {
    if (uuid.trim() === '') {
      Alert.alert('Error', '유효한 UUID를 입력해주세요.');
      return;
    }

    try {
      // JWT 토큰 가져오기
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!jwtToken) {
        Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
        return;
      }

      // 친구 검색 API 요청
      const response = await axios.get(`${BASE_URL}/friendRequest/searchFriend/${uuid}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      });

      if (response.status === 200 && response.data) {
        setFriend(response.data); // 친구 정보 저장
        setModalVisible(true); // 팝업 모달 띄우기
      } else {
        Alert.alert('오류', '친구를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '친구 검색 중 오류가 발생하였습니다.');
    }
  };

  // 친구 요청 보내기
  const handleAddFriend = async () => {
    try {

      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!jwtToken) {
        Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
        return;
      }

      const response = await axios.post(`${BASE_URL}/friendRequest`, {
        friendId: uuid,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}` // JWT 토큰을 헤더에 추가
          }
      });

      if (response.status === 200) {
        Alert.alert('성공', '친구 요청이 완료되었습니다.');
        fetchFriendRequests(); // 친구 요청 전송 후 목록을 새로고침
        setModalVisible(false); // 팝업 닫기
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
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!jwtToken) {
        Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
        return;
      }

      const response = await axios.get(`${BASE_URL}/friendRequest/getRequests`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      });

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

      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!jwtToken) {
        Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
        return;
      }

      await axios.post(`${BASE_URL}/friendRequest/${requestId}/cancel`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      });
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
      <CustomText style={styles.requestText}>{item.friendName}님에게 보낸 친구 요청</CustomText>
      {item.status === 'pending' ? (
        <TouchableOpacity onPress={() => handleCancelRequest(item.requestId)} style={styles.cancelButton}>
          <CustomText style={styles.cancelButtonText}>요청 취소</CustomText>
        </TouchableOpacity>
      ) : (
        <CustomText style={styles.rejectedText}>거절됨</CustomText>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomText style={styles.label}>친구 코드를 입력해주세요.</CustomText>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="UUID"
          value={uuid}
          onChangeText={setUuid}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchFriend}>
          <Feather name="search" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <CustomText style={styles.title}>대기중/거절된 친구 요청 목록</CustomText>
      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.requestId.toString()}
      />

        {/* 팝업 모달 */}
        {friend && (
          <Modal visible={modalVisible} transparent={true} animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>

                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>

                <CustomText style={styles.modalTitle}>친구 요청</CustomText>
                <CustomText style={styles.modalFriendName}>{friend.name}님에게 친구요청을 보낼까요?</CustomText>

                <TouchableOpacity style={styles.confirmButton} onPress={handleAddFriend}>
                  <Feather name="user-plus" size={20} color="#fff" />
                  <CustomText style={styles.confirmButtonText}> 친구 요청</CustomText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  searchButton: {
    backgroundColor: '#6495ED',
    padding: 10,
    marginLeft: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    position: 'relative', // X 버튼을 우상단에 위치시키기 위해 추가
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10, // 우상단에 X 버튼 배치
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Pretendard-Bold',
    marginBottom: 10,
  },
  modalFriendName: {
    fontSize: 18,
    marginBottom: 20,
  },
  confirmButton: {
    flexDirection: 'row', // 아이콘과 텍스트를 나란히 배치하기 위해 row 설정
    alignItems: 'center',
    backgroundColor: '#6495ED',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    marginLeft: 10, // 아이콘과 텍스트 사이 여백
  },
});

export default AddFriendScreen;
