import React, { useState, useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  login,
  logout,
  getProfile as getKakaoProfile,
  unlink,
} from "@react-native-seoul/kakao-login";
import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from '@env';

const App = () => {
  const [result, setResult] = useState("");

  const signInWithKakao = async (): Promise<void> => {
    try {
      const token = await login();
      console.log("Access Token: ", token.accessToken);

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
        console.log("새로운 회원입니다. 회원가입 화면으로 이동합니다.");
        Linking.openURL(`myapp://signup?email=${data.email}`);
      } else {
        console.log("JWT Token:", data.jwtToken);
        console.log("User Type:", data.userType);
        setResult(`JWT Token: ${data.jwtToken}, User Type: ${data.userType}`);

        // JWT 토큰을 AsyncStorage에 저장
        await AsyncStorage.setItem("jwtToken", data.jwtToken);
      }
    } catch (err) {
      console.error("login err", err);
    }
  };

  // JWT를 사용해 API 요청을 보내는 함수
  const sendRequestWithJwt = async () => {
    try {
      // AsyncStorage에서 JWT 불러오기
      const jwtToken = await AsyncStorage.getItem("jwtToken");

      if (jwtToken) {
        const response = await fetch(`${BASE_URL}/api`, { //아직안함
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`, // JWT 토큰을 Authorization 헤더에 추가
          },
        });

        const data = await response.json();
        console.log("Protected Data:", data);
      } else {
        console.log("JWT 토큰을 찾을 수 없습니다.");
      }
    } catch (err) {
      console.error("API 요청 중 오류 발생:", err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.resultContainer}>
        <ScrollView>
          <Text>{result}</Text>
        </ScrollView>
      </View>

      <Pressable style={styles.button} onPress={signInWithKakao}>
        <Text style={styles.text}>카카오 로그인</Text>
      </Pressable>

      {/* JWT를 사용해 보호된 API 요청 */}
      <Pressable style={styles.button} onPress={sendRequestWithJwt}>
        <Text style={styles.text}>JWT로 API 요청</Text>
      </Pressable>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 100,
  },
  resultContainer: {
    flexDirection: "column",
    width: "100%",
    padding: 24,
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

