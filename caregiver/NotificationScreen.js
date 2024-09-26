import React, { useEffect, useState } from "react";
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Text, TouchableHighlight, View, PermissionsAndroid } from "react-native";
import { BASE_URL } from '@env'; // @env 모듈로 불러옴


// 백그라운드 이벤트 핸들러 함수 정의
notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;

    console.log('Background event handler:', type, detail);

    // 백그라운드 알림 처리 로직
    if (type === notifee.EventType.PRESS) {
        console.log('Notification pressed:', notification);
    }

    if (type === notifee.EventType.ACTION_PRESS) {
        console.log('Action pressed:', pressAction);
    }

    // 알림 닫기
    await notifee.cancelNotification(notification.id);
});

const NotificationScreen = () => {
    const [fcmToken, setFcmToken] = useState("");

    useEffect(() => {
        requestUserPermission();
        getFcmToken();
        const unsubscribe = messaging().onMessage(async remoteMessage => onMessageReceived(remoteMessage));

        // 백그라운드 메시지 수신 설정
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

        // 안드로이드 추가 권한 요청
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
                title: "Notification Permission",
                message: "This app needs access to show notifications",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("You can use the notifications");
        } else {
            console.log("Notification permission denied");
        }
    };

    const getFcmToken = async () => {
        const fcmTokenInfo = await messaging().getToken();
        setFcmToken(fcmTokenInfo);
        console.log('FCM Token:', fcmTokenInfo);
    };

    const onMessageReceived = async (message) => {
        console.log("title :: ", message.notification.title);
        console.log("body :: ", message.notification.body);

        const channelId = await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
            importance: AndroidImportance.HIGH, // 알림 중요도 설정
        });

        console.log('Channel created with ID:', channelId);

        await notifee.displayNotification({
            title: message.notification.title,
            body: message.notification.body,
            android: {
                channelId,
                smallIcon: '@mipmap/ic_launcher', // 기본 아이콘 사용
            },
        }).then(() => {
            console.log('Notification displayed successfully');
        }).catch(error => {
            console.error('Error displaying notification:', error);
        });
    };

    const sendPushMessage = async () => {
        const sendInfo = {
            token: fcmToken,
            id: "a6b94ff9-e5c3-4272-819b-f0e26dc2731b",
            title: "일정 확인해주세요",
            body: "16:00 손녀딸 집에 방문"
        };

        console.log(BASE_URL); //BASE_URL이 안불러와지는 에러 해결

        await fetch(`${BASE_URL}/api/v1/fcm/send`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sendInfo)
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                console.log("Message sent successfully");
            })
            .catch((error) => {
                console.log(`에러가 발생하였습니다 ${error}`);
            });
    };

    return (
        <View>
            <TouchableHighlight onPress={sendPushMessage}>
                <Text>알람 전송</Text>
            </TouchableHighlight>
            <Text>HelloText</Text>
        </View>
    );
};

export default NotificationScreen;