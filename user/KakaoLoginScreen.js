import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { login } from "@react-native-seoul/kakao-login";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@env";
import { useNavigation } from "@react-navigation/native";
import CustomText from '../CustomTextProps';

const KakaoLoginScreen = () => {
  const navigation = useNavigation();

  const signInWithKakao = async (): Promise<void> => {
    try {
      const token = await login();
      console.log("Access Token: ", token.accessToken);
      console.log("base url", BASE_URL);
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: token.accessToken,
        }),
      });

      const data = await response.json();

      if (data.status === "newUser") {
        // 새로운 회원이면 회원가입 화면으로 리다이렉트
        console.log("새로운 회원입니다. 회원가입 화면으로 이동합니다.");
        navigation.navigate("UserTypeSelectionScreen", { email: data.email });
      } else {
        // JWT 토큰과 유저 타입 저장
        console.log("JWT Token:", data.jwtToken);
        console.log("User Type:", data.userType);
        await AsyncStorage.setItem("jwtToken", data.jwtToken);
        await AsyncStorage.setItem("userType", data.userType);

        // 스케줄 화면으로 이동
        if (data.userType === "caregiver") {
          navigation.navigate("CaregiverTabs", { screen: "ScheduleScreen" });
        } else {
          navigation.navigate("FriendTabs", { screen: "FriendScheduleScreen" });
        }
      }
    } catch (err) {
      console.error("login err", err);
    }
  };

  return (
    <View style={styles.loginContainer}>
      <CustomText style={styles.title}>카카오 로그인으로</CustomText>
      <CustomText style={styles.subtitle}>간편하게 시작하세요.</CustomText>
      <TouchableOpacity style={styles.kakaoButton} onPress={signInWithKakao}>
        <CustomText style={styles.kakaoButtonText}>카카오 로그인</CustomText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,  // 화면을 꽉 채움
    justifyContent: 'center',  // 수직으로 가운데 정렬
    alignItems: 'center',  // 수평으로 가운데 정렬
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    borderRadius: 40,
    width: 250,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  kakaoButtonText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    color: '#000',
  },
  title: {
    fontFamily: 'Pretendard-ExtraBold',
    fontSize: 24,
    color: '#333',
    marginBottom: 15,  // 간격 추가
  },
  subtitle: {
    fontFamily: 'Pretendard-Bole',
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
});

export default KakaoLoginScreen;