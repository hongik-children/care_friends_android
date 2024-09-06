import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Modal } from 'react-native';
import DatePicker from 'react-native-date-picker';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import { BASE_URL } from '@env'; // @env 모듈로 불러옴


const SignupScreen = () => {
    const route = useRoute();
    const { email, userType } = route.params || {};
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const convertUserType = (type) => {
        if (type === '보호자') return 'caregiver';
        if (type === '노약자') return 'friend';
        return type;
    };

    // 생년월일 선택 처리
    const onConfirmDate = (date) => {
        setShowDatePicker(false);
        setSelectedDate(date);
        setBirthDate(date.toISOString().split('T')[0]);
    };

    const handleSignup = async () => {
        if (!name || !phone || !gender || !birthDate) {
            Alert.alert('모든 필드를 입력해 주세요.');
            return;
        }

        const payload = {
            email,
            userType: convertUserType(userType),
            name,
            phone,
            gender,
            birthDate
        };

        try {
            const response = await axios.post(`${BASE_URL}/signup`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('회원가입 성공:', response.data);
            Alert.alert('회원가입이 성공적으로 완료되었습니다.');
        } catch (error) {
            console.error('회원가입 실패:', error);
            Alert.alert('회원가입에 실패했습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>회원가입</Text>

            <TextInput
                style={styles.input}
                placeholder="이름"
                value={name}
                onChangeText={setName}
            />

            <TextInput
                style={styles.input}
                placeholder="전화번호"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
            />

            {/* 성별 선택 */}
            <Text style={styles.label}>성별</Text>
            <View style={styles.radioGroup}>
                <TouchableOpacity onPress={() => setGender('male')} style={styles.radioButton}>
                    <View style={[styles.radioOuterCircle, gender === 'male' && styles.radioSelected]}>
                        {gender === 'male' && <View style={styles.radioInnerCircle} />}
                    </View>
                    <Text style={{ color: '#000000' }}>남성</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setGender('female')} style={styles.radioButton}>
                    <View style={[styles.radioOuterCircle, gender === 'female' && styles.radioSelected]}>
                        {gender === 'female' && <View style={styles.radioInnerCircle} />}
                    </View>
                    <Text style={{ color: '#000000' }}>여성</Text>
                </TouchableOpacity>
            </View>

            {/* 생년월일 선택 */}
            <Text style={styles.label}>생년월일</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                <Text style={{ color: '#000000' }}>{birthDate ? birthDate : '생년월일을 선택하세요'}</Text>
            </TouchableOpacity>

            <Modal transparent={true} visible={showDatePicker} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.datePickerContainer}>
                        <DatePicker
                            date={selectedDate}
                            mode="date"
                            onDateChange={setSelectedDate}
                            maximumDate={new Date()}
                        />
                        <Button title="확인" onPress={() => onConfirmDate(selectedDate)} />
                    </View>
                </View>
            </Modal>

            <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
                <Text style={styles.signupButtonText}>회원가입</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    label: {
        color: '#000000', // 라벨 텍스트를 검은색으로 설정
        fontSize: 16,
        marginBottom: 10,
    },
    radioGroup: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    radioOuterCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    radioInnerCircle: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: '#000',
    },
    radioSelected: {
        borderColor: '#6495ED',
    },
    dateInput: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        paddingHorizontal: 15,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    datePickerContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 20,
    },
    signupButton: {
        backgroundColor: '#6495ED',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
    },
    signupButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SignupScreen;
