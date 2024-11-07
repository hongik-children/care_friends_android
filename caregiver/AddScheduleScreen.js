import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Platform, Alert, Pressable, Text, ScrollView} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage'; // JWT 토큰을 가져오기 위해 추가
import { BASE_URL } from '@env'; // @env 모듈로 불러옴
import CustomText from '../CustomTextProps';

const AddScheduleScreen = ({ route, navigation }) => {
  const {friendId} = route.params;
  const [date, setDate] = useState(new Date());
  const [periodType, setPeriodType] = useState('NONE');
  const [period, setPeriod] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [memo, setMemo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(null);

//  선택한 날짜 화면에 보여주기 위한 변수
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

//  console.log("Edit화면 route 파람: " + route.params.defaultDate);

// 기본적으로 Add 에 넘겨준 디폴트 날짜, 시간이 있으면 세팅하기
  useEffect(() => {
      // route.params가 있을 때 값 가져오기
      if (route.params && route.params.defaultDate) {
          setSelectedDate(new Date(route.params.defaultDate.year, route.params.defaultDate.month-1, route.params.defaultDate.day));
      }

      if (route.params && route.params.defaultTime) {
          setSelectedTime(new Date(route.params.defaultTime));
      } else {
          // 디폴트로 오전 8시 설정
          const defaultTime = new Date();
          defaultTime.setHours(8, 0, 0);  // 오전 8시 설정
          setSelectedTime(defaultTime);
      }
  }, [route.params]);

  const onChangeDate = (event, date) => {
      setShowDatePicker(false);  // DateTimePicker 숨기기
      if (date) {
          setSelectedDate(date);  // 선택된 날짜 저장
      }
  };

  const onChangeTime = (event, time) => {
      setShowTimePicker(false);  // DateTimePicker 숨기기
      if (time) {
          setSelectedTime(time);  // 선택된 시간 저장
      }
  };


//  console.log(route.params);
  console.log("currentFriendUUID: " + friendId); // 디버그용

  const handleSave = async () => {
    const taskRequest = {
      friendId,
      date: date.toISOString().split('T')[0],
      periodType,
      period,
      startTime: new Date(startTime.getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[1].substring(0, 8),
      title,
      location,
      memo,
    };

    try {
      // JWT 토큰 가져오기
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!jwtToken) {
        Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
        return;
      }
      console.log(BASE_URL); //BASE_URL이 안불러와지는 에러 해결
      const apiUrl = `${BASE_URL}/task/caregiver`; // API URL

      // 서버로 요청 보내기
      const response = await axios.post(apiUrl, taskRequest, {
        headers: {
          Authorization: `Bearer ${jwtToken}` // JWT 토큰을 헤더에 추가
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
      <CustomText style={{color:'#000', marginBottom:10, marginHorizontal:8}}>주기</CustomText>
      <View style={{borderWidth:1, borderColor:'#000',
    marginBottom: 20, overflow:'visible'}}>
      <Picker
        selectedValue={periodType}
        onValueChange={(itemValue) => setPeriodType(itemValue)}
        style={styles.picker}
        dropdownIconColor={'#6495ED'}
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

        placeholderTextColor={'#000'}
      />
      <TextInput
        placeholder="제목"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholderTextColor={'#000'}
      />
      <TextInput
        placeholder="위치"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
        placeholderTextColor={'#000'}
      />
      <TextInput
        placeholder="메모"
        value={memo}
        onChangeText={setMemo}
        style={styles.input}
        multiline
        placeholderTextColor={'#000'}
      />
      <View style={styles.container}>
          <View style={styles.dateTimePicker}>
              <Pressable
                  style={styles.button}
                  onPress={() => setShowDatePicker(true)}
              >
                  <CustomText style={styles.buttonText}>날짜 선택</CustomText>
              </Pressable>

              <Pressable
                  style={styles.button}
                  onPress={() => setShowTimePicker(true)}
              >
                  <CustomText style={styles.buttonText}>시간 선택</CustomText>
              </Pressable>
          </View>

          {/* 선택된 날짜 및 시간 표시 */}
          <View style={styles.selectedDateTimeContainer}>
              {selectedDate && (
                  <Text style={styles.selectedDateTimeText}>
                      날짜: {selectedDate.toLocaleDateString()}
                  </Text>
              )}
              {selectedTime && (
                  <Text style={styles.selectedDateTimeText}>
                      시간: {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
              )}
          </View>

          {/* Date Picker */}
          {showDatePicker && (
              <DateTimePicker
                  value={selectedDate || new Date()}  // 초기 값
                  mode="date"  // 날짜 선택
                  display="default"
                  onChange={onChangeDate}  // 선택한 날짜로 상태 업데이트
              />
          )}

          {/* Time Picker */}
          {showTimePicker && (
              <DateTimePicker
                  value={selectedTime || new Date()}  // 초기 값
                  mode="time"  // 시간 선택
                  display="default"
                  onChange={onChangeTime}  // 선택한 시간으로 상태 업데이트
              />
          )}
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
      <Pressable
                      style={{borderRadius:6, height:48, backgroundColor:'#6495ED', alignItems:'center', justifyContent:'center'}}
                      onPress={handleSave}>
                          <CustomText style={{color:'#FFF', fontSize:14 }}>저장</CustomText>
                      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  input: {
    height: 50,
    borderColor: '#000',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 16,
    color:'#000',
    borderRadius:10,
  },
  picker: {
    backgroundColor:'#FFF',
    color:'#000'
  },
  dateTimePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button : {
    borderRadius:6,
    width:120, height:48,
    backgroundColor:'#6495ED',
    alignItems:'center',
    justifyContent:'center',
  },
  buttonText : {
    color:'#FFF',
    fontSize:14
  },
  selectedDateTimeText: {
      color: '#333',
      fontSize: 18,
      fontFamily: 'Pretendard-Bold',
      textAlign: 'center',  // 글자 가운데 정렬
  },
});

export default AddScheduleScreen;

