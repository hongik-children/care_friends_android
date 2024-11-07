import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, TouchableOpacity, ScrollView, StyleSheet, Linking, Alert, Text, Modal, FlatList } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import CustomText from '../CustomTextProps';
import axios from 'axios';
import { BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';

const ScheduleScreen = () => {
  const [currentFriend, setCurrentFriend] = useState(null); // 현재 선택된 친구
  const [friends, setFriends] = useState([]); // 친구 목록
  const [tasks, setTasks] = useState([]); // 일정 목록
  const [location, setLocation] = useState(null); // 위치 정보
  const [showMap, setShowMap] = useState(false); // 지도 표시 여부
  const [modalVisible, setModalVisible] = useState(false); // 드롭다운 모달 표시 여부
  const [selectedTask, setSelectedTask] = useState(null); // 선택된 일정
  const [taskActionModalVisible, setTaskActionModalVisible] = useState(false); // 일정 액션 모달
  const navigation = useNavigation();
  const today = new Date(); // 오늘 날짜

  useEffect(() => {
    fetchFriends();
  }, []);

  useEffect(() => {
    if (currentFriend) {
      fetchTasks(currentFriend);
    }
  }, [currentFriend]);

  useFocusEffect(
    useCallback(() => {
      fetchFriends();
    }, [])
  );

  // 친구 목록 불러오기
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
        },
      });

      setFriends(response.data);
      if (response.data.length > 0) {
        setCurrentFriend(response.data[0]); // 첫 번째 친구 선택
      }
    } catch (error) {
      console.error('친구 목록 불러오기 실패:', error);
    }
  };

  // 오늘의 일정만 불러오기
  const fetchTasks = async (friend) => {
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!jwtToken) {
        Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
        return;
      }

      const todayString = today.toISOString().split('T')[0];

      const response = await axios.get(`${BASE_URL}/task/${friend.friendId}?date=${todayString}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      setTasks(response.data);
    } catch (error) {
      console.error('일정 불러오기 실패:', error);
    }
  };

  // 친구 선택 처리
  const handleFriendSelect = (friendId) => {
    const selectedFriend = friends.find(f => f.friendId === friendId);
    setCurrentFriend(selectedFriend);
    setModalVisible(false); // 드롭다운 닫기
  };

  // 화살표로 친구 이동
  const handleNextFriend = () => {
    const currentIndex = friends.findIndex(f => f.friendId === currentFriend.friendId);
    const nextIndex = (currentIndex + 1) % friends.length;
    setCurrentFriend(friends[nextIndex]);
  };

  const handlePreviousFriend = () => {
    const currentIndex = friends.findIndex(f => f.friendId === currentFriend.friendId);
    const prevIndex = (currentIndex - 1 + friends.length) % friends.length;
    setCurrentFriend(friends[prevIndex]);
  };

  // 일정 클릭 시 액션 모달 열기
  const handleTaskPress = (task) => {
    setSelectedTask(task);
    setTaskActionModalVisible(true);
  };

  // 전화 걸기 기능
  const handleCall = () => {
    if (currentFriend && currentFriend.phoneNumber) {
      const phoneNumber = `tel:${currentFriend.phoneNumber}`;
      Linking.openURL(phoneNumber).catch(err => console.error('Error calling phone number', err));
    }
  };

  // 문자 보내기 기능
  const handleSendMessage = () => {
    if (currentFriend && currentFriend.phoneNumber) {
      const sms = `sms:${currentFriend.phoneNumber}`;
      Linking.openURL(sms).catch(err => console.error('Error sending SMS', err));
    }
  };

  // 시간 형식 변환 함수 (오전/오후 표시)
  const formatTime = (timeString) => {
    const time = new Date(`1970-01-01T${timeString}+09:00`);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const period = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${period} ${formattedHours}:${formattedMinutes}`;
  };


  const DayofWeek = ['일','월','화','수','목','금','토'];
  // 알림 전송 API 호출
  const sendNotification = async (taskId) => {
    try {
      console.log(taskId)
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      await axios.post(`${BASE_URL}/task/sendNotification`,
        { taskId: taskId },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      Alert.alert("알림 전송", "일정 알림이 노약자에게 전송되었습니다.");
    } catch (error) {
      console.error('알림 전송 실패:', error);
      Alert.alert("알림 전송 실패", "알림을 전송하는 중 문제가 발생했습니다.");
    }
  };


  // 일정 삭제 API 호출
  const deleteTask = async (taskId) => {
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      await axios.delete(`${BASE_URL}/task`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
        data: {
          id: taskId,
        },
      });
      Alert.alert("삭제 완료", "일정이 성공적으로 삭제되었습니다.");
      // 일정 삭제 후 목록을 새로고침
      fetchTasks(currentFriend);
      setTaskActionModalVisible(false); // 모달 닫기
    } catch (error) {
      console.error('일정 삭제 실패:', error);
      Alert.alert("삭제 실패", "일정을 삭제하는 중 문제가 발생했습니다.");
    }
  };

  console.log("selected Task " + selectedTask);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 친구 목록이 있는지 확인 */}
      {friends.length > 0 ? (
        <>
          {/* 친구 선택 및 화살표 */}
            <View style={styles.friendScheduleHeader}>
              <CustomText style={styles.title}>
                오늘
              </CustomText>

              <TouchableOpacity onPress={handlePreviousFriend} style={styles.iconWrapper}>
                <Feather name="chevron-left" size={24} color="#333" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.friendNameContainer}>
                <CustomText style={styles.friendNameHighlight}>
                  {currentFriend ? `${currentFriend.name}` : "친구"}
                </CustomText>
                <Feather name="chevron-down" size={20} color="#333" style={styles.iconWrapper} />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleNextFriend} style={styles.iconWrapper}>
                <Feather name="chevron-right" size={24} color="#333" />
              </TouchableOpacity>

              <CustomText style={styles.title}>
                님의 일정
              </CustomText>
            </View>

          <CustomText style={styles.date}>{new Date().getMonth()+1}월 {new Date().getDate()}일 ({DayofWeek[new Date().getDay()]})</CustomText>


          {/* 일정 목록 표시 */}
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TouchableOpacity key={task.id} style={styles.event} onPress={() => handleTaskPress(task)}>
                <CustomText style={styles.time}>{formatTime(task.startTime)}</CustomText>
                <CustomText style={styles.description}>{task.title}</CustomText>
              </TouchableOpacity>
            ))
          ) : (
            <CustomText style={styles.noTaskText}>오늘 일정이 없습니다.</CustomText>
          )}

          {/* 일정 액션 모달 */}
          <Modal visible={taskActionModalVisible} transparent={true} animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <CustomText style={styles.modalTitle}>{selectedTask?.title}</CustomText>
                <TouchableOpacity onPress={() => sendNotification(selectedTask.id)} style={styles.actionButton}>
                  <Feather name="bell" size={24} color="#fff" />
                  <CustomText style={styles.actionButtonText}>알림 보내기</CustomText>
                </TouchableOpacity>
                {/*일정 수정시 선택한 일정의 수정화면으로 가게 수정*/}
                <TouchableOpacity style={styles.actionButton} onPress={() => {
                    setTaskActionModalVisible(false);
                    const event = {taskId : selectedTask.id}
                    navigation.navigate('EditScheduleScreen', { event })
                }} >
                  <Feather name="edit" size={24} color="#fff" />
                  <CustomText style={styles.actionButtonText}>일정 수정하기</CustomText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(selectedTask.id)} style={styles.actionButton}>
                  <Feather name="trash-2" size={24} color="#fff" />
                  <CustomText style={styles.actionButtonText}>일정 삭제하기</CustomText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTaskActionModalVisible(false)} style={styles.closeModalButton}>
                  <CustomText style={styles.closeModalText}>닫기</CustomText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('LocationScreen', { friendId: currentFriend.friendId })}>
              <Feather name="map-pin" size={24} color="#fff" />
              <CustomText style={styles.actionButtonText}>위치 조회하기</CustomText>
          </TouchableOpacity>

          {/* 전화 걸기 */}
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Feather name="phone" size={24} color="#fff" />
            <CustomText style={styles.actionButtonText}>전화 걸기</CustomText>
          </TouchableOpacity>

          {/* 문자 보내기 */}
          <TouchableOpacity style={styles.actionButton} onPress={handleSendMessage}>
            <Feather name="message-circle" size={24} color="#fff" />
            <CustomText style={styles.actionButtonText}>문자 보내기</CustomText>
          </TouchableOpacity>

          {/* 일정 추가하기 */}
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AddScheduleScreen', { friendId: currentFriend.friendId })}>
            <Feather name="calendar" size={24} color="#fff" />
            <CustomText style={styles.actionButtonText}>일정 추가하기</CustomText>
          </TouchableOpacity>

          {/* 지도 표시 */}
          {showMap && location && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="현재 위치"
              />
            </MapView>
          )}

          {/* 드롭다운 모달 */}
          <Modal
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <FlatList
                  data={friends}
                  keyExtractor={(item) => item.friendId.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.friendItem}
                      onPress={() => handleFriendSelect(item.friendId)}
                    >
                      <CustomText style={styles.friendItemText}>{item.name}</CustomText>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeModalButton}>
                  <CustomText style={styles.closeModalText}>닫기</CustomText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <View style={styles.noFriendsContainer}>
          <CustomText style={styles.noFriendsText}>등록된 친구가 없습니다.</CustomText>
          <CustomText style={styles.noFriendsText}>친구를 추가해주세요!</CustomText>
          <TouchableOpacity style={styles.addFriendButton} onPress={() => navigation.navigate('AddFriendScreen')}>
            <Feather name="user-plus" size={20} color="#fff" style={styles.icon} />
            <CustomText style={styles.addFriendButtonText}>친구 추가</CustomText>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Pretendard-ExtraBold',
    marginVertical: 10,
    color: '#000000',
  },
  date: {
    fontSize: 24,
    marginBottom: 20,
    color: '#333333',
  },
  friendScheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  friendNameContainer: {
    fontSize: 28,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  friendNameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendNameText: {
    fontSize: 28,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    marginHorizontal: 10,
  },
  friendNameHighlight: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 28,
    color: '#333333',
  },
  event: {
    backgroundColor: '#EFF5FB',
    width: '100%',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  time: {
    fontSize: 22,
    color: '#000',
  },
  description: {
    fontSize: 22,
    color: '#000',
  },
  noTaskText: {
    fontSize: 18,
    color: '#555',
    marginVertical: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6495ED',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
  map: {
    width: '100%',
    height: 300,
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    alignItems: 'center',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  friendItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  friendItemText: {
    fontSize: 18,
    color: '#333',
  },
  modalTitle: {
      fontSize: 22,
      marginBottom: 15,
  },
  closeModalButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  closeModalText: {
    fontSize: 16,
    color: '#6495ED',
  },
  noFriendsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noFriendsText: {
    fontSize: 20,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6495ED',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  addFriendButtonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
  iconWrapper: {
    marginHorizontal: 5,
  },
  icon: {
    marginRight: 8,
  },
});

export default ScheduleScreen;
