import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomText from './CustomTextProps';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkTokenAndNavigate = async () => {
      try {
        const jwtToken = await AsyncStorage.getItem('jwtToken');
        const userType = await AsyncStorage.getItem('userType');

        if (jwtToken && userType) {
          // 유저 타입에 따라 탭 네비게이터로 이동
          if (userType === 'caregiver') {
            navigation.replace('CaregiverTabs');
          } else if (userType === 'friend') {
            navigation.replace('FriendTabs');
          } else {
            navigation.replace('KakaoLoginScreen');
          }
        } else {
          navigation.replace('KakaoLoginScreen');
        }
      } catch (error) {
        console.error('토큰 확인 중 오류 발생:', error);
        navigation.replace('KakaoLoginScreen');
      }
    };

    setTimeout(() => {
      checkTokenAndNavigate();
    }, 2000); // 스플래시 화면 2초 동안 표시
  }, [navigation]);

  return (
    <View className="flex-1 justify-center items-center bg-white px-6 py-24">
      <View className="max-w-2xl text-center">
        <CustomText className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          CareFriends
        </CustomText>
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
});

export default SplashScreen;