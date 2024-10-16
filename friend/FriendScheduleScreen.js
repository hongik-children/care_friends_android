import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, PermissionsAndroid, Platform, ActivityIndicator, Modal, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';
import { request, PERMISSIONS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 추가
import axios from 'axios'; // 추가
import CustomText from '../CustomTextProps';
import Feather from 'react-native-vector-icons/Feather'; // 아이콘 추가
import { BASE_URL } from '@env';
import { useFocusEffect } from '@react-navigation/native'; // useFocusEffect 추가

notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;
    if (type === notifee.EventType.PRESS) {
        console.log('Notification pressed:', notification);
    }
    if (type === notifee.EventType.ACTION_PRESS) {
        console.log('Action pressed:', pressAction);
    }
    await notifee.cancelNotification(notification.id);
});

const FriendScheduleScreen = ({ navigation }) => {
    const [location, setLocation] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [tasks, setTasks] = useState([]); // 일정 목록을 저장할 상태
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [selectedTask, setSelectedTask] = useState(null); // 선택된 일정
    const [taskActionModalVisible, setTaskActionModalVisible] = useState(false); // 일정 액션 모달

    useEffect(() => {
        requestUserPermission();
        getFcmToken();
        fetchTasks(); // 일정 데이터를 가져오는 함수 호출
        getCurrentLocationAndSendToServer(); // 앱 실행 시 위치 조회

        // 타이머를 이용해 주기적으로 위치를 가져와 서버에 전송 (예: 5분마다)
        const locationInterval = setInterval(() => {
            getCurrentLocationAndSendToServer(); // 주기적으로 최신 위치를 가져와서 전송
        }, 5 * 60 * 1000); // 5분마다 실행

        const unsubscribe = messaging().onMessage(async remoteMessage => onMessageReceived(remoteMessage));
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            onMessageReceived(remoteMessage);
        });

        return () => {
            unsubscribe();
            clearInterval(locationInterval); // 컴포넌트 언마운트 시 타이머 정리
        };
    }, []);

    // useFocusEffect로 화면이 다시 포커스를 받을 때마다 fetchTasks 실행
    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [])
    );

    // 최신 위치를 가져와서 서버에 전송하는 함수
    const getCurrentLocationAndSendToServer = () => {
        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation(position); // 위치 상태 업데이트 (지도에 표시할 수 있도록)
                try {
                    const jwtToken = await AsyncStorage.getItem('jwtToken');
                    await axios.post(`${BASE_URL}/location/update`, {
                        latitude,
                        longitude
                    }, {
                        headers: {
                            Authorization: `Bearer ${jwtToken}`
                        }
                    });
                    console.log('위치가 서버에 업데이트되었습니다.');
                } catch (error) {
                    console.error('위치 업데이트 실패:', error);
                }
            },
            (error) => {
                console.error('위치 가져오기 실패:', error);
            },
            { enableHighAccuracy: false, timeout: 15000 }
        );
    };

    // 일정 데이터를 가져오는 함수
    const fetchTasks = async () => {
        try {
            const jwtToken = await AsyncStorage.getItem('jwtToken');
            const today = new Date().toISOString().split('T')[0];
            const response = await axios.get(`${BASE_URL}/task/myTask?date=${today}`, {
                headers: { Authorization: `Bearer ${jwtToken}` },
            });
            setTasks(response.data); // 서버에서 받은 일정 데이터 저장
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const requestUserPermission = async () => {
        // 푸시 알림 권한 요청 (Firebase)
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Authorization status:', authStatus);
        }

        // 위치 및 마이크 권한 요청 (Android, iOS)
        if (Platform.OS === 'android') {
            // 위치 권한 요청
            const locationGranted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "Location Permission",
                    message: "This app needs access to your location.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );

            if (locationGranted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Location permission granted");
            } else {
                console.log("Location permission denied");
            }

            // 마이크 권한 요청
            const microphoneGranted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                {
                    title: "Microphone Permission",
                    message: "This app needs access to your microphone for voice recognition.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );

            if (microphoneGranted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Microphone permission granted");
            } else {
                console.log("Microphone permission denied");
            }
        } else {
            // iOS 위치 권한 요청
            const locationResult = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
            if (locationResult === 'granted') {
                console.log("Location permission granted");
            } else {
                console.log("Location permission denied");
            }

            // iOS 마이크 권한 요청
            const microphoneResult = await request(PERMISSIONS.IOS.MICROPHONE);
            if (microphoneResult === 'granted') {
                console.log("Microphone permission granted");
            } else {
                console.log("Microphone permission denied");
            }
        }
    };


    const getFcmToken = async () => {
        const fcmToken = await messaging().getToken();
        console.log('FCM Token:', fcmToken);
    };

    const onMessageReceived = async (message) => {
        const channelId = await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
            importance: AndroidImportance.HIGH,
        });

        await notifee.displayNotification({
            title: message.notification.title,
            body: message.notification.body,
            android: { channelId, smallIcon: '@mipmap/ic_launcher' },
        });
    };

    const formatTime = (timeString) => {
        const time = new Date(`1970-01-01T${timeString}`);
        const hours = time.getHours();
        const minutes = time.getMinutes();
        const period = hours >= 12 ? '오후' : '오전';
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${period} ${formattedHours}:${formattedMinutes}`;
    };

    const handleTaskPress = (task) => {
        setSelectedTask(task);
        setTaskActionModalVisible(true);
    };

    const deleteTask = async (taskId) => {
        try {
            const jwtToken = await AsyncStorage.getItem('jwtToken');
            await axios.delete(`${BASE_URL}/task`, {
                headers: { Authorization: `Bearer ${jwtToken}` },
                data: { id: taskId },
            });
            Alert.alert("삭제 완료", "일정이 성공적으로 삭제되었습니다.");
            fetchTasks();
            setTaskActionModalVisible(false);
        } catch (error) {
            console.error('Error deleting task:', error);
            Alert.alert("삭제 실패", "일정을 삭제하는 중 문제가 발생했습니다.");
        }
    };

    const DayofWeek = ['일', '월', '화', '수', '목', '금', '토'];

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <CustomText style={styles.title}>오늘의 일정</CustomText>
            <CustomText style={styles.date}>
                {new Date().getMonth() + 1}월 {new Date().getDate()}일 ({DayofWeek[new Date().getDay()]})
            </CustomText>

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

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('FriendAddScheduleScreen')}>
                <Feather name="plus-circle" size={20} color="#fff" />
                <CustomText style={styles.buttonText}>일정 추가하기</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SelectPainAreaScreen' , {
                  latitude: location ? location.coords.latitude : 0,
                  longitude: location ? location.coords.longitude : 0
            })}>
                <Feather name="map" size={20} color="#fff" style={styles.icon} />
                <CustomText style={styles.buttonText}>주변 병원 데모 버튼</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('VoiceSearchScreen' , {
                  latitude: location ? location.coords.latitude : 0,
                  longitude: location ? location.coords.longitude : 0
            })}>
                <Feather name="mic" size={20} color="#fff" style={styles.icon} />
                <CustomText style={styles.buttonText}>음성 병원 찾기</CustomText>
            </TouchableOpacity>

            {/* 모달 */}
            <Modal visible={taskActionModalVisible} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <CustomText style={styles.modalTitle}>{selectedTask?.title}</CustomText>
                        <TouchableOpacity style={styles.actionButton} onPress={() => {
                            const event = { taskId: selectedTask.id };
                            setTaskActionModalVisible(false);
                            navigation.navigate('EditScheduleScreen', { event });
                        }}>
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
    button: {
        backgroundColor: '#6495ED',
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
    },
    buttonText: {
        fontSize: 20,
        color: '#FFFFFF',
        marginLeft: 10,
    },
    map: {
        width: '100%',
        height: 300,
        marginTop: 20,
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
});

export default FriendScheduleScreen;