import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';
import { request, PERMISSIONS } from 'react-native-permissions';
import CustomText from '../CustomTextProps';

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
//            } else {
//                console.log("Location permission denied");
//            }
//        } else {
//            const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
//            if (result === 'granted') {
//                console.log("Location permission granted");
//            } else {
//                console.log("Location permission denied");
//            }
//        }
//    };

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
            <CustomText style={styles.title}>오늘의 일정(프렌드 화면!!)</CustomText>
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

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('FriendAddScheduleScreen')}>
                <CustomText style={styles.buttonText}>일정 추가하기</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={sendPushMessage}>
                <CustomText style={styles.buttonText}>알림 보내기</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
                <CustomText style={styles.buttonText}>위치 조회하기</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SelectPainAreaScreen' , {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude
            })}>
                <CustomText style={styles.buttonText}>주변 병원 데모 버튼</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('VoiceSearchScreen' , {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude
            })}>
                <CustomText style={styles.buttonText}>음성 병원 찾기</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('imgUpload')}>
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

export default FriendScheduleScreen;



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

        // 위치 조회 기능
        const handleCheckLocation = () => {
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

        // 시간 형식 변환 함수
        const formatTime = (timeString) => {
            const time = new Date(`1970-01-01T${timeString}`);
            return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };

        // 날짜 형식
        const getFormattedDate = () => {
            const year = today.getFullYear();
            const month = today.getMonth() + 1;
            const date = today.getDate();
            const dayOfWeekNames = ['일', '월', '화', '수', '목', '금', '토'];
            const dayOfWeek = dayOfWeekNames[today.getDay()]; // 요일 가져오기
            return `${year}년 ${month}월 ${date}일 (${dayOfWeek})`;
        };

        return (
            <ScrollView contentContainerStyle={styles.container}>
                {/* 고정된 상단 날짜 */}
                <CustomText style={styles.dateText}>{getFormattedDate()}</CustomText>

                {/* 친구 목록이 있는지 확인 */}
                {friends.length > 0 ? (
                    <>
                        {/* 친구 선택 및 화살표 */}
                        <View style={styles.friendScheduleHeader}>
                            <TouchableOpacity onPress={handlePreviousFriend}>
                                <Feather name="chevron-left" size={24} color="#333" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.friendNameContainer}>
                                <Text style={styles.friendNameText}>
                                    {currentFriend ? `${currentFriend.name}님의 일정` : "친구 선택"}
                                </Text>
                                <Feather name="chevron-down" size={20} color="#333" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleNextFriend}>
                                <Feather name="chevron-right" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* 일정 목록 표시 */}
                        {tasks.length > 0 ? (
                            tasks.map((task) => (
                                <View key={task.id} style={styles.event}>
                                    <CustomText style={styles.time}>{formatTime(task.startTime)}</CustomText>
                                    <CustomText style={styles.description}>{task.title}</CustomText>
                                </View>
                            ))
                        ) : (
                            <CustomText style={styles.noTaskText}>오늘 일정이 없습니다.</CustomText>
                        )}

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

                        {/* 위치 조회 버튼 */}
                        <TouchableOpacity style={styles.actionButton} onPress={handleCheckLocation}>
                            <Feather name="map-pin" size={24} color="#fff" />
                            <CustomText style={styles.actionButtonText}>위치 조회하기</CustomText>
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
                                                <Text style={styles.friendItemText}>{item.name}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeModalButton}>
                                        <Text style={styles.closeModalText}>닫기</Text>
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
        dateText: {
            fontSize: 35,
            fontWeight: 'bold',
            alignItems: 'left',
            color: '#333',
            marginBottom: 15,
        },
        friendScheduleHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
        },
        friendNameContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        friendNameText: {
            fontSize: 28,
            fontWeight: 'bold',
            color: '#333',
            marginHorizontal: 10,
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
        noFriendsContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 50,
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
    });

    export default ScheduleScreen;
