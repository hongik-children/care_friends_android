import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, PermissionsAndroid, Platform, ActivityIndicator } from 'react-native';
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
    const [tasks, setTasks] = useState([]); // 일정 목록을 저장할 상태 추가
    const [loading, setLoading] = useState(true); // 로딩 상태 추가

    useEffect(() => {
        requestUserPermission();
        getFcmToken();
        fetchTasks(); // 일정 데이터를 가져오는 함수 호출

        const unsubscribe = messaging().onMessage(async remoteMessage => onMessageReceived(remoteMessage));
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log('Message handled in the background!', remoteMessage);
            onMessageReceived(remoteMessage);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    // useFocusEffect로 화면이 다시 포커스를 받을 때마다 fetchTasks 실행
    useFocusEffect(
        useCallback(() => {
            fetchTasks();  // 일정 데이터를 다시 불러오는 함수 호출
        }, [])
    );

    // 일정 데이터를 서버로부터 가져오는 함수
    const fetchTasks = async () => {
        try {
            const jwtToken = await AsyncStorage.getItem('jwtToken'); // JWT 토큰 가져오기

            // 오늘 날짜를 'YYYY-MM-DD' 형식으로 구함
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); // 월을 두 자리로 맞춤 (예: '01', '11')
            const day = String(today.getDate()).padStart(2, '0'); // 일을 두 자리로 맞춤 (예: '05', '22')
            const todayString = `${year}-${month}-${day}`; // 'YYYY-MM-DD' 형식으로 만듦

            // 서버로 오늘 날짜를 쿼리 파라미터로 전달하여 요청
            const response = await axios.get(`${BASE_URL}/task/myTask?date=${todayString}`, { // 오늘 날짜 추가
                headers: {
                    Authorization: `Bearer ${jwtToken}` // JWT 토큰을 Authorization 헤더에 포함
                }
            });

            setTasks(response.data); // 서버에서 받은 일정 데이터를 상태로 저장
        } catch (error) {
            console.error('일정 데이터를 가져오는 중 오류 발생:', error);
        } finally {
            setLoading(false); // 로딩 완료
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
        const fcmTokenInfo = await messaging().getToken();
        console.log('FCM Token:', fcmTokenInfo);
    };

    const onMessageReceived = async (message) => {
        console.log("title :: ", message.notification.title);
        console.log("body :: ", message.notification.body);

        const channelId = await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
            importance: AndroidImportance.HIGH,
        });

        console.log('Channel created with ID:', channelId);

        await notifee.displayNotification({
            title: message.notification.title,
            body: message.notification.body,
            android: {
                channelId,
                smallIcon: '@mipmap/ic_launcher',
            },
        }).then(() => {
            console.log('Notification displayed successfully');
        }).catch(error => {
            console.error('Error displaying notification:', error);
        });
    };

    const sendPushMessage = async () => {
        navigation.navigate('NotificationScreen');
    };

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                setLocation(position);
                setShowMap(true);
            },
            (error) => {
                console.error(error);
            },
            { enableHighAccuracy: false, timeout: 15000 }
        );
    };

  // 시간 형식 변환 함수 (오전/오후 표시)
  const formatTime = (timeString) => {
    const time = new Date(`1970-01-01T${timeString}`);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const period = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${period} ${formattedHours}:${formattedMinutes}`;
  };

    const DayofWeek = ['일','월','화','수','목','금','토'];

    // 로딩 중일 때 로딩 화면 표시
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

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('FriendAddScheduleScreen')}>
                <Feather name="plus-circle" size={20} color="#fff" style={styles.icon} />
                <CustomText style={styles.buttonText}>일정 추가하기</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={sendPushMessage}>
                <Feather name="bell" size={20} color="#fff" style={styles.icon} />
                <CustomText style={styles.buttonText}>알림 보내기</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
                <Feather name="map-pin" size={20} color="#fff" style={styles.icon} />
                <CustomText style={styles.buttonText}>위치 조회하기</CustomText>
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
                        title="Your Location"
                    />
                </MapView>
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
    event: {
        backgroundColor: '#FFF8DE',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
        flexDirection: 'row', // 아이콘과 텍스트를 나란히 배치
    },
    buttonText: {
        fontFamily: 'Pretendard-SemiBold',
        fontSize: 20,
        color: '#FFFFFF',
        marginLeft: 10, // 아이콘과 텍스트 사이에 간격 추가
    },
    icon: {
        marginRight: 10, // 아이콘과 텍스트 사이 간격
    },
    map: {
        width: '100%',
        height: 300,
        marginTop: 20,
    },
});

export default FriendScheduleScreen;




//import React, { useEffect, useState } from 'react';
//import { View, Text, TouchableOpacity, StyleSheet, ScrollView, PermissionsAndroid, Platform, ActivityIndicator } from 'react-native';
//import messaging from '@react-native-firebase/messaging';
//import notifee, { AndroidImportance } from '@notifee/react-native';
//import Geolocation from '@react-native-community/geolocation';
//import MapView, { Marker } from 'react-native-maps';
//import { request, PERMISSIONS } from 'react-native-permissions';
//import AsyncStorage from '@react-native-async-storage/async-storage'; // 추가
//import axios from 'axios'; // 추가
//import CustomText from '../CustomTextProps';
//import Feather from 'react-native-vector-icons/Feather'; // 아이콘 추가
//import { BASE_URL } from '@env';
//
//notifee.onBackgroundEvent(async ({ type, detail }) => {
//    const { notification, pressAction } = detail;
//    if (type === notifee.EventType.PRESS) {
//        console.log('Notification pressed:', notification);
//    }
//    if (type === notifee.EventType.ACTION_PRESS) {
//        console.log('Action pressed:', pressAction);
//    }
//    await notifee.cancelNotification(notification.id);
//});
//
//const FriendScheduleScreen = ({ navigation }) => {
//    const [location, setLocation] = useState(null);
//    const [showMap, setShowMap] = useState(false);
//    const [tasks, setTasks] = useState([]); // 일정 목록을 저장할 상태 추가
//    const [loading, setLoading] = useState(true); // 로딩 상태 추가
//
//    useEffect(() => {
//        requestUserPermission();
//        getFcmToken();
//        fetchTasks(); // 일정 데이터를 가져오는 함수 호출
//
//        const unsubscribe = messaging().onMessage(async remoteMessage => onMessageReceived(remoteMessage));
//        messaging().setBackgroundMessageHandler(async remoteMessage => {
//            console.log('Message handled in the background!', remoteMessage);
//            onMessageReceived(remoteMessage);
//        });
//
//        return () => {
//            unsubscribe();
//        };
//    }, []);
//
//    // 일정 데이터를 서버로부터 가져오는 함수
//    const fetchTasks = async () => {
//        try {
//            const jwtToken = await AsyncStorage.getItem('jwtToken'); // JWT 토큰 가져오기
//            const response = await axios.get(`${BASE_URL}/task/myTask`, { // API URL 변경 필요
//                headers: {
//                    Authorization: `Bearer ${jwtToken}` // JWT 토큰을 Authorization 헤더에 포함
//                }
//            });
//            setTasks(response.data); // 서버에서 받은 일정 데이터를 상태로 저장
//        } catch (error) {
//            console.error('일정 데이터를 가져오는 중 오류 발생:', error);
//        } finally {
//            setLoading(false); // 로딩 완료
//        }
//    };
//
//    const requestUserPermission = async () => {
//        // 푸시 알림 권한 요청 (Firebase)
//        const authStatus = await messaging().requestPermission();
//        const enabled =
//            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
//
//        if (enabled) {
//            console.log('Authorization status:', authStatus);
//        }
//
//        // 위치 및 마이크 권한 요청 (Android, iOS)
//        if (Platform.OS === 'android') {
//            // 위치 권한 요청
//            const locationGranted = await PermissionsAndroid.request(
//                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//                {
//                    title: "Location Permission",
//                    message: "This app needs access to your location.",
//                    buttonNeutral: "Ask Me Later",
//                    buttonNegative: "Cancel",
//                    buttonPositive: "OK"
//                }
//            );
//
//            if (locationGranted === PermissionsAndroid.RESULTS.GRANTED) {
//                console.log("Location permission granted");
//            } else {
//                console.log("Location permission denied");
//            }
//
//            // 마이크 권한 요청
//            const microphoneGranted = await PermissionsAndroid.request(
//                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//                {
//                    title: "Microphone Permission",
//                    message: "This app needs access to your microphone for voice recognition.",
//                    buttonNeutral: "Ask Me Later",
//                    buttonNegative: "Cancel",
//                    buttonPositive: "OK"
//                }
//            );
//
//            if (microphoneGranted === PermissionsAndroid.RESULTS.GRANTED) {
//                console.log("Microphone permission granted");
//            } else {
//                console.log("Microphone permission denied");
//            }
//        } else {
//            // iOS 위치 권한 요청
//            const locationResult = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
//            if (locationResult === 'granted') {
//                console.log("Location permission granted");
//            } else {
//                console.log("Location permission denied");
//            }
//
//            // iOS 마이크 권한 요청
//            const microphoneResult = await request(PERMISSIONS.IOS.MICROPHONE);
//            if (microphoneResult === 'granted') {
//                console.log("Microphone permission granted");
//            } else {
//                console.log("Microphone permission denied");
//            }
//        }
//    };
//
//    const getFcmToken = async () => {
//        const fcmTokenInfo = await messaging().getToken();
//        console.log('FCM Token:', fcmTokenInfo);
//    };
//
//    const onMessageReceived = async (message) => {
//        console.log("title :: ", message.notification.title);
//        console.log("body :: ", message.notification.body);
//
//        const channelId = await notifee.createChannel({
//            id: 'default',
//            name: 'Default Channel',
//            importance: AndroidImportance.HIGH,
//        });
//
//        console.log('Channel created with ID:', channelId);
//
//        await notifee.displayNotification({
//            title: message.notification.title,
//            body: message.notification.body,
//            android: {
//                channelId,
//                smallIcon: '@mipmap/ic_launcher',
//            },
//        }).then(() => {
//            console.log('Notification displayed successfully');
//        }).catch(error => {
//            console.error('Error displaying notification:', error);
//        });
//    };
//
//    const sendPushMessage = async () => {
//        navigation.navigate('NotificationScreen');
//    };
//
//    const getCurrentLocation = () => {
//        Geolocation.getCurrentPosition(
//            (position) => {
//                setLocation(position);
//                setShowMap(true);
//            },
//            (error) => {
//                console.error(error);
//            },
//            { enableHighAccuracy: false, timeout: 15000 }
//        );
//    };
//
//    const DayofWeek = ['일','월','화','수','목','금','토'];
//
//    // 로딩 중일 때 로딩 화면 표시
//    if (loading) {
//        return (
//            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//                <ActivityIndicator size="large" color="#0000ff" />
//            </View>
//        );
//    }
//
//    return (
//        <ScrollView contentContainerStyle={styles.container}>
//            <CustomText style={styles.title}>오늘의 일정(프렌드 화면!!)</CustomText>
//            <CustomText style={styles.date}>{new Date().getMonth()+1}월 {new Date().getDate()}일 ({DayofWeek[new Date().getDay()]})</CustomText>
//
//            {/* 일정 데이터를 표시하는 부분 */}
//            {tasks.length > 0 ? (
//                tasks.map((task) => (
//                    <View key={task.id} style={styles.event}>
//                        <CustomText style={styles.time}>{task.startTime}</CustomText>
//                        <CustomText style={styles.description}>{task.title}</CustomText>
//                    </View>
//                ))
//            ) : (
//                <CustomText style={{ fontSize: 18, color: 'gray' }}>일정이 없습니다.</CustomText>
//            )}
//
//            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('FriendAddScheduleScreen')}>
//                <Feather name="plus-circle" size={20} color="#fff" style={styles.icon} />
//                <CustomText style={styles.buttonText}>일정 추가하기</CustomText>
//            </TouchableOpacity>
//
//            <TouchableOpacity style={styles.button} onPress={sendPushMessage}>
//                <Feather name="bell" size={20} color="#fff" style={styles.icon} />
//                <CustomText style={styles.buttonText}>알림 보내기</CustomText>
//            </TouchableOpacity>
//
//            <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
//                <Feather name="map-pin" size={20} color="#fff" style={styles.icon} />
//                <CustomText style={styles.buttonText}>위치 조회하기</CustomText>
//            </TouchableOpacity>
//
//            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SelectPainAreaScreen' , {
//                  latitude: location ? location.coords.latitude : 0,
//                  longitude: location ? location.coords.longitude : 0
//            })}>
//                <Feather name="map" size={20} color="#fff" style={styles.icon} />
//                <CustomText style={styles.buttonText}>주변 병원 데모 버튼</CustomText>
//            </TouchableOpacity>
//
//            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('VoiceSearchScreen' , {
//                  latitude: location ? location.coords.latitude : 0,
//                  longitude: location ? location.coords.longitude : 0
//            })}>
//                <Feather name="mic" size={20} color="#fff" style={styles.icon} />
//                <CustomText style={styles.buttonText}>음성 병원 찾기</CustomText>
//            </TouchableOpacity>
//
//            {showMap && location && (
//                <MapView
//                    style={styles.map}
//                    initialRegion={{
//                        latitude: location.coords.latitude,
//                        longitude: location.coords.longitude,
//                        latitudeDelta: 0.0922,
//                        longitudeDelta: 0.0421,
//                    }}
//                >
//                    <Marker
//                        coordinate={{
//                            latitude: location.coords.latitude,
//                            longitude: location.coords.longitude,
//                        }}
//                        title="Your Location"
//                    />
//                </MapView>
//            )}
//        </ScrollView>
//    );
//};
//
//const styles = StyleSheet.create({
//    container: {
//        flexGrow: 1,
//        alignItems: 'center',
//        padding: 20,
//        backgroundColor: '#FFFFFF',
//    },
//    title: {
//        fontSize: 28,
//        fontFamily: 'Pretendard-ExtraBold',
//        marginVertical: 10,
//        color: '#000000',
//    },
//    date: {
//        fontSize: 24,
//        marginBottom: 20,
//        color: '#333333',
//    },
//    event: {
//        backgroundColor: '#FFF8DE',
//        width: '100%',
//        padding: 15,
//        marginVertical: 10,
//        borderRadius: 5,
//        flexDirection: 'row',
//        justifyContent: 'space-between',
//        borderWidth: 1,
//        borderColor: '#CCCCCC',
//    },
//    time: {
//        fontSize: 22,
//        fontFamily: 'Pretendard-Bold',
//        color: '#000000',
//    },
//    description: {
//        fontSize: 22,
//        fontFamily: 'Pretendard-Bold',
//        color: '#000000',
//    },
//    button: {
//        backgroundColor: '#6495ED',
//        padding: 15,
//        borderRadius: 10,
//        marginVertical: 10,
//        width: '100%',
//        alignItems: 'center',
//        shadowColor: '#000',
//        shadowOffset: { width: 0, height: 2 },
//        shadowOpacity: 0.8,
//        shadowRadius: 2,
//        elevation: 5,
//        flexDirection: 'row', // 아이콘과 텍스트를 나란히 배치
//    },
//    buttonText: {
//        fontFamily: 'Pretendard-SemiBold',
//        fontSize: 20,
//        color: '#FFFFFF',
//        marginLeft: 10, // 아이콘과 텍스트 사이에 간격 추가
//    },
//    icon: {
//        marginRight: 10, // 아이콘과 텍스트 사이 간격
//    },
//    map: {
//        width: '100%',
//        height: 300,
//        marginTop: 20,
//    },
//});
//
//export default FriendScheduleScreen;




//import React, { useEffect, useState } from 'react';
//import { View, Text, TouchableOpacity, StyleSheet, ScrollView, PermissionsAndroid, Platform, ActivityIndicator } from 'react-native';
//import messaging from '@react-native-firebase/messaging';
//import notifee, { AndroidImportance } from '@notifee/react-native';
//import Geolocation from '@react-native-community/geolocation';
//import MapView, { Marker } from 'react-native-maps';
//import { request, PERMISSIONS } from 'react-native-permissions';
//import AsyncStorage from '@react-native-async-storage/async-storage'; // 추가
//import axios from 'axios'; // 추가
//import CustomText from '../CustomTextProps';
//import { BASE_URL } from '@env';
//
//notifee.onBackgroundEvent(async ({ type, detail }) => {
//    const { notification, pressAction } = detail;
//    if (type === notifee.EventType.PRESS) {
//        console.log('Notification pressed:', notification);
//    }
//    if (type === notifee.EventType.ACTION_PRESS) {
//        console.log('Action pressed:', pressAction);
//    }
//    await notifee.cancelNotification(notification.id);
//});
//
//const FriendScheduleScreen = ({ navigation }) => {
//    const [location, setLocation] = useState(null);
//    const [showMap, setShowMap] = useState(false);
//    const [tasks, setTasks] = useState([]); // 일정 목록을 저장할 상태 추가
//    const [loading, setLoading] = useState(true); // 로딩 상태 추가
//
//    useEffect(() => {
//        requestUserPermission();
//        getFcmToken();
//        fetchTasks(); // 일정 데이터를 가져오는 함수 호출
//
//        const unsubscribe = messaging().onMessage(async remoteMessage => onMessageReceived(remoteMessage));
//        messaging().setBackgroundMessageHandler(async remoteMessage => {
//            console.log('Message handled in the background!', remoteMessage);
//            onMessageReceived(remoteMessage);
//        });
//
//        return () => {
//            unsubscribe();
//        };
//    }, []);
//
//    // 일정 데이터를 서버로부터 가져오는 함수
//    const fetchTasks = async () => {
//        try {
//            const jwtToken = await AsyncStorage.getItem('jwtToken'); // JWT 토큰 가져오기
//            const response = await axios.get(`${BASE_URL}/task/myTask`, { // API URL 변경 필요
//                headers: {
//                    Authorization: `Bearer ${jwtToken}` // JWT 토큰을 Authorization 헤더에 포함
//                }
//            });
//            setTasks(response.data); // 서버에서 받은 일정 데이터를 상태로 저장
//        } catch (error) {
//            console.error('일정 데이터를 가져오는 중 오류 발생:', error);
//        } finally {
//            setLoading(false); // 로딩 완료
//        }
//    };
//
//    const requestUserPermission = async () => {
//        // 푸시 알림 권한 요청 (Firebase)
//        const authStatus = await messaging().requestPermission();
//        const enabled =
//            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
//
//        if (enabled) {
//            console.log('Authorization status:', authStatus);
//        }
//
//        // 위치 및 마이크 권한 요청 (Android, iOS)
//        if (Platform.OS === 'android') {
//            // 위치 권한 요청
//            const locationGranted = await PermissionsAndroid.request(
//                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//                {
//                    title: "Location Permission",
//                    message: "This app needs access to your location.",
//                    buttonNeutral: "Ask Me Later",
//                    buttonNegative: "Cancel",
//                    buttonPositive: "OK"
//                }
//            );
//
//            if (locationGranted === PermissionsAndroid.RESULTS.GRANTED) {
//                console.log("Location permission granted");
//            } else {
//                console.log("Location permission denied");
//            }
//
//            // 마이크 권한 요청
//            const microphoneGranted = await PermissionsAndroid.request(
//                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//                {
//                    title: "Microphone Permission",
//                    message: "This app needs access to your microphone for voice recognition.",
//                    buttonNeutral: "Ask Me Later",
//                    buttonNegative: "Cancel",
//                    buttonPositive: "OK"
//                }
//            );
//
//            if (microphoneGranted === PermissionsAndroid.RESULTS.GRANTED) {
//                console.log("Microphone permission granted");
//            } else {
//                console.log("Microphone permission denied");
//            }
//        } else {
//            // iOS 위치 권한 요청
//            const locationResult = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
//            if (locationResult === 'granted') {
//                console.log("Location permission granted");
//            } else {
//                console.log("Location permission denied");
//            }
//
//            // iOS 마이크 권한 요청
//            const microphoneResult = await request(PERMISSIONS.IOS.MICROPHONE);
//            if (microphoneResult === 'granted') {
//                console.log("Microphone permission granted");
//            } else {
//                console.log("Microphone permission denied");
//            }
//        }
//    };
//
//    const getFcmToken = async () => {
//        const fcmTokenInfo = await messaging().getToken();
//        console.log('FCM Token:', fcmTokenInfo);
//    };
//
//    const onMessageReceived = async (message) => {
//        console.log("title :: ", message.notification.title);
//        console.log("body :: ", message.notification.body);
//
//        const channelId = await notifee.createChannel({
//            id: 'default',
//            name: 'Default Channel',
//            importance: AndroidImportance.HIGH,
//        });
//
//        console.log('Channel created with ID:', channelId);
//
//        await notifee.displayNotification({
//            title: message.notification.title,
//            body: message.notification.body,
//            android: {
//                channelId,
//                smallIcon: '@mipmap/ic_launcher',
//            },
//        }).then(() => {
//            console.log('Notification displayed successfully');
//        }).catch(error => {
//            console.error('Error displaying notification:', error);
//        });
//    };
//
//    const sendPushMessage = async () => {
//        navigation.navigate('NotificationScreen');
//    };
//
//    const getCurrentLocation = () => {
//        Geolocation.getCurrentPosition(
//            (position) => {
//                setLocation(position);
//                setShowMap(true);
//            },
//            (error) => {
//                console.error(error);
//            },
//            { enableHighAccuracy: false, timeout: 15000 }
//        );
//    };
//
//    const DayofWeek = ['일','월','화','수','목','금','토'];
//
//    // 로딩 중일 때 로딩 화면 표시
//    if (loading) {
//        return (
//            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//                <ActivityIndicator size="large" color="#0000ff" />
//            </View>
//        );
//    }
//
//    return (
//        <ScrollView contentContainerStyle={styles.container}>
//            <CustomText style={styles.title}>오늘의 일정(프렌드 화면!!)</CustomText>
//            <CustomText style={styles.date}>{new Date().getMonth()+1}월 {new Date().getDate()}일 ({DayofWeek[new Date().getDay()]})</CustomText>
//
//            {/* 일정 데이터를 표시하는 부분 */}
//            {tasks.length > 0 ? (
//                tasks.map((task) => (
//                    <View key={task.id} style={styles.event}>
//                        <CustomText style={styles.time}>{task.startTime}</CustomText>
//                        <CustomText style={styles.description}>{task.title}</CustomText>
//                    </View>
//                ))
//            ) : (
//                <CustomText style={{ fontSize: 18, color: 'gray' }}>일정이 없습니다.</CustomText>
//            )}
//
//            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('FriendAddScheduleScreen')}>
//                <CustomText style={styles.buttonText}>일정 추가하기</CustomText>
//            </TouchableOpacity>
//
//            <TouchableOpacity style={styles.button} onPress={sendPushMessage}>
//                <CustomText style={styles.buttonText}>알림 보내기</CustomText>
//            </TouchableOpacity>
//
//            <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
//                <CustomText style={styles.buttonText}>위치 조회하기</CustomText>
//            </TouchableOpacity>
//
//            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SelectPainAreaScreen' , {
//                  latitude: location ? location.coords.latitude : 0,
//                  longitude: location ? location.coords.longitude : 0
//            })}>
//                <CustomText style={styles.buttonText}>주변 병원 데모 버튼</CustomText>
//            </TouchableOpacity>
//
//            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('VoiceSearchScreen' , {
//                  latitude: location ? location.coords.latitude : 0,
//                  longitude: location ? location.coords.longitude : 0
//            })}>
//                <CustomText style={styles.buttonText}>음성 병원 찾기</CustomText>
//            </TouchableOpacity>
//
//            {showMap && location && (
//                <MapView
//                    style={styles.map}
//                    initialRegion={{
//                        latitude: location.coords.latitude,
//                        longitude: location.coords.longitude,
//                        latitudeDelta: 0.0922,
//                        longitudeDelta: 0.0421,
//                    }}
//                >
//                    <Marker
//                        coordinate={{
//                            latitude: location.coords.latitude,
//                            longitude: location.coords.longitude,
//                        }}
//                        title="Your Location"
//                    />
//                </MapView>
//            )}
//        </ScrollView>
//    );
//};
//
//const styles = StyleSheet.create({
//    container: {
//        flexGrow: 1,
//        alignItems: 'center',
//        padding: 20,
//        backgroundColor: '#FFFFFF',
//    },
//    title: {
//        fontSize: 28,
//        fontFamily: 'Pretendard-ExtraBold',
//        marginVertical: 10,
//        color: '#000000',
//    },
//    date: {
//        fontSize: 24,
//        marginBottom: 20,
//        color: '#333333',
//    },
//    event: {
//        backgroundColor: '#FFF8DE',
//        width: '100%',
//        padding: 15,
//        marginVertical: 10,
//        borderRadius: 5,
//        flexDirection: 'row',
//        justifyContent: 'space-between',
//        borderWidth: 1,
//        borderColor: '#CCCCCC',
//    },
//    time: {
//        fontSize: 22,
//        fontFamily: 'Pretendard-Bold',
//        color: '#000000',
//    },
//    description: {
//        fontSize: 22,
//        fontFamily: 'Pretendard-Bold',
//        color: '#000000',
//    },
//    button: {
//        backgroundColor: '#6495ED',
//        padding: 15,
//        borderRadius: 10,
//        marginVertical: 10,
//        width: '100%',
//        alignItems: 'center',
//        shadowColor: '#000',
//        shadowOffset: { width: 0, height: 2 },
//        shadowOpacity: 0.8,
//        shadowRadius: 2,
//        elevation: 5,
//    },
//    buttonText: {
//        fontFamily: 'Pretendard-SemiBold',
//        fontSize: 20,
//        color: '#FFFFFF',
//    },
//    map: {
//        width: '100%',
//        height: 300,
//        marginTop: 20,
//    },
//});
//
//export default FriendScheduleScreen;



//import React, { useEffect, useState } from 'react';
//import { View, Text, TouchableOpacity, StyleSheet, ScrollView, PermissionsAndroid, Platform } from 'react-native';
//import messaging from '@react-native-firebase/messaging';
//import notifee, { AndroidImportance } from '@notifee/react-native';
//import Geolocation from '@react-native-community/geolocation';
//import MapView, { Marker } from 'react-native-maps';
//import { request, PERMISSIONS } from 'react-native-permissions';
//import CustomText from '../CustomTextProps';
//
//notifee.onBackgroundEvent(async ({ type, detail }) => {
//    const { notification, pressAction } = detail;
//    if (type === notifee.EventType.PRESS) {
//        console.log('Notification pressed:', notification);
//    }
//    if (type === notifee.EventType.ACTION_PRESS) {
//        console.log('Action pressed:', pressAction);
//    }
//    await notifee.cancelNotification(notification.id);
//});
//
//const FriendScheduleScreen = ({ navigation }) => {
//    const [location, setLocation] = useState(null);
//    const [showMap, setShowMap] = useState(false);
//
//    useEffect(() => {
//        requestUserPermission();
//        getFcmToken();
//        const unsubscribe = messaging().onMessage(async remoteMessage => onMessageReceived(remoteMessage));
//        messaging().setBackgroundMessageHandler(async remoteMessage => {
//            console.log('Message handled in the background!', remoteMessage);
//            onMessageReceived(remoteMessage);
//        });
//
//        return () => {
//            unsubscribe();
//        };
//    }, []);
//
//    const requestUserPermission = async () => {
//        // 푸시 알림 권한 요청 (Firebase)
//        const authStatus = await messaging().requestPermission();
//        const enabled =
//            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
//
//        if (enabled) {
//            console.log('Authorization status:', authStatus);
//        }
//
//        // 위치 및 마이크 권한 요청 (Android, iOS)
//        if (Platform.OS === 'android') {
//            // 위치 권한 요청
//            const locationGranted = await PermissionsAndroid.request(
//                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//                {
//                    title: "Location Permission",
//                    message: "This app needs access to your location.",
//                    buttonNeutral: "Ask Me Later",
//                    buttonNegative: "Cancel",
//                    buttonPositive: "OK"
//                }
//            );
//
//            if (locationGranted === PermissionsAndroid.RESULTS.GRANTED) {
//                console.log("Location permission granted");
//            } else {
//                console.log("Location permission denied");
//            }
//
//            // 마이크 권한 요청
//            const microphoneGranted = await PermissionsAndroid.request(
//                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//                {
//                    title: "Microphone Permission",
//                    message: "This app needs access to your microphone for voice recognition.",
//                    buttonNeutral: "Ask Me Later",
//                    buttonNegative: "Cancel",
//                    buttonPositive: "OK"
//                }
//            );
//
//            if (microphoneGranted === PermissionsAndroid.RESULTS.GRANTED) {
//                console.log("Microphone permission granted");
//            } else {
//                console.log("Microphone permission denied");
//            }
//        } else {
//            // iOS 위치 권한 요청
//            const locationResult = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
//            if (locationResult === 'granted') {
//                console.log("Location permission granted");
//            } else {
//                console.log("Location permission denied");
//            }
//
//            // iOS 마이크 권한 요청
//            const microphoneResult = await request(PERMISSIONS.IOS.MICROPHONE);
//            if (microphoneResult === 'granted') {
//                console.log("Microphone permission granted");
//            } else {
//                console.log("Microphone permission denied");
//            }
//        }
//    };
//
//    const getFcmToken = async () => {
//        const fcmTokenInfo = await messaging().getToken();
//        console.log('FCM Token:', fcmTokenInfo);
//    };
//
//    const onMessageReceived = async (message) => {
//        console.log("title :: ", message.notification.title);
//        console.log("body :: ", message.notification.body);
//
//        const channelId = await notifee.createChannel({
//            id: 'default',
//            name: 'Default Channel',
//            importance: AndroidImportance.HIGH,
//        });
//
//        console.log('Channel created with ID:', channelId);
//
//        await notifee.displayNotification({
//            title: message.notification.title,
//            body: message.notification.body,
//            android: {
//                channelId,
//                smallIcon: '@mipmap/ic_launcher',
//            },
//        }).then(() => {
//            console.log('Notification displayed successfully');
//        }).catch(error => {
//            console.error('Error displaying notification:', error);
//        });
//    };
//
//    const sendPushMessage = async () => {
//        navigation.navigate('NotificationScreen');
//    };
//
//    const getCurrentLocation = () => {
//        Geolocation.getCurrentPosition(
//            (position) => {
//                setLocation(position);
//                setShowMap(true);
//            },
//            (error) => {
//                console.error(error);
//            },
//            { enableHighAccuracy: false, timeout: 15000 }
//        );
//    };
//    const DayofWeek = ['일','월','화','수','목','금','토'];
//    return (
//        <ScrollView contentContainerStyle={styles.container}>
//            <CustomText style={styles.title}>오늘의 일정(프렌드 화면!!)</CustomText>
//            <CustomText style={styles.date}>{new Date().getMonth()+1}월 {new Date().getDate()}일 ({DayofWeek[new Date().getDay()]})</CustomText>
//
//            <View style={styles.event}>
//                <CustomText style={styles.time}>12:00</CustomText>
//                <CustomText style={styles.description}>점심약 복용</CustomText>
//            </View>
//
//            <View style={styles.event}>
//                <CustomText style={styles.time}>14:00</CustomText>
//                <CustomText style={styles.description}>정형외과 진료</CustomText>
//            </View>
//
//            <View style={styles.event}>
//                <CustomText style={styles.time}>16:00</CustomText>
//                <CustomText style={styles.description}>손녀딸 집에 방문</CustomText>
//            </View>
//
//            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('FriendAddScheduleScreen')}>
//                <CustomText style={styles.buttonText}>일정 추가하기</CustomText>
//            </TouchableOpacity>
//
//            <TouchableOpacity style={styles.button} onPress={sendPushMessage}>
//                <CustomText style={styles.buttonText}>알림 보내기</CustomText>
//            </TouchableOpacity>
//
//            <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
//                <CustomText style={styles.buttonText}>위치 조회하기</CustomText>
//            </TouchableOpacity>
//
//            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SelectPainAreaScreen' , {
//                  latitude: location.coords.latitude,
//                  longitude: location.coords.longitude
//            })}>
//                <CustomText style={styles.buttonText}>주변 병원 데모 버튼</CustomText>
//            </TouchableOpacity>
//
//            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('VoiceSearchScreen' , {
//                  latitude: location.coords.latitude,
//                  longitude: location.coords.longitude
//            })}>
//                <CustomText style={styles.buttonText}>음성 병원 찾기</CustomText>
//            </TouchableOpacity>
//
//            {showMap && location && (
//                <MapView
//                    style={styles.map}
//                    initialRegion={{
//                        latitude: location.coords.latitude,
//                        longitude: location.coords.longitude,
//                        latitudeDelta: 0.0922,
//                        longitudeDelta: 0.0421,
//                    }}
//                >
//                    <Marker
//                        coordinate={{
//                            latitude: location.coords.latitude,
//                            longitude: location.coords.longitude,
//                        }}
//                        title="Your Location"
//                    />
//                </MapView>
//            )}
//        </ScrollView>
//    );
//};
//
//const styles = StyleSheet.create({
//    container: {
//        flexGrow: 1,
//        alignItems: 'center',
//        padding: 20,
//        backgroundColor: '#FFFFFF',
//    },
//    title: {
//        fontSize: 28,
//        fontFamily: 'Pretendard-ExtraBold',
//        marginVertical: 10,
//        color: '#000000',
//    },
//    date: {
//        fontSize: 24,
//        marginBottom: 20,
//        color: '#333333',
//    },
//    event: {
//        backgroundColor: '#FFF8DE',
//        width: '100%',
//        padding: 15,
//        marginVertical: 10,
//        borderRadius: 5,
//        flexDirection: 'row',
//        justifyContent: 'space-between',
//        borderWidth: 1,
//        borderColor: '#CCCCCC',
//    },
//    time: {
//        fontSize: 22,
//        fontFamily: 'Pretendard-Bold',
//        color: '#000000',
//    },
//    description: {
//        fontSize: 22,
//        fontFamily: 'Pretendard-Bold',
//        color: '#000000',
//    },
//    button: {
//        backgroundColor: '#6495ED',
//        padding: 15,
//        borderRadius: 10,
//        marginVertical: 10,
//        width: '100%',
//        alignItems: 'center',
//        shadowColor: '#000',
//        shadowOffset: { width: 0, height: 2 },
//        shadowOpacity: 0.8,
//        shadowRadius: 2,
//        elevation: 5,
//    },
//    buttonText: {
//        fontFamily: 'Pretendard-SemiBold',
//        fontSize: 20,
//        color: '#FFFFFF',
//    },
//    map: {
//        width: '100%',
//        height: 300,
//        marginTop: 20,
//    },
//});
//
//export default FriendScheduleScreen;
