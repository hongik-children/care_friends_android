import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { login } from "@react-native-seoul/kakao-login";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@env";
import { useNavigation } from "@react-navigation/native";

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
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={signInWithKakao}>
        <Text style={styles.text}>카카오 로그인</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",  // 수직 중앙 정렬
    alignItems: "center",  // 수평 중앙 정렬
  },
  button: {
    backgroundColor: "#FEE500",
    borderRadius: 40,
    borderWidth: 1,
    width: 250,
    height: 40,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
  },
  text: {
    textAlign: "center",
  },
});

export default KakaoLoginScreen;