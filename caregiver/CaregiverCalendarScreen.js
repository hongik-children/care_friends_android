import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList, ScrollView, Text, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';

const CaregiverCalendarScreen = () => {
    const [friends, setFriends] = useState([]);
    const [currentFriend, setCurrentFriend] = useState(null);
    const [events, setEvents] = useState({});
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedDayEvents, setSelectedDayEvents] = useState([]);
    const [isEventModalVisible, setEventModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState(''); // 선택한 날짜와 요일 저장
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
                acc[date].push({ title: event.title, time: event.startTime, description: event.memo });
                return acc;
            }, {});

            console.log(eventsData);
            setEvents(eventsData);

        } catch (error) {
            console.error('일정 불러오기 오류:', error);
        }
    };

    // 요일 계산 함수
    const getDayOfWeek = (year, month, day) => {
        const date = new Date(year, month - 1, day); // 월은 0부터 시작하므로 -1
        const daysOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        return daysOfWeek[date.getDay()];
    };

    // 날짜를 눌렀을 때 호출되는 함수
    const handleDayPress = (date) => {
        const dateKey = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
        const dateEvents = events[dateKey] || [];
        const dayOfWeek = getDayOfWeek(date.year, date.month, date.day); // 요일 계산
        const selectedDate = `${date.year}년 ${String(date.month).padStart(2, '0')}월 ${String(date.day).padStart(2, '0')}일 (${dayOfWeek})`;
//        console.log(dateEvents);
//        console.log(events);
        setSelectedDay(selectedDate); // 선택된 날짜와 요일 설정
        setSelectedDayEvents(dateEvents); // 선택한 날짜의 이벤트를 저장
        setEventModalVisible(true); // 이벤트 모달 열기
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setCurrentFriend(friends[0])}>
                    <Feather name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.friendNameContainer}>
                    <Text style={styles.friendNameText}>
                        {currentFriend ? `${currentFriend.name}님의 일정` : '친구 선택'}
                    </Text>
                    <Feather name="chevron-down" size={20} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setCurrentFriend(friends[1])}>
                    <Feather name="chevron-right" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView>
                <Calendar
                    markedDates={Object.keys(events).reduce((acc, date) => {
                        acc[date] = { marked: true, dotColor: 'blue' };
                        return acc;
                    }, {})}
                    renderHeader={(date) => (
                        <Text style={styles.monthHeader}>
                            {date.toString('MMMM yyyy')}
                        </Text>
                    )}
                    dayComponent={({ date }) => {
                        const dateKey = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
                        const dateEvents = events[dateKey] || [];
                        return (
                            <TouchableOpacity
                                onPress={() => handleDayPress(date)} // 클릭 시 이벤트 정보 모달을 띄움
                                style={[styles.dayContainer, { width: screenWidth / 7 }]}
                            >
                                <Text style={styles.dayText}>{date.day}</Text>
                                {dateEvents.map((event, index) => (
                                    <View key={index} style={styles.eventItem}>
                                        <Text style={styles.eventText}>{event.title}</Text>
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

            <Modal isVisible={isEventModalVisible} onBackdropPress={() => setEventModalVisible(false)} style={styles.modalStyle}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{selectedDay}</Text>
                        <View style={styles.divider} />
                    </View>
                    {selectedDayEvents.length > 0 ? (
                        <FlatList
                            data={selectedDayEvents}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.eventItemModal}>

                                    <View style={styles.eventDetailsContainer}>
                                        {/* 시간과 제목을 함께 표시 (Text 내에서 문자열 결합) */}
                                        <Text style={styles.eventTitle}>
                                            {`${item.time || '시간 없음'}  |  ${item.title}`} {/* 시간과 제목 결합 */}
                                        </Text>
                                        <Text style={styles.eventDetail}>{item.description}</Text>
                                    </View>
                                </View>
                            )}
                        />
                    ) : (
                        <Text style={styles.noEventsText}>이 날짜에는 일정이 없습니다.</Text>
                    )}
                    <TouchableOpacity onPress={() => setEventModalVisible(false)} style={styles.closeModalButton}>
                        <Text style={styles.closeModalText}>닫기</Text>
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
        fontWeight: 'bold',
        color: '#333',
    },
    monthHeader: {
        fontSize: 20,
        fontWeight: 'bold',
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
    modalStyle: {
        justifyContent: 'center',  // 중앙 정렬
        alignItems: 'center',      // 중앙 정렬
        margin: 0,  // 화면 가장자리에 여백 없이
    },
    modalContent: {
        backgroundColor: '#333',
        padding: 20,
        borderRadius: 20,  // 둥근 모서리
        width: '90%',  // 모달 너비
    },
    modalHeader: {
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#555',
        marginVertical: 10,
        width: '100%',
    },
    eventItemModal: {
        flexDirection: 'row',
        marginBottom: 15,
        alignItems: 'center',
    },
    timeContainer: {
        width: 50,
    },
    eventDetailsContainer: {
        flex: 1,
        marginLeft: 10,
    },
    eventTitle: {
        fontSize: 16,
        color: '#fff',
    },
    eventDetail: {
        fontSize: 14,
        color: '#bbb',
        paddingLeft: 90,
//        textAlign: 'center', // 텍스트 가운데 정렬
    },
    noEventsText: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 20,
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
