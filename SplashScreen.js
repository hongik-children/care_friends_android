import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomText from './CustomTextProps';
import { Buffer } from 'buffer'; // Buffer를 사용한 Base64 디코딩

// JWT 디코딩 함수
const decodeJWT = (token) => {
  const base64Url = token.split('.')[1]; // JWT의 두 번째 부분이 payload입니다.
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8'); // Buffer로 Base64 디코딩

  return JSON.parse(jsonPayload);
};

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkTokenAndNavigate = async () => {
      try {
        const jwtToken = await AsyncStorage.getItem('jwtToken');
        const userType = await AsyncStorage.getItem('userType');

        if (jwtToken && userType) {
          // JWT 토큰 만료 확인
          const decodedToken = decodeJWT(jwtToken);
          const currentTime = Date.now() / 1000; // 현재 시간 (초 단위)

          if (decodedToken.exp < currentTime) {
            // 토큰이 만료된 경우 로그인 화면으로 이동
            navigation.replace('KakaoLoginScreen');
          } else {
            // 유저 타입에 따라 탭 네비게이터로 이동
            if (userType === 'caregiver') {
              navigation.replace('CaregiverTabs');
            } else if (userType === 'friend') {
              navigation.replace('FriendTabs');
            } else {
              navigation.replace('KakaoLoginScreen');
            }
          }
        } else {
          // JWT 또는 userType이 없을 경우 로그인 화면으로 이동
          navigation.replace('KakaoLoginScreen');
        }
      } catch (error) {
        console.error('토큰 확인 중 오류 발생:', error);
        navigation.replace('KakaoLoginScreen');
      }
    };

    // 2초 지연 후 토큰 확인 및 네비게이션 처리
    setTimeout(() => {
      checkTokenAndNavigate();
    }, 2000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <CustomText style={styles.titleText}>
          CareFriends
        </CustomText>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  textContainer: {
    maxWidth: '80%',
    textAlign: 'center',
  },
  titleText: {
    fontSize: 24,
    fontFamily: 'Pretendard-Bold',
    color: '#000',
    textAlign: 'center',
  },
});

export default SplashScreen;




//import React, { useEffect } from 'react';
//import { View, ActivityIndicator, StyleSheet } from 'react-native';
//import AsyncStorage from '@react-native-async-storage/async-storage';
//import CustomText from './CustomTextProps';
//
//// JWT 디코딩 함수
//const decodeJWT = (token) => {
//  const base64Url = token.split('.')[1]; // JWT의 두 번째 부분이 payload입니다.
//  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//  const jsonPayload = decodeURIComponent(
//    atob(base64)
//      .split('')
//      .map(function (c) {
//        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//      })
//      .join('')
//  );
//
//  return JSON.parse(jsonPayload);
//};
//
//const SplashScreen = ({ navigation }) => {
//  useEffect(() => {
//    const checkTokenAndNavigate = async () => {
//      try {
//        const jwtToken = await AsyncStorage.getItem('jwtToken');
//        const userType = await AsyncStorage.getItem('userType');
//
//        if (jwtToken && userType) {
//          // JWT 토큰 만료 확인
//          const decodedToken = decodeJWT(jwtToken);
//          const currentTime = Date.now() / 1000; // 현재 시간 (초 단위)
//
//          if (decodedToken.exp < currentTime) {
//            // 토큰이 만료된 경우
//            navigation.replace('KakaoLoginScreen');
//          } else {
//            // 유저 타입에 따라 탭 네비게이터로 이동
//            if (userType === 'caregiver') {
//              navigation.replace('CaregiverTabs');
//            } else if (userType === 'friend') {
//              navigation.replace('FriendTabs');
//            } else {
//              navigation.replace('KakaoLoginScreen');
//            }
//          }
//        } else {
//          // JWT 또는 userType이 없을 경우 로그인 화면으로 이동
//          navigation.replace('KakaoLoginScreen');
//        }
//      } catch (error) {
//        console.error('토큰 확인 중 오류 발생:', error);
//        navigation.replace('KakaoLoginScreen');
//      }
//    };
//
//    setTimeout(() => {
//      checkTokenAndNavigate();
//    }, 2000); // 스플래시 화면 2초 동안 표시
//  }, [navigation]);
//
//  return (
//    <View className="flex-1 justify-center items-center bg-white px-6 py-24">
//      <View className="max-w-2xl text-center">
//        <CustomText className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
//          CareFriends
//        </CustomText>
//        <ActivityIndicator size="large" color="#0000ff" />
//      </View>
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    justifyContent: 'center',
//    alignItems: 'center',
//    backgroundColor: '#fff',
//  },
//});
//
//export default SplashScreen;




//import React, { useEffect } from 'react';
//import { View, ActivityIndicator, StyleSheet } from 'react-native';
//import AsyncStorage from '@react-native-async-storage/async-storage';
//import CustomText from './CustomTextProps';
//
//const SplashScreen = ({ navigation }) => {
//  useEffect(() => {
//    const checkTokenAndNavigate = async () => {
//      try {
//        const jwtToken = await AsyncStorage.getItem('jwtToken');
//        const userType = await AsyncStorage.getItem('userType');
//
//        if (jwtToken && userType) {
//          // 유저 타입에 따라 탭 네비게이터로 이동
//          if (userType === 'caregiver') {
//            navigation.replace('CaregiverTabs');
//          } else if (userType === 'friend') {
//            navigation.replace('FriendTabs');
//          } else {
//            navigation.replace('KakaoLoginScreen');
//          }
//        } else {
//          navigation.replace('KakaoLoginScreen');
//        }
//      } catch (error) {
//        console.error('토큰 확인 중 오류 발생:', error);
//        navigation.replace('KakaoLoginScreen');
//      }
//    };
//
//    setTimeout(() => {
//      checkTokenAndNavigate();
//    }, 2000); // 스플래시 화면 2초 동안 표시
//  }, [navigation]);
//
//  return (
//    <View className="flex-1 justify-center items-center bg-white px-6 py-24">
//      <View className="max-w-2xl text-center">
//        <CustomText className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
//          CareFriends
//        </CustomText>
//      </View>
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    justifyContent: 'center',
//    alignItems: 'center',
//    backgroundColor: '#fff',
//  },
//});
//
//export default SplashScreen;