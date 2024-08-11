import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';
import { request, PERMISSIONS } from 'react-native-permissions';

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

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>오늘의 일정</Text>
            <Text style={styles.date}>3월 7일 목요일</Text>

            <View style={styles.event}>
                <Text style={styles.time}>12:00</Text>
                <Text style={styles.description}>점심약 복용</Text>
            </View>

            <View style={styles.event}>
                <Text style={styles.time}>14:00</Text>
                <Text style={styles.description}>정형외과 진료</Text>
            </View>

            <View style={styles.event}>
                <Text style={styles.time}>16:00</Text>
                <Text style={styles.description}>손녀딸 집에 방문</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddScheduleScreen')}>
                <Text style={styles.buttonText}>일정 추가하기</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={sendPushMessage}>
                <Text style={styles.buttonText}>알림 보내기</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
                <Text style={styles.buttonText}>위치 조회하기</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('imgUpload')}>
                <Text style={styles.buttonText}>약봉투 업로드</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddFriendScreen')}>
                <Text style={styles.buttonText}>친구 추가하기</Text>
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
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#000000',
    },
    date: {
        fontSize: 24,
        marginBottom: 20,
        color: '#333333',
    },
    event: {
        backgroundColor: '#FFF4CC',
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
        fontWeight: 'bold',
        color: '#000000',
    },
    description: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000000',
    },
    button: {
        backgroundColor: '#1E90FF',
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
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    map: {
        width: '100%',
        height: 300,
        marginTop: 20,
    },
});

export default ScheduleScreen;




//import React, { useEffect, useState } from 'react';
//import { View, Text, TouchableOpacity, StyleSheet, ScrollView, PermissionsAndroid, Platform } from 'react-native';
//import messaging from '@react-native-firebase/messaging';
//import notifee, { AndroidImportance } from '@notifee/react-native';
//import Geolocation from '@react-native-community/geolocation';
//import MapView, { Marker } from 'react-native-maps';
//import { request, PERMISSIONS } from 'react-native-permissions';
//
//
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
//const ScheduleScreen = ({ navigation }) => {
//    const [location, setLocation] = useState(null);
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
//        const authStatus = await messaging().requestPermission();
//        const enabled =
//            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
//
//        if (enabled) {
//            console.log('Authorization status:', authStatus);
//        }
//
//        if (Platform.OS === 'android') {
//            const granted = await PermissionsAndroid.request(
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
//            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//                console.log("Location permission granted");
//                getCurrentLocation();
//            } else {
//                console.log("Location permission denied");
//            }
//        } else {
//            const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
//            if (result === 'granted') {
//                console.log("Location permission granted");
//                getCurrentLocation();
//            } else {
//                console.log("Location permission denied");
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
//        console.log('sendPushMessage called');
//    };
//
//    const getCurrentLocation = () => {
//        Geolocation.getCurrentPosition(
//            (position) => {
//                setLocation(position);
//            },
//            (error) => {
//                console.error(error);
//            },
//            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
//        );
//    };
//
//    return (
//        <ScrollView contentContainerStyle={styles.container}>
//            <Text style={styles.title}>오늘의 일정</Text>
//            <Text style={styles.date}>3월 7일 목요일</Text>
//
//            <View style={styles.event}>
//                <Text style={styles.time}>12:00</Text>
//                <Text style={styles.description}>점심약 복용</Text>
//            </View>
//
//            <View style={styles.event}>
//                <Text style={styles.time}>14:00</Text>
//                <Text style={styles.description}>정형외과 진료</Text>
//            </View>
//
//            <View style={styles.event}>
//                <Text style={styles.time}>16:00</Text>
//                <Text style={styles.description}>손녀딸 집에 방문</Text>
//            </View>
//
//            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddScheduleScreen')}>
//              <Text style={styles.buttonText}>일정 추가하기</Text>
//            </TouchableOpacity>
//
//            <TouchableOpacity style={styles.button} onPress={sendPushMessage}>
//                <Text style={styles.buttonText}>알림 보내기</Text>
//            </TouchableOpacity>
//
//            <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
//                <Text style={styles.buttonText}>위치 조회하기</Text>
//            </TouchableOpacity>
//
//            <TouchableOpacity style={styles.button} onPress={() => { navigation.navigate("imgUpload") }}>
//                <Text style={styles.buttonText}>약봉투 업로드</Text>
//            </TouchableOpacity>
//
//            {location && (
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
//
//            <View style={styles.navigation}>
//                <TouchableOpacity style={styles.navButton} onPress={() => { }}>
//                    <Text style={styles.navButtonText}>홈</Text>
//                </TouchableOpacity>
//                <TouchableOpacity style={styles.navButton} onPress={() => { navigation.navigate("CalendarScreen") }}>
//                    <Text style={styles.navButtonText}>달력</Text>
//                </TouchableOpacity>
//                <TouchableOpacity style={styles.navButton} onPress={() => { }}>
//                    <Text style={styles.navButtonText}>내정보</Text>
//                </TouchableOpacity>
//            </View>
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
//        fontWeight: 'bold',
//        marginVertical: 10,
//        color: '#000000',
//    },
//    date: {
//        fontSize: 24,
//        marginBottom: 20,
//        color: '#333333',
//    },
//    event: {
//        backgroundColor: '#FFF4CC',
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
//        fontWeight: 'bold',
//        color: '#000000',
//    },
//    description: {
//        fontSize: 22,
//        fontWeight: 'bold',
//        color: '#000000',
//    },
//    button: {
//        backgroundColor: '#1E90FF',
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
//        fontSize: 20,
//        color: '#FFFFFF',
//        fontWeight: 'bold',
//    },
//    map: {
//        width: '100%',
//        height: 300,
//        marginTop: 20,
//    },
//    navigation: {
//        flexDirection: 'row',
//        justifyContent: 'space-between',
//        width: '100%',
//        marginTop: 20,
//    },
//    navButton: {
//        backgroundColor: '#CCCCCC',
//        padding: 15,
//        borderRadius: 10,
//        width: '30%',
//        alignItems: 'center',
//    },
//    navButtonText: {
//        fontSize: 18,
//        color: '#000000',
//    },
//});
//
//export default ScheduleScreen;






//// ScheduleScreen.js
//
//import React from 'react';
//import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
//
//const ScheduleScreen = ({ navigation }) => {
//  return (
//    <View style={styles.container}>
//      <Text style={styles.title}>오늘의 일정</Text>
//      <Text style={styles.date}>3월 7일 목요일</Text>
//
//      <View style={styles.event}>
//        <Text style={styles.time}>12:00</Text>
//        <Text style={styles.description}>점심약 복용</Text>
//      </View>
//
//      <View style={styles.event}>
//        <Text style={styles.time}>14:00</Text>
//        <Text style={styles.description}>정형외과 진료</Text>
//      </View>
//
//      <View style={styles.event}>
//        <Text style={styles.time}>16:00</Text>
//        <Text style={styles.description}>손녀딸 집에 방문</Text>
//      </View>
//
//      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddScheduleScreen')}>
//        <Text style={styles.buttonText}>일정 추가하기</Text>
//      </TouchableOpacity>
//
//      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('NotificationScreen')}>
//        <Text style={styles.buttonText}>알림 전송하기</Text>
//      </TouchableOpacity>
//
//      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('imgUpload')}>
//        <Text style={styles.buttonText}>위치 조회하기</Text>
//      </TouchableOpacity>
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: {
//    flexGrow: 1,
//    alignItems: 'center',
//    padding: 20,
//    backgroundColor: '#FFFFFF',
//  },
//  title: {
//    fontSize: 28,
//    fontWeight: 'bold',
//    marginVertical: 10,
//    color: '#000000',
//  },
//  date: {
//    fontSize: 24,
//    marginBottom: 20,
//    color: '#333333',
//  },
//  event: {
//    backgroundColor: '#FFF4CC',
//    width: '100%',
//    padding: 15,
//    marginVertical: 10,
//    borderRadius: 5,
//    flexDirection: 'row',
//    justifyContent: 'space-between',
//    borderWidth: 1,
//    borderColor: '#CCCCCC',
//  },
//  time: {
//    fontSize: 22,
//    fontWeight: 'bold',
//    color: '#000000',
//  },
//  description: {
//    fontSize: 22,
//    fontWeight: 'bold',
//    color: '#000000',
//  },
//  button: {
//    backgroundColor: '#1E90FF',
//    padding: 15,
//    borderRadius: 10,
//    marginVertical: 10,
//    width: '100%',
//    alignItems: 'center',
//    shadowColor: '#000',
//    shadowOffset: { width: 0, height: 2 },
//    shadowOpacity: 0.8,
//    shadowRadius: 2,
//    elevation: 5,
//  },
//  buttonText: {
//    fontSize: 20,
//    color: '#FFFFFF',
//    fontWeight: 'bold',
//  },
//});
//
//export default ScheduleScreen;


//import React, { useEffect, useState } from 'react';
//import { View, Text, TouchableOpacity, StyleSheet, ScrollView, PermissionsAndroid } from 'react-native';
//import messaging from '@react-native-firebase/messaging';
//import notifee, { AndroidImportance } from '@notifee/react-native';
//import Geolocation from '@react-native-community/geolocation';
//import MapView, { Marker } from 'react-native-maps';
//import { request, PERMISSIONS } from 'react-native-permissions';
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
//const ScheduleScreen = ({ navigation }) => {
//    const [location, setLocation] = useState(null);
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
//        const authStatus = await messaging().requestPermission();
//        const enabled =
//            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
//
//        if (enabled) {
//            console.log('Authorization status:', authStatus);
//        }
//
//        const granted = await PermissionsAndroid.request(
//            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//            {
//                title: "Notification Permission",
//                message: "This app needs access to show notifications",
//                buttonNeutral: "Ask Me Later",
//                buttonNegative: "Cancel",
//                buttonPositive: "OK"
//            }
//        );
//
//        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//            console.log("You can use the notifications");
//        } else {
//            console.log("Notification permission denied");
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
//    const getCurrentLocation = () => {
//        Geolocation.getCurrentPosition(
//            (position) => {
//                setLocation(position);
//            },
//            (error) => {
//                console.error(error);
//            },
//            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
//        );
//    };
//
//    return (
//        <ScrollView contentContainerStyle={styles.container}>
//            <Text style={styles.title}>오늘의 일정</Text>
//            <Text style={styles.date}>3월 7일 목요일</Text>
//
//            <View style={styles.event}>
//                <Text style={styles.time}>12:00</Text>
//                <Text style={styles.description}>점심약 복용</Text>
//            </View>
//
//            <View style={styles.event}>
//                <Text style={styles.time}>14:00</Text>
//                <Text style={styles.description}>정형외과 진료</Text>
//            </View>
//
//            <View style={styles.event}>
//                <Text style={styles.time}>16:00</Text>
//                <Text style={styles.description}>손녀딸 집에 방문</Text>
//            </View>
//
//            <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
//                <Text style={styles.buttonText}>위치 조회하기</Text>
//            </TouchableOpacity>
//
//            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('NotificationScreen')}>
//                <Text style={styles.buttonText}>알림 전송하기</Text>
//            </TouchableOpacity>
//
//            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('imgUpload')}>
//                <Text style={styles.buttonText}>약봉투 업로드</Text>
//            </TouchableOpacity>
//
//            {location && (
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
//        fontWeight: 'bold',
//        marginVertical: 10,
//        color: '#000000',
//    },
//    date: {
//        fontSize: 24,
//        marginBottom: 20,
//        color: '#333333',
//    },
//    event: {
//        backgroundColor: '#FFF4CC',
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
//        fontWeight: 'bold',
//        color: '#000000',
//    },
//    description: {
//        fontSize: 22,
//        fontWeight: 'bold',
//        color: '#000000',
//    },
//    button: {
//        backgroundColor: '#1E90FF',
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
//        fontSize: 20,
//        color: '#FFFFFF',
//        fontWeight: 'bold',
//    },
//    map: {
//        width: '100%',
//        height: 300,
//        marginTop: 20,
//    },
//});
//
//export default ScheduleScreen;








//import React, { useEffect, useState } from 'react';
//import { View, Text, TouchableOpacity, StyleSheet, ScrollView, PermissionsAndroid } from 'react-native';
//import messaging from '@react-native-firebase/messaging';
//import notifee, { AndroidImportance } from '@notifee/react-native';
//
//// 백그라운드 이벤트 핸들러 함수 정의
//notifee.onBackgroundEvent(async ({ type, detail }) => {
//    const { notification, pressAction } = detail;
//
//    console.log('Background event handler:', type, detail);
//
//    // 백그라운드 알림 처리 로직
//    if (type === notifee.EventType.PRESS) {
//        console.log('Notification pressed:', notification);
//    }
//
//    if (type === notifee.EventType.ACTION_PRESS) {
//        console.log('Action pressed:', pressAction);
//    }
//
//    // 알림 닫기
//    await notifee.cancelNotification(notification.id);
//});
//
//const ScheduleScreen = ({ navigation }) => {
//    const [fcmToken, setFcmToken] = useState("");
//
//    useEffect(() => {
//        requestUserPermission();
//        getFcmToken();
//        const unsubscribe = messaging().onMessage(async remoteMessage => onMessageReceived(remoteMessage));
//
//        // 백그라운드 메시지 수신 설정
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
//        const authStatus = await messaging().requestPermission();
//        const enabled =
//            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
//
//        if (enabled) {
//            console.log('Authorization status:', authStatus);
//        }
//
//        // 안드로이드 추가 권한 요청
//        const granted = await PermissionsAndroid.request(
//            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//            {
//                title: "Notification Permission",
//                message: "This app needs access to show notifications",
//                buttonNeutral: "Ask Me Later",
//                buttonNegative: "Cancel",
//                buttonPositive: "OK"
//            }
//        );
//
//        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//            console.log("You can use the notifications");
//        } else {
//            console.log("Notification permission denied");
//        }
//    };
//
//    const getFcmToken = async () => {
//        const fcmTokenInfo = await messaging().getToken();
//        setFcmToken(fcmTokenInfo);
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
//            importance: AndroidImportance.HIGH, // 알림 중요도 설정
//        });
//
//        console.log('Channel created with ID:', channelId);
//
//        await notifee.displayNotification({
//            title: message.notification.title,
//            body: message.notification.body,
//            android: {
//                channelId,
//                smallIcon: '@mipmap/ic_launcher', // 기본 아이콘 사용
//            },
//        }).then(() => {
//            console.log('Notification displayed successfully');
//        }).catch(error => {
//            console.error('Error displaying notification:', error);
//        });
//    };
//
//    const sendPushMessage = async () => {
//        const sendInfo = {
//            token: "fcDJAKcLQkqV5UH72Rc0g3:APA91bFBWpsExDLQfoeyuw_uz36A8QmDJ4KsphEyfn08AVgYxDjnneI_2r8gtOvlSdtEaGKMseWwF29GG-ksG1Vv8Mbl-bFb5gXXKKcRZYqBvrsF7oh0n2WaGyd09g40XBXSb7vuJ3dP",
//            title: "일정 확인해주세요",
//            body: "16:00 손녀딸 집에 방문"
//        };
//
//        await fetch('http://3.34.59.173:8080/api/v1/fcm/send', {
//            method: "POST",
//            headers: { 'Content-Type': 'application/json' },
//            body: JSON.stringify(sendInfo)
//        })
//            .then((response) => {
//                if (!response.ok) {
//                    return response.text().then(text => { throw new Error(text) });
//                }
//                console.log("Message sent successfully");
//            })
//            .catch((error) => {
//                console.log(`에러가 발생하였습니다 ${error}`);
//            });
//    };
//
//    return (
//        <ScrollView contentContainerStyle={styles.container}>
//            <Text style={styles.title}>오늘의 일정</Text>
//            <Text style={styles.date}>3월 7일 목요일</Text>
//
//            <View style={styles.event}>
//                <Text style={styles.time}>12:00</Text>
//                <Text style={styles.description}>점심약 복용</Text>
//            </View>
//
//            <View style={styles.event}>
//                <Text style={styles.time}>14:00</Text>
//                <Text style={styles.description}>정형외과 진료</Text>
//            </View>
//
//            <View style={styles.event}>
//                <Text style={styles.time}>16:00</Text>
//                <Text style={styles.description}>손녀딸 집에 방문</Text>
//            </View>
//
//            <TouchableOpacity style={styles.button} onPress={sendPushMessage}>
//                <Text style={styles.buttonText}>알림 보내기</Text>
//            </TouchableOpacity>
//
//            <TouchableOpacity style={styles.button} onPress={() => { navigation.navigate("imgUpload") }}>
//                <Text style={styles.buttonText}>약봉투 업로드</Text>
//            </TouchableOpacity>
//
//            <View style={styles.navigation}>
//                <TouchableOpacity style={styles.navButton} onPress={() => { }}>
//                    <Text style={styles.navButtonText}>홈</Text>
//                </TouchableOpacity>
//                <TouchableOpacity style={styles.navButton} onPress={() => { navigation.navigate("CalendarScreen") }}>
//                    <Text style={styles.navButtonText}>달력</Text>
//                </TouchableOpacity>
//                <TouchableOpacity style={styles.navButton} onPress={() => { }}>
//                    <Text style={styles.navButtonText}>내정보</Text>
//                </TouchableOpacity>
//            </View>
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
//        fontWeight: 'bold',
//        marginVertical: 10,
//        color: '#000000',
//    },
//    date: {
//        fontSize: 24,
//        marginBottom: 20,
//        color: '#333333',
//    },
//    event: {
//        backgroundColor: '#FFF4CC',
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
//        fontWeight: 'bold',
//        color: '#000000',
//    },
//    description: {
//        fontSize: 22,
//        fontWeight: 'bold',
//        color: '#000000',
//    },
//    button: {
//        backgroundColor: '#1E90FF',
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
//        fontSize: 20,
//        color: '#FFFFFF',
//        fontWeight: 'bold',
//    },
//    navigation: {
//        flexDirection: 'row',
//        justifyContent: 'space-between',
//        width: '100%',
//        marginTop: 20,
//    },
//    navButton: {
//        backgroundColor: '#CCCCCC',
//        padding: 15,
//        borderRadius: 10,
//        width: '30%',
//        alignItems: 'center',
//    },
//    navButtonText: {
//        fontSize: 18,
//        color: '#000000',
//    },
//});
//
//export default ScheduleScreen;
