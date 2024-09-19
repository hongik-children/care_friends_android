// UserTypeSelectionScreen.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import CustomText from '../CustomTextProps';

const UserTypeSelectionScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { email } = route.params || {};

    const handleSelection = (userType) => {
        navigation.navigate('SignupScreen', { email, userType });
    };

    return (
        <View style={styles.container}>
            <CustomText style={styles.title}>회원 유형을 선택하세요</CustomText>
            <CustomText>이메일: {email}</CustomText>
            <TouchableOpacity
                style={styles.button}
                onPress={() => handleSelection('노약자')}
            >
                <CustomText style={styles.buttonText}>노약자</CustomText>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => handleSelection('보호자')}
            >
                <CustomText style={styles.buttonText}>보호자</CustomText>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 24,
        fontFamily: 'Pretendard-Bold',
        marginBottom: 20,
    },
    button: {
        width: '80%',
        padding: 15,
        marginVertical: 10,
        backgroundColor: '#6495ED',
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
    },
});

export default UserTypeSelectionScreen;
