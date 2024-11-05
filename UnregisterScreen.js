import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env'; // @env 모듈로 불러옴

const UnregisterScreen = ({ route, navigation }) => {
    const { profile } = route.params;

    const unregisterAccount = async () => {
        try {
            const jwtToken = await AsyncStorage.getItem('jwtToken');
            if (!jwtToken) {
                Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
                return;
            }

            // 탈퇴 API 호출
            const response = await axios.delete(`${BASE_URL}/friendRequest/unregister/${profile.uuid}`, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            if (response.status === 204) { // 탈퇴 성공 시
                // Onboarding 화면으로 이동
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'OnboardingScreen' }],
                });
            }
        } catch (error) {
            console.error("탈퇴 요청 실패:", error);
            Alert.alert("오류", "탈퇴 요청에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const handleUnregisterPress = () => {
        Alert.alert(
            "회원 탈퇴",
            "탈퇴하시겠습니까?",
            [
                {
                    text: "취소",
                    onPress: () => console.log("탈퇴 취소됨"),
                    style: "cancel"
                },
                {
                    text: "확인",
                    onPress: () => unregisterAccount()
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* 경고 문구 */}
            <Text style={styles.warningText}>
                회원 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다. 신중히 결정해 주세요.
            </Text>

            <TouchableOpacity style={styles.unregisterButton} onPress={handleUnregisterPress}>
                <Text style={styles.buttonText}>회원 탈퇴</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#f8f9fa'
    },
    warningText: {
        color: '#d9534f',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: 'bold'
    },
    unregisterButton: {
        backgroundColor: '#ff6b6b',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default UnregisterScreen;
