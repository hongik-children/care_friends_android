import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomText from '../CustomTextProps';
import DatePicker from 'react-native-date-picker';

const EditProfileScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [gender, setGender] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userType, setUserType] = useState(null);  // userType 상태 추가

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const jwtToken = await AsyncStorage.getItem('jwtToken');
        const storedUserType = await AsyncStorage.getItem('userType');  // userType 가져오기
        setUserType(storedUserType);

        if (!jwtToken) {
          Alert.alert('오류', '로그인 정보가 없습니다.');
          return;
        }

        const response = await axios.get(`${BASE_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        const { name, phoneNumber, birthDate, gender } = response.data;
        setName(name);
        setPhoneNumber(phoneNumber);
        setBirthDate(birthDate);
        setGender(gender);
        setSelectedDate(new Date(birthDate));
      } catch (error) {
        console.error(error);
        Alert.alert('오류', '프로필 정보를 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!jwtToken) {
        Alert.alert('오류', '로그인 정보가 없습니다.');
        return;
      }

      const response = await axios.patch(`${BASE_URL}/profile/edit`, {
        name,
        phoneNumber,
        birthDate,
        gender,
        userType,
      }, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        Alert.alert('성공', '프로필이 성공적으로 수정되었습니다.');
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '프로필 수정 중 오류가 발생했습니다.');
    }
  };

  const onConfirmDate = (date) => {
    setShowDatePicker(false);
    setSelectedDate(date);
    setBirthDate(date.toISOString().split('T')[0]);
  };

  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>프로필 수정</CustomText>

      <View style={styles.inputContainer}>
        <CustomText style={styles.label}>이름</CustomText>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputContainer}>
        <CustomText style={styles.label}>전화번호</CustomText>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          keyboardType="phone-pad"
          onChangeText={setPhoneNumber}
        />
      </View>

      <View style={styles.inputContainer}>
        <CustomText style={styles.label}>생년월일</CustomText>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
            <CustomText style={{ color: '#000000' }}>{birthDate ? birthDate : '생년월일을 선택하세요'}</CustomText>
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
              <TouchableOpacity style={styles.okButton} onPress={() => onConfirmDate(selectedDate)}>
                <CustomText style={styles.okButtonText}>확인</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>

      <View style={styles.inputContainer}>
        <CustomText style={styles.label}>성별</CustomText>
        <View style={styles.radioGroup}>
          <TouchableOpacity onPress={() => setGender('male')} style={styles.radioButton}>
            <View style={[styles.radioOuterCircle, gender === 'male' && styles.radioSelected]}>
              {gender === 'male' && <View style={styles.radioInnerCircle} />}
            </View>
            <CustomText>남성</CustomText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setGender('female')} style={styles.radioButton}>
            <View style={[styles.radioOuterCircle, gender === 'female' && styles.radioSelected]}>
              {gender === 'female' && <View style={styles.radioInnerCircle} />}
            </View>
            <CustomText>여성</CustomText>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <CustomText style={styles.saveButtonText}>저장</CustomText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#555',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  dateInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#6495ED',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
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
  okButton: {
    backgroundColor: '#6495ED',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  okButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
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
});

export default EditProfileScreen;
