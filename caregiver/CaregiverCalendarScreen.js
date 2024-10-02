import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomText from '../CustomTextProps';
import Modal from 'react-native-modal'; // react-native-modal 사용

const CaregiverCalendarScreen = () => {
    const [friends, setFriends] = useState([]); // 친구 목록
    const [currentFriend, setCurrentFriend] = useState(null); // 현재 선택된 친구
    const [events, setEvents] = useState({}); // 날짜별 이벤트 리스트
    const [selectedDate, setSelectedDate] = useState(null); // 선택한 날짜
    const [isModalVisible, setModalVisible] = useState(false); // 친구 선택 모달
    const [isEventModalVisible, setEventModalVisible] = useState(false); // 일정 확인 모달

    useEffect(() => {
        fetchFriends();
    }, []);

    useEffect(() => {
        if (currentFriend) {
            fetchTasks(currentFriend); // 선택된 친구의 일정 불러오기
        }
    }, [currentFriend]);

    const fetchFriends = async () => {
        try {
            const jwtToken = await AsyncStorage.getItem('jwtToken');
            if (!jwtToken) {
                Alert.alert('오류', 'JWT 토큰이 필요합니다.');
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
            console.error('친구 목록 불러오기 오류:', error);
        }
    };

    const fetchTasks = async (friend) => {
        try {
            const jwtToken = await AsyncStorage.getItem('jwtToken');
            const response = await axios.get(`${BASE_URL}/task/${friend.friendId}`, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            const data = response.data;

            const eventsData = data.reduce((acc, event) => {
                const date = event.date;
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push({ time: event.startTime, title: event.title, ...event });
                return acc;
            }, {});

            setEvents(eventsData);
        } catch (error) {
            console.error('일정 불러오기 오류:', error);
        }
    };

    const handleDayPress = (day) => {
        setSelectedDate(day.dateString);
        setEventModalVisible(true);
    };

    const closeEventModal = () => {
        setEventModalVisible(false);
        setSelectedDate(null);
    };

    return (
        <View style={styles.container}>
            {/* 화살표로 친구 이동 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setCurrentFriend(friends[0])}>
                    <Feather name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.friendNameContainer}>
                    <CustomText style={styles.friendNameText}>
                        {currentFriend ? `${currentFriend.name}님의 일정` : '친구 선택'}
                    </CustomText>
                    <Feather name="chevron-down" size={20} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setCurrentFriend(friends[1])}>
                    <Feather name="chevron-right" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* 달력 표시 */}
            <Calendar
                onDayPress={handleDayPress}
                markedDates={Object.keys(events).reduce((acc, date) => {
                    acc[date] = { marked: true, dotColor: 'blue' };
                    return acc;
                }, {})}
                theme={{
                    todayTextColor: '#6495ED',
                    arrowColor: '#6495ED',
                    dotColor: '#6495ED',
                }}
            />

            {/* 친구 선택 모달 */}
            <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
                <View style={styles.modalContent}>
                    <FlatList
                        data={friends}
                        keyExtractor={(item) => item.friendId.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    setCurrentFriend(item);
                                    setModalVisible(false);
                                }}
                                style={styles.friendItem}
                            >
                                <CustomText style={styles.friendItemText}>{item.name}</CustomText>
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeModalButton}>
                        <CustomText style={styles.closeModalText}>닫기</CustomText>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* 일정 확인 모달 */}
            <Modal isVisible={isEventModalVisible} onBackdropPress={closeEventModal}>
                <View style={styles.modalContent}>
                    <CustomText style={styles.modalTitle}>
                        {selectedDate ? `${selectedDate}의 일정` : '일정이 없습니다.'}
                    </CustomText>
                    {events[selectedDate]?.length > 0 ? (
                        events[selectedDate].map((event, index) => (
                            <TouchableOpacity key={index} style={styles.event}>
                                <CustomText>{event.time}: {event.title}</CustomText>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <CustomText>이날은 일정이 없습니다.</CustomText>
                    )}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    friendNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    friendNameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    friendItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        width: '100%',
    },
    friendItemText: {
        fontSize: 18,
        color: '#333',
    },
    closeModalButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    closeModalText: {
        fontSize: 16,
        color: '#6495ED',
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Pretendard-Bold',
        marginBottom: 20,
    },
    event: {
        padding: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        width: '100%',
    },
});

export default CaregiverCalendarScreen;
