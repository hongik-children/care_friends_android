// CalendarScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars'; // 예시로 사용하는 가상의 달력 컴포넌트
import Modal from 'react-native-modal';


const CalendarScreen = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDate(null);
  };

  const handleEventPress = () => {
    closeModal();
    navigation.navigate('EditScheduleScreen');
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        // 기본 스타일 및 기능 설정
      />
      <Modal isVisible={isModalVisible} onBackdropPress={closeModal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{selectedDate}의 일정</Text>
          <TouchableOpacity style={styles.event} onPress={handleEventPress}>
            <Text>일정 1: 점심약 복용</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.event} onPress={handleEventPress}>
            <Text>일정 2: 정형외과 진료</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.event} onPress={handleEventPress}>
            <Text>일정 3: 손녀딸 집에 방문</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  event: {
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
});

export default CalendarScreen;




//import React from 'react';
//import { View, StyleSheet } from 'react-native';
//import { Calendar } from 'react-native-calendars';
//
//const CalendarScreen = () => {
//  return (
//    <View style={styles.container}>
//      <Calendar
//        // Marked dates example
//        markedDates={{
//          '2024-03-07': { marked: true },
//          '2024-03-08': { marked: true, dotColor: 'red', activeOpacity: 0 },
//          '2024-03-09': { marked: true, dotColor: 'blue' },
//        }}
//        // Handler which gets executed on day press
//        onDayPress={(day) => {
//          console.log('selected day', day);
//        }}
//      />
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    backgroundColor: '#fff',
//  },
//});
//
//export default CalendarScreen;
