import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';
import { request, PERMISSIONS } from 'react-native-permissions';
import CustomText from './CustomTextProps';

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

const ScheduleScreen = ({ navigation }) => {
    const [location, setLocation] = useState(null);
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        requestUserPermission();
        getFcmToken();
        getCurrentLocation();
        const unsubscribe = messaging().onMessage(async remoteMessage => onMessageReceived(remoteMessage));
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log('Message handled in the background!', remoteMessage);
            onMessageReceived(remoteMessage);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const requestUserPermission = async () => {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Authorization status:', authStatus);
        }

        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "Location Permission",
                    message: "This app needs access to your location.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Location permission granted");
            } else {
                console.log("Location permission denied");
            }
        } else {
            const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
            if (result === 'granted') {
                console.log("Location permission granted");
            } else {
                console.log("Location permission denied");
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
    const DayofWeek = ['일','월','화','수','목','금','토'];
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <CustomText style={styles.title}>오늘의 일정</CustomText>
            <CustomText style={styles.date}>{new Date().getMonth()+1}월 {new Date().getDate()}일 ({DayofWeek[new Date().getDay()]})</CustomText>

            <View style={styles.event}>
                <CustomText style={styles.time}>12:00</CustomText>
                <CustomText style={styles.description}>점심약 복용</CustomText>
            </View>

            <View style={styles.event}>
                <CustomText style={styles.time}>14:00</CustomText>
                <CustomText style={styles.description}>정형외과 진료</CustomText>
            </View>

            <View style={styles.event}>
                <CustomText style={styles.time}>16:00</CustomText>
                <CustomText style={styles.description}>손녀딸 집에 방문</CustomText>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddScheduleScreen')}>
                <CustomText style={styles.buttonText}>일정 추가하기</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={sendPushMessage}>
                <CustomText style={styles.buttonText}>알림 보내기</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
                <CustomText style={styles.buttonText}>위치 조회하기</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('RecommendScreen', {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            })}>
                <CustomText style={styles.buttonText}>주변 병원 추천</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ImgUpload')}>
                <CustomText style={styles.buttonText}>약봉투 업로드</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddFriendScreen')}>
                <CustomText style={styles.buttonText}>친구 추가하기</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('FriendsRequestListScreen')}>
                <CustomText style={styles.buttonText}>친구 요청 리스트(프렌즈 기능)</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CaregiverFriendsListScreen')}>
                <CustomText style={styles.buttonText}>프렌즈 조회(보호자 기능)</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('FriendCaregiverScreen')}>
                <CustomText style={styles.buttonText}>보호자 조회(프렌즈 기능)</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('KakaoLoginScreen')}>
                <CustomText style={styles.buttonText}>카카오 로그인</CustomText>
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
        fontFamily: 'Pretendard-Bold',
        color: '#000000',
    },
    description: {
        fontSize: 22,
        fontFamily: 'Pretendard-Bold',
        color: '#000000',
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
    },
    buttonText: {
        fontFamily: 'Pretendard-SemiBold',
        fontSize: 20,
        color: '#FFFFFF',
    },
    map: {
        width: '100%',
        height: 300,
        marginTop: 20,
    },
});

export default ScheduleScreen;
