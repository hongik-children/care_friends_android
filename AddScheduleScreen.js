import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { BASE_URL } from '@env'; // @env 모듈로 불러옴

const AddScheduleScreen = ({ navigation }) => {
  const [friendId, setFriendId] = useState('');
  const [date, setDate] = useState(new Date());
  const [periodType, setPeriodType] = useState('NONE');
  const [period, setPeriod] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [memo, setMemo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = async () => {
    const taskRequest = {
      friendId,
      date: date.toISOString().split('T')[0],
      periodType,
      period,
      startTime: startTime.toISOString().split('T')[1].substring(0, 8),
      title,
      location,
      memo,
    };

    try {
      const apiUrl = Platform.OS === 'android' ? `${BASE_URL}/task` : `${BASE_URL}/task`;

      const response = await axios.post(apiUrl, taskRequest);
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
    <View style={styles.container}>
      <TextInput
        placeholder="친구 ID"
        value={friendId}
        onChangeText={setFriendId}
        style={styles.input}
      />
      <Picker
        selectedValue={periodType}
        onValueChange={(itemValue) => setPeriodType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="NONE" value="NONE" />
        <Picker.Item label="DAY" value="DAY" />
        <Picker.Item label="WEEK" value="WEEK" />
        <Picker.Item label="MONTH" value="MONTH" />
        <Picker.Item label="YEAR" value="YEAR" />
      </Picker>
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
      <View style={styles.dateTimePicker}>
        <Button title="날짜 선택" onPress={() => setShowDatePicker(true)} color="#6495ED"/>
        <Button title="시간 선택" onPress={() => setShowTimePicker(true)} color="#6495ED"/>
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
      <Button title="저장" onPress={handleSave} color="#6495ED" />
    </View>
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
    borderColor: '#CCCCCC',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    marginBottom: 20,
  },
  dateTimePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
});

export default AddScheduleScreen;

