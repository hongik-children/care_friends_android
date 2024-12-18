import React, { useState } from 'react';
import { View, TextInput, Alert, TouchableOpacity, Text, ScrollView, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import CustomText from '../CustomTextProps';

const FriendAddScheduleScreen = ({ navigation }) => {
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [periodType, setPeriodType] = useState('NONE');
  const [period, setPeriod] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [memo, setMemo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = async () => {
    const taskRequest = {
      date: date.toISOString().split('T')[0],
      periodType,
      period,
      startTime: startTime.toTimeString().split(' ')[0],
      title,
      location,
      memo,
    };

    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!jwtToken) {
        Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
        return;
      }

      const apiUrl = `${BASE_URL}/task`;
      const response = await axios.post(apiUrl, taskRequest, {
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      });

      console.log('Task saved:', response.data);
      Alert.alert("성공", "일정이 저장되었습니다.");
      navigation.goBack();
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert("오류", "일정을 저장하는 중 오류가 발생했습니다.");
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setStartTime(selectedTime);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <CustomText style={styles.label}>주기</CustomText>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={periodType}
          onValueChange={(itemValue) => setPeriodType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="없음" value="NONE" />
          <Picker.Item label="매일" value="DAY" />
          <Picker.Item label="매주" value="WEEK" />
          <Picker.Item label="매월" value="MONTH" />
          <Picker.Item label="매년" value="YEAR" />
        </Picker>
      </View>

      <TextInput
        placeholder="반복 주기"
        value={period}
        onChangeText={setPeriod}
        style={styles.input}
      />

      <TextInput
        placeholder="제목"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="위치"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />

      <TextInput
        placeholder="메모"
        value={memo}
        onChangeText={setMemo}
        style={styles.input}
        multiline
      />

      <Text style={styles.label}>방문 예정 날짜</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateButtonText}>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Text style={styles.label}>방문 예정 시간</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.dateButtonText}>{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>저장</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
    borderRadius: 10,
  },
  picker: {
    backgroundColor: '#FFF',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#333',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 16,
    color: '#000',
    borderRadius: 10,
  },
  dateButton: {
    backgroundColor: '#E8EAF6',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#6495ED',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FriendAddScheduleScreen;




//import React, { useState } from 'react';
//import { View, TextInput, Alert, Pressable, Text, ScrollView, StyleSheet, Platform } from 'react-native';
//import DateTimePicker from '@react-native-community/datetimepicker';
//import axios from 'axios';
//import { Picker } from '@react-native-picker/picker';
//import AsyncStorage from '@react-native-async-storage/async-storage'; // JWT 토큰을 가져오기 위해 추가
//import { BASE_URL } from '@env'; // @env 모듈로 불러옴
//import CustomText from '../CustomTextProps';
//
//const FriendAddScheduleScreen = ({ navigation }) => {
//  const [date, setDate] = useState(new Date());
//  const [periodType, setPeriodType] = useState('NONE');
//  const [period, setPeriod] = useState('');
//  const [startTime, setStartTime] = useState(new Date());
//  const [title, setTitle] = useState('');
//  const [location, setLocation] = useState('');
//  const [memo, setMemo] = useState('');
//  const [showDatePicker, setShowDatePicker] = useState(false);
//  const [showTimePicker, setShowTimePicker] = useState(false);
//
//  // 일정 저장 함수
//  const handleSave = async () => {
//    const taskRequest = {
//      date: date.toISOString().split('T')[0], // YYYY-MM-DD 형식으로 변환
//      periodType,
//      period,
//      startTime: new Date(startTime.getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[1].substring(0, 8),
//      title,
//      location,
//      memo,
//    };
//
//    try {
//      // JWT 토큰 가져오기
//      const jwtToken = await AsyncStorage.getItem('jwtToken');
//      if (!jwtToken) {
//        Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
//        return;
//      }
//
//      console.log(BASE_URL); //BASE_URL이 안불러와지는 에러 해결
//      const apiUrl = `${BASE_URL}/task`; // API URL
//
//      // 서버로 요청 보내기
//      const response = await axios.post(apiUrl, taskRequest, {
//        headers: {
//          Authorization: `Bearer ${jwtToken}` // JWT 토큰을 헤더에 추가
//        }
//      });
//
//      console.log('Task saved:', response.data);
//      Alert.alert("성공", "일정이 저장되었습니다.");
//      navigation.goBack();
//    } catch (error) {
//      console.error('Error saving task:', error);
//      Alert.alert("오류", "일정을 저장하는 중 오류가 발생했습니다.");
//    }
//  };
//
//  const onDateChange = (event, selectedDate) => {
//    setShowDatePicker(false);
//    if (selectedDate) {
//      setDate(selectedDate);
//    }
//  };
//
//  const onTimeChange = (event, selectedTime) => {
//    setShowTimePicker(false);
//    if (selectedTime) {
//      setStartTime(selectedTime);
//    }
//  };
//
//  return (
//    <ScrollView style={styles.container}>
//      <CustomText style={{ color: '#333', marginBottom: 10, marginHorizontal: 8 }}>주기</CustomText>
//      <View style={{ borderWidth: 1, borderColor: '#333', marginBottom: 20, overflow: 'visible' }}>
//        <Picker
//          selectedValue={periodType}
//          onValueChange={(itemValue) => setPeriodType(itemValue)}
//          style={styles.picker}
//          dropdownIconColor={'#6495ED'}
//        >
//          <Picker.Item label="없음" value="NONE" />
//          <Picker.Item label="매일" value="DAY" />
//          <Picker.Item label="매주" value="WEEK" />
//          <Picker.Item label="매월" value="MONTH" />
//          <Picker.Item label="매년" value="YEAR" />
//        </Picker>
//      </View>
//
//      <TextInput
//        placeholder="반복 주기"
//        value={period}
//        onChangeText={setPeriod}
//        style={styles.input}
//        placeholderTextColor={'#333'}
//      />
//
//      <TextInput
//        placeholder="제목"
//        value={title}
//        onChangeText={setTitle}
//        style={styles.input}
//        placeholderTextColor={'#333'}
//      />
//
//      <TextInput
//        placeholder="위치"
//        value={location}
//        onChangeText={setLocation}
//        style={styles.input}
//        placeholderTextColor={'#333'}
//      />
//
//      <TextInput
//        placeholder="메모"
//        value={memo}
//        onChangeText={setMemo}
//        style={styles.input}
//        multiline
//        placeholderTextColor={'#333'}
//      />
//
//      <View style={styles.dateTimePicker}>
//        <Pressable
//          style={{ borderRadius: 6, width: 120, height: 48, backgroundColor: '#6495ED', alignItems: 'center', justifyContent: 'center' }}
//          onPress={() => setShowDatePicker(true)} color="#6495ED"
//        >
//          <CustomText style={{ color: '#FFF', fontSize: 16}}>날짜 선택</CustomText>
//        </Pressable>
//        <Pressable
//          style={{ borderRadius: 6, width: 120, height: 48, backgroundColor: '#6495ED', alignItems: 'center', justifyContent: 'center' }}
//          onPress={() => setShowTimePicker(true)} color="#6495ED"
//        >
//          <CustomText style={{ color: '#FFF', fontSize: 16 }}>시간 선택</CustomText>
//        </Pressable>
//      </View>
//
//      {showDatePicker && (
//        <DateTimePicker
//          value={date}
//          mode="date"
//          display="default"
//          onChange={onDateChange}
//        />
//      )}
//
//      {showTimePicker && (
//        <DateTimePicker
//          value={startTime}
//          mode="time"
//          display="default"
//          onChange={onTimeChange}
//        />
//      )}
//
//      <Pressable
//        style={{ borderRadius: 6, height: 48, backgroundColor: '#6495ED', alignItems: 'center', justifyContent: 'center' }}
//        onPress={handleSave}
//      >
//        <CustomText style={{ color: '#FFF', fontSize: 17 }}>저장</CustomText>
//      </Pressable>
//    </ScrollView>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    padding: 20,
//    backgroundColor: '#FFFFFF',
//  },
//  input: {
//    height: 50,
//    borderColor: '#333',
//    borderWidth: 1,
//    marginBottom: 20,
//    paddingHorizontal: 16,
//    color: '#000',
//    borderRadius: 10,
//  },
//  picker: {
//    backgroundColor: '#FFF',
//    color: '#333',
//  },
//  dateTimePicker: {
//    flexDirection: 'row',
//    justifyContent: 'space-between',
//    marginBottom: 20,
//  },
//});
//
//export default FriendAddScheduleScreen;