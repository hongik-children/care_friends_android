import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Modal } from 'react-native';
import DatePicker from 'react-native-date-picker'; // react-native-date-picker 라이브러리
import axios from 'axios';
import { useRoute } from '@react-navigation/native';

const SignupScreen = () => {
    const route = useRoute();
    const { email, userType } = route.params || {};
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date()); // DatePicker에 사용할 선택된 날짜

    // userType을 영어로 변환하는 함수
    const convertUserType = (type) => {
        if (type === '보호자') {
            return 'caregiver';
        } else if (type === '노약자') {
            return 'friend';
        }
        return type;
    };

    // 생년월일 선택 처리
    const onConfirmDate = (date) => {
        setShowDatePicker(false);
        setSelectedDate(date);
        setBirthDate(date.toISOString().split('T')[0]); // YYYY-MM-DD 형식으로 변환
    };

    const handleSignup = async () => {
        if (!name || !phone || !gender || !birthDate) {
            Alert.alert('모든 필드를 입력해 주세요.');
            return;
        }

        const payload = {
            email, // 서버에서 받은 이메일 사용
            userType: convertUserType(userType), // 보호자/노약자 -> caregiver/friend 변환
            name,
            phone,
            gender,
            birthDate
        };

        try {
            const response = await axios.post('http://10.0.2.2:8080/signup', payload, {
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
            <Text style={styles.label}>이메일: {email}</Text>
            <Text style={styles.label}>유형: {userType}</Text>

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
                    <Text>남성</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setGender('female')} style={styles.radioButton}>
                    <View style={[styles.radioOuterCircle, gender === 'female' && styles.radioSelected]}>
                        {gender === 'female' && <View style={styles.radioInnerCircle} />}
                    </View>
                    <Text>여성</Text>
                </TouchableOpacity>
            </View>

            {/* 생년월일 선택 */}
            <Text style={styles.label}>생년월일</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                <Text>{birthDate ? birthDate : '생년월일을 선택하세요'}</Text>
            </TouchableOpacity>

            <Modal transparent={true} visible={showDatePicker} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.datePickerContainer}>
                        <DatePicker
                            date={selectedDate}
                            mode="date"
                            onDateChange={setSelectedDate}
                            maximumDate={new Date()} // 오늘 날짜까지 선택 가능
                        />
                        <Button title="확인" onPress={() => onConfirmDate(selectedDate)} />
                    </View>
                </View>
            </Modal>

            <Button title="회원가입" onPress={handleSignup} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: '#cccccc',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
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
        borderColor: '#1E90FF',
    },
    dateInput: {
        height: 40,
        borderColor: '#cccccc',
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
        marginBottom: 20,
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
});

export default SignupScreen;





//import React, { useState } from 'react';
//import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
//import DateTimePicker from '@react-native-community/datetimepicker';
//import axios from 'axios';
//import { useRoute } from '@react-navigation/native';
//
//const SignupScreen = () => {
//    const route = useRoute();
//    const { email, userType } = route.params || {};
//    const [name, setName] = useState('');
//    const [phone, setPhone] = useState('');
//    const [gender, setGender] = useState('');
//    const [birthDate, setBirthDate] = useState('');
//    const [showDatePicker, setShowDatePicker] = useState(false);
//
//    // userType을 영어로 변환하는 함수
//    const convertUserType = (type) => {
//        if (type === '보호자') {
//            return 'caregiver';
//        } else if (type === '노약자') {
//            return 'friend';
//        }
//        return type;
//    };
//
//    // 생년월일 선택 처리
//    const onDateChange = (event, selectedDate) => {
//        const currentDate = selectedDate || birthDate;
//        setShowDatePicker(false);
//        setBirthDate(currentDate.toISOString().split('T')[0]); // YYYY-MM-DD 형식으로 변환
//    };
//
//    const handleSignup = async () => {
//        if (!name || !phone || !gender || !birthDate) {
//            Alert.alert('모든 필드를 입력해 주세요.');
//            return;
//        }
//
//        const payload = {
//            email, // 서버에서 받은 이메일 사용
//            userType: convertUserType(userType), // 보호자/노약자 -> caregiver/friend 변환
//            name,
//            phone,
//            gender,
//            birthDate
//        };
//
//        try {
//            const response = await axios.post('http://10.0.2.2:8080/signup', payload, {
//                headers: {
//                    'Content-Type': 'application/json'
//                }
//            });
//            console.log('회원가입 성공:', response.data);
//            Alert.alert('회원가입이 성공적으로 완료되었습니다.');
//        } catch (error) {
//            console.error('회원가입 실패:', error);
//            Alert.alert('회원가입에 실패했습니다.');
//        }
//    };
//
//    return (
//        <View style={styles.container}>
//            <Text style={styles.label}>이메일: {email}</Text>
//            <Text style={styles.label}>유형: {userType}</Text>
//
//            <TextInput
//                style={styles.input}
//                placeholder="이름"
//                value={name}
//                onChangeText={setName}
//            />
//
//            <TextInput
//                style={styles.input}
//                placeholder="전화번호"
//                keyboardType="phone-pad"
//                value={phone}
//                onChangeText={setPhone}
//            />
//
//            {/* 성별 선택 */}
//            <Text style={styles.label}>성별</Text>
//            <View style={styles.radioGroup}>
//                <TouchableOpacity onPress={() => setGender('male')} style={styles.radioButton}>
//                    <View style={[styles.radioOuterCircle, gender === 'male' && styles.radioSelected]}>
//                        {gender === 'male' && <View style={styles.radioInnerCircle} />}
//                    </View>
//                    <Text>남성</Text>
//                </TouchableOpacity>
//                <TouchableOpacity onPress={() => setGender('female')} style={styles.radioButton}>
//                    <View style={[styles.radioOuterCircle, gender === 'female' && styles.radioSelected]}>
//                        {gender === 'female' && <View style={styles.radioInnerCircle} />}
//                    </View>
//                    <Text>여성</Text>
//                </TouchableOpacity>
//            </View>
//
//            {/* 생년월일 선택 */}
//            <Text style={styles.label}>생년월일</Text>
//            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
//                <Text>{birthDate ? birthDate : '생년월일을 선택하세요'}</Text>
//            </TouchableOpacity>
//
//            {showDatePicker && (
//                <DateTimePicker
//                    value={birthDate ? new Date(birthDate) : new Date()}
//                    mode="date"
//                    display="default"
//                    onChange={onDateChange}
//                />
//            )}
//
//            <Button title="회원가입" onPress={handleSignup} />
//        </View>
//    );
//};
//
//const styles = StyleSheet.create({
//    container: {
//        flex: 1,
//        padding: 20,
//        backgroundColor: '#ffffff',
//    },
//    label: {
//        fontSize: 16,
//        marginBottom: 10,
//    },
//    input: {
//        height: 40,
//        borderColor: '#cccccc',
//        borderWidth: 1,
//        marginBottom: 20,
//        paddingHorizontal: 10,
//    },
//    radioGroup: {
//        flexDirection: 'row',
//        marginBottom: 20,
//    },
//    radioButton: {
//        flexDirection: 'row',
//        alignItems: 'center',
//        marginRight: 20,
//    },
//    radioOuterCircle: {
//        height: 20,
//        width: 20,
//        borderRadius: 10,
//        borderWidth: 1,
//        borderColor: '#000',
//        alignItems: 'center',
//        justifyContent: 'center',
//        marginRight: 10,
//    },
//    radioInnerCircle: {
//        height: 10,
//        width: 10,
//        borderRadius: 5,
//        backgroundColor: '#000',
//    },
//    radioSelected: {
//        borderColor: '#1E90FF',
//    },
//    dateInput: {
//        height: 40,
//        borderColor: '#cccccc',
//        borderWidth: 1,
//        justifyContent: 'center',
//        paddingHorizontal: 10,
//        marginBottom: 20,
//    },
//});
//
//export default SignupScreen;

