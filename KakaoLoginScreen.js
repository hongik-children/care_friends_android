// KakaoLoginScreen.js

import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Linking } from 'react-native';


const KakaoLoginScreen = () => {
    const handleKakaoLogin = () => {
        const authUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}`;
        Linking.openURL(authUrl).catch(err => console.error('Error opening URL:', err));
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleKakaoLogin}>
                <Image source={require('./kakao_login_medium_narrow.png')} style={styles.loginButton} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loginButton: {
        width: 200,
        height: 50,
    },
});

export default KakaoLoginScreen;
