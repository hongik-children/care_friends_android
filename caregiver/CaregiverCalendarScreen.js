import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList, ScrollView, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomText from '../CustomTextProps';
import Modal from 'react-native-modal';

const CaregiverCalendarScreen = () => {
    const [friends, setFriends] = useState([]);
    const [currentFriend, setCurrentFriend] = useState(null);
    const [events, setEvents] = useState({});
    const [isModalVisible, setModalVisible] = useState(false);
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
                acc[date].push({ title: event.title, ...event });
                return acc;
            }, {});

            setEvents(eventsData);
        } catch (error) {
            console.error('일정 불러오기 오류:', error);
        }
    };

    return (
        <View style={styles.container}>
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

            <ScrollView>
                <Calendar
                    onDayPress={() => {}}
                    markedDates={Object.keys(events).reduce((acc, date) => {
                        acc[date] = { marked: true, dotColor: 'blue' };
                        return acc;
                    }, {})}
                    renderHeader={(date) => (
                        <CustomText style={styles.monthHeader}>
                            {date.toString('MMMM yyyy')}
                        </CustomText>
                    )}
                    dayComponent={({ date }) => (
                        <View style={[styles.dayContainer, { width: screenWidth / 7 }]}>
                            <CustomText style={styles.dayText}>{date.day}</CustomText>
                            {events[`${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`]?.map((event, index) => (
                                <View key={index} style={styles.eventItem}>
                                    <CustomText style={styles.eventText}>{event.title}</CustomText>
                                </View>
                            ))}
                        </View>
                    )}
                    theme={{
                        todayTextColor: '#6495ED',
                        arrowColor: '#6495ED',
                        dotColor: '#6495ED',
                    }}
                    style={styles.calendar}
                />
            </ScrollView>

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
});

export default CaregiverCalendarScreen;
