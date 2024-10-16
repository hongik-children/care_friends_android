import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList, ScrollView, Text, Dimensions, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import CustomText from '../CustomTextProps';

const CaregiverCalendarScreen = () => {
    const navigation = useNavigation();
    const [friends, setFriends] = useState([]);
    const [currentFriend, setCurrentFriend] = useState(null);
    const [events, setEvents] = useState({});
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedDayEvents, setSelectedDayEvents] = useState([]);
    const [isEventModalVisible, setEventModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState('');
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        fetchFriends();
    }, []);

    useEffect(() => {
        if (currentFriend) {
            fetchTasks(currentFriend);
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
                setCurrentFriend(response.data[0]);
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
                acc[date].push({ title: event.title, time: event.startTime, description: event.memo, taskId: event.id });
                return acc;
            }, {});

            setEvents(eventsData);

        } catch (error) {
            console.error('일정 불러오기 오류:', error);
        }
    };

    const getDayOfWeek = (year, month, day) => {
        const date = new Date(year, month - 1, day);
        const daysOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        return daysOfWeek[date.getDay()];
    };

    const handleDayPress = (date) => {
        const dateKey = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
        const dateEvents = events[dateKey] || [];
        const dayOfWeek = getDayOfWeek(date.year, date.month, date.day);
        const selectedDate = `${date.year}년 ${String(date.month).padStart(2, '0')}월 ${String(date.day).padStart(2, '0')}일 (${dayOfWeek})`;
        setSelectedDay(selectedDate);
        setSelectedDayEvents(dateEvents);
        setEventModalVisible(true);
    };

    // 화살표로 다음 친구 선택
    const handleNextFriend = () => {
        const currentIndex = friends.findIndex(f => f.friendId === currentFriend.friendId);
        const nextIndex = (currentIndex + 1) % friends.length; // 마지막 친구에서 처음으로
        setCurrentFriend(friends[nextIndex]);
    };

    // 화살표로 이전 친구 선택
    const handlePreviousFriend = () => {
        const currentIndex = friends.findIndex(f => f.friendId === currentFriend.friendId);
        const prevIndex = (currentIndex - 1 + friends.length) % friends.length; // 첫 친구에서 마지막으로
        setCurrentFriend(friends[prevIndex]);
    };

    return (
        <View style={styles.container}>
            {/* 친구 목록이 있는지 확인 */}
            {friends.length > 0 ? (
                <>
                    {/* 친구 선택 및 화살표 */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handlePreviousFriend}>
                            <Feather name="chevron-left" size={24} color="#333" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.friendNameContainer}>
                            <CustomText style={styles.friendNameText}>
                                {currentFriend ? `${currentFriend.name}님의 일정` : '친구 선택'}
                            </CustomText>
                            <Feather name="chevron-down" size={20} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleNextFriend}>
                            <Feather name="chevron-right" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {/* 모달: 친구 선택 */}
                    <Modal
                        transparent={true}
                        visible={isModalVisible}
                        onRequestClose={() => setModalVisible(false)}
                        style={{ margin: 0 }}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <FlatList
                                    data={friends}
                                    keyExtractor={(item) => item.friendId.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.friendItem}
                                            onPress={() => {
                                                setCurrentFriend(item);
                                                setModalVisible(false); // 모달 닫기
                                            }}
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

                    <ScrollView>
                        <Calendar
                            markedDates={Object.keys(events).reduce((acc, date) => {
                                acc[date] = { marked: true, dotColor: 'blue' };
                                return acc;
                            }, {})}
                            renderHeader={(date) => (
                                <CustomText style={styles.monthHeader}>
                                    {date.toString('MMMM yyyy')}
                                </CustomText>
                            )}
                            dayComponent={({ date }) => {
                                const dateKey = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
                                const dateEvents = events[dateKey] || [];
                                return (
                                    <TouchableOpacity
                                        onPress={() => handleDayPress(date)}
                                        style={[styles.dayContainer, { width: screenWidth / 7 }]}
                                    >
                                        <CustomText style={styles.dayText}>{date.day}</CustomText>
                                        {dateEvents.map((event, index) => (
                                            <View key={index} style={styles.eventItem}>
                                                <CustomText style={styles.eventText}>{event.title}</CustomText>
                                            </View>
                                        ))}
                                    </TouchableOpacity>
                                );
                            }}
                            theme={{
                                todayTextColor: '#6495ED',
                                arrowColor: '#6495ED',
                                dotColor: '#6495ED',
                            }}
                            style={styles.calendar}
                        />
                    </ScrollView>
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

            <Modal isVisible={isEventModalVisible} onBackdropPress={() => setEventModalVisible(false)} style={styles.modalStyle}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <CustomText style={styles.modalTitle}>{selectedDay}</CustomText>
                        <View style={styles.divider} />
                    </View>
                    {selectedDayEvents.length > 0 ? (
                        <FlatList
                            data={selectedDayEvents}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.eventItemModal}>
                                    <CustomText style={styles.eventTitle}>
                                        {`${item.time || '시간 없음'}  |  ${item.title}`}
                                    </CustomText>
                                    <CustomText style={styles.eventDetail}>{item.description}</CustomText>
                                </View>
                            )}
                        />
                    ) : (
                        <CustomText style={styles.noEventsText}>이 날짜에는 일정이 없습니다.</CustomText>
                    )}
                    <TouchableOpacity onPress={() => setEventModalVisible(false)} style={styles.closeModalButton}>
                        <CustomText style={styles.closeModalText}>닫기</CustomText>
                    </TouchableOpacity>
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
        fontFamily: 'Pretendard-Bold',
        color: '#333',
    },
    monthHeader: {
        fontSize: 20,
        fontFamily: 'Pretendard-Bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    dayContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayText: {
        fontSize: 16,
    },
    eventItem: {
        backgroundColor: '#F0F0F0',
        padding: 2,
        marginTop: 2,
        borderRadius: 4,
    },
    eventText: {
        fontSize: 10,
        color: '#333',
    },
    calendar: {
        borderWidth: 1,
        borderColor: '#ddd',
        height: 'auto',
    },
    noFriendsContainer: {
        flex:1,
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
    icon: {
        marginRight: 8,
    },
    modalStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
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
    closeModalButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    closeModalText: {
        fontSize: 16,
        color: '#6495ED',
    },
    eventItemModal: {
        flexDirection: 'row',
        marginBottom: 15,
        alignItems: 'center',
    },
    eventTitle: {
        fontSize: 16,
        color: '#333',
    },
    eventDetail: {
        fontSize: 14,
        color: '#999',
    },
    closeModalButton: {
        alignItems: 'center',
        marginTop: 20,
    },
    closeModalText: {
        fontSize: 16,
        color: '#6495ED',
    },
});

export default CaregiverCalendarScreen;
