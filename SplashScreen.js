import React, { useEffect } from 'react';
import { View, Text } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('ScheduleScreen');
    }, 2000); // 2초 후에 홈으로 이동
  }, [navigation]);

  return (
      <View className="flex-1 justify-center items-center bg-white px-6 py-24">
        <View className="max-w-2xl text-center">
          <Text className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            CareFriends
          </Text>
        </View>
      </View>
    );
  };

export default SplashScreen;
