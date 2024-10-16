import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, TouchableOpacity, Modal, Button } from "react-native";
import { login } from "@react-native-seoul/kakao-login";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@env";
import { useNavigation } from "@react-navigation/native";
import CustomText from '../CustomTextProps';

const KakaoLoginScreen = () => {
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

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
      setUserEmail(data.email);

      if (data.status === "newUser") {
        // 새로운 회원이면 회원가입 화면으로 리다이렉트
        console.log("새로운 회원입니다. 회원가입 화면으로 이동합니다.");

        // 새로운 회원이면 모달을 보여줌
        setShowModal(true);
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

  const handleModalClose = () => {
    setShowModal(false);
    navigation.navigate("UserTypeSelectionScreen", { email: userEmail }); // 회원가입 화면으로 이동
  };

  return (
    <View style={styles.loginContainer}>
      <CustomText style={styles.title}>카카오 로그인으로</CustomText>
      <CustomText style={styles.subtitle}>간편하게 시작하세요.</CustomText>
      <TouchableOpacity style={styles.kakaoButton} onPress={signInWithKakao}>
        <CustomText style={styles.kakaoButtonText}>카카오 로그인</CustomText>
      </TouchableOpacity>

      {/* 새로운 회원 모달 */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <CustomText style={styles.modalText}>새로운 회원이시네요!</CustomText>
            <CustomText style={styles.modalText}>회원가입을 진행할게요.</CustomText>
            <TouchableOpacity style={styles.okButton} onPress={handleModalClose}>
                <CustomText style={styles.okButtonText}>확인</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 30,
    alignItems: 'center',
  },
  modalText: {
      fontSize: 18,
      marginBottom: 20,
      textAlign: 'center',
  },
  okButton: {
      backgroundColor: '#6495ED',
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 8,
      alignItems: 'center',
  },
  okButtonText: {
      color: '#fff',
      fontSize: 18,
      fontFamily: 'Pretendard-Bold',
  },
});

export default KakaoLoginScreen;