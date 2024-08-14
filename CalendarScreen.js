import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Modal from 'react-native-modal';
import axios from 'axios';

const CalendarScreen = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState({});

  useEffect(() => {
    // 서버에서 데이터를 받아와서 events state를 세팅
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://192.168.0.5:8080/task/all');
        const data = response.data;

        // 서버에서 받은 데이터를 events 객체에 저장
        const eventsData = data.reduce((acc, event) => {
          const date = event.date; // assuming your event data has a `date` field
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push({ time: event.startTime, title: event.title });
          return acc;
        }, {});

        console.log(eventsData);
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDate(null);
  };

  const handleEventPress = (event) => {
    closeModal();
    navigation.navigate('EditScheduleScreen', { event });
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={Object.keys(events).reduce((acc, date) => {
          acc[date] = { marked: true, dotColor: 'blue' };
          return acc;
        }, {})}
      />
      <Modal isVisible={isModalVisible} onBackdropPress={closeModal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {selectedDate ? `${selectedDate}의 일정` : '일정이 없습니다.'}
          </Text>
          {events[selectedDate]?.length > 0 ? (
            events[selectedDate].map((event, index) => (
              <TouchableOpacity
                key={index}
                style={styles.event}
                onPress={() => handleEventPress(event)}
              >
                <Text>{event.time}: {event.title}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text>이날은 일정이 없습니다.</Text>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    backgroundColor: 'black',
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
