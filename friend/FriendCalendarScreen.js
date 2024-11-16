import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Modal from 'react-native-modal';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '@env';
import CustomText from '../CustomTextProps';
import AsyncStorage from '@react-native-async-storage/async-storage';

LocaleConfig.locales['ko'] = {
  monthNames: ['01월', '02월', '03월', '04월', '05월', '06월', '07월', '08월', '09월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

const FriendCalendarScreen = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState({});

  const fetchEvents = async () => {
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!jwtToken) {
          Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
          return;
      }
      const response = await axios.get(`${BASE_URL}/task/myTask`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const data = response.data;

      const eventsData = data.reduce((acc, event) => {
        const date = event.date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push({ time: event.startTime, title: event.title, taskId: event.id, description: event.memo });
        return acc;
      }, {});

      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDate(null);
  };

  const handleEventPress = (event) => {
    console.log(event);
    closeModal();
    navigation.navigate('EditScheduleScreen', { event });
  };

  const today = new Date().toISOString().split('T')[0];

  // Function to format selected date as "YYYY년 MM월 DD일 (요일)"
  const formatSelectedDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dayOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          ...Object.keys(events).reduce((acc, date) => {
            acc[date] = { marked: true, dotColor: 'black' };
            return acc;
          }, {}),
          [today]: { selected: true, selectedColor: 'transparent', selectedTextColor: 'blue' },
        }}
        renderHeader={(date) => (
            <CustomText style={styles.monthHeader}>
                {date.toString('yyyy MMMM')}
            </CustomText>
        )}
        renderArrow={(direction) => (
          <Text style={styles.arrowText}>{direction === 'left' ? '◀' : '▶'}</Text>
        )}
        dayComponent={({ date }) => {
          const dateKey = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
          const dateEvents = events[dateKey] || [];
          const isToday = dateKey === today;

          return (
            <TouchableOpacity onPress={() => handleDayPress(date)}>
              <View style={styles.dayContainer}>
                <CustomText style={[styles.dayText, isToday && styles.todayText]}>{date.day}</CustomText>
                {dateEvents.map((event, index) => (
                  <View key={index} style={styles.eventBackground}>
                    <Text style={styles.eventText}>{event.title}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <Modal isVisible={isModalVisible} onBackdropPress={closeModal} style={styles.modalStyle}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <CustomText style={styles.modalTitle}>
              {selectedDate ? formatSelectedDate(selectedDate) : '일정이 없습니다.'}
            </CustomText>
            <View style={styles.divider} />
          </View>
          {events[selectedDate]?.length > 0 ? (
            <FlatList
              data={events[selectedDate]}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleEventPress(item)}>
                  <View style={styles.eventItemModal}>
                    <View style={styles.eventDetailsContainer}>
                      <Text style={styles.eventTitle}>{`${item.time || '시간 없음'}  |  ${item.title}`}</Text>
                      <Text style={styles.eventDetail}>{item.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <CustomText style={styles.noEventsText}>이 날짜에는 일정이 없습니다.</CustomText>
          )}

          {/* Add Event Button */}
          <TouchableOpacity
            onPress={() => {
              setModalVisible(false);
              navigation.navigate("AddScheduleScreen", { defaultDate: selectedDate });
            }}
            style={styles.addEventButton}
          >
            <CustomText style={styles.addEventText}>일정 추가하기</CustomText>
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity onPress={closeModal} style={styles.closeModalButton}>
            <CustomText style={styles.closeModalText}>닫기</CustomText>
          </TouchableOpacity>
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
  arrowText: {
    fontSize: 18,
    color: '#6495ED',
  },
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 16,
  },
  todayText: {
    color: '#6495ED',
  },
  monthHeader: {
    fontSize: 20,
    fontFamily: 'Pretendard-Bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  eventBackground: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  eventText: {
    fontSize: 10,
    color: '#333',
  },
  modalStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    width: '90%',
  },
  modalHeader: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#999',
    marginVertical: 10,
    width: '100%',
  },
  eventItemModal: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  eventDetailsContainer: {
    flex: 1,
    marginLeft: 10,
  },
  eventTitle: {
    fontSize: 18,
    color: '#333',
  },
  eventDetail: {
    fontSize: 14,
    color: '#999',
    paddingLeft: 95,
    marginVertical: 2,
  },
  noEventsText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: '#999',
  },
  closeModalButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  closeModalText: {
    fontSize: 16,
    color: '#6495ED',
  },
  addEventButton: {
    marginTop: 20,
    backgroundColor: '#6495ED',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  addEventText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default FriendCalendarScreen;



//import React, { useState, useCallback } from 'react';
//import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
//import { Calendar, LocaleConfig } from 'react-native-calendars';
//import Modal from 'react-native-modal';
//import axios from 'axios';
//import { useFocusEffect } from '@react-navigation/native';
//import { BASE_URL } from '@env';
//import CustomText from '../CustomTextProps';
//import AsyncStorage from '@react-native-async-storage/async-storage';
//
//LocaleConfig.locales['ko'] = {
//  monthNames: ['01월', '02월', '03월', '04월', '05월', '06월', '07월', '08월', '09월', '10월', '11월', '12월'],
//  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
//  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
//  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
//  today: '오늘',
//};
//LocaleConfig.defaultLocale = 'ko';
//
//const FriendCalendarScreen = ({ navigation }) => {
//  const [isModalVisible, setModalVisible] = useState(false);
//  const [selectedDate, setSelectedDate] = useState(null);
//  const [events, setEvents] = useState({});
//
//  const fetchEvents = async () => {
//    try {
//      const jwtToken = await AsyncStorage.getItem('jwtToken');
//      if (!jwtToken) {
//          Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
//          return;
//      }
//      const response = await axios.get(`${BASE_URL}/task/myTask`, {
//        headers: { Authorization: `Bearer ${jwtToken}` }
//      });
//      const data = response.data;
//
//      const eventsData = data.reduce((acc, event) => {
//        const date = event.date;
//        if (!acc[date]) {
//          acc[date] = [];
//        }
//        acc[date].push({ time: event.startTime, title: event.title, taskId: event.id, description: event.memo });
//        return acc;
//      }, {});
//
//      setEvents(eventsData);
//    } catch (error) {
//      console.error('Error fetching events:', error);
//    }
//  };
//
//  useFocusEffect(
//    useCallback(() => {
//      fetchEvents();
//    }, [])
//  );
//
//  const handleDayPress = (day) => {
//    setSelectedDate(day.dateString);
//    setModalVisible(true);
//  };
//
//  const closeModal = () => {
//    setModalVisible(false);
//    setSelectedDate(null);
//  };
//
//  const handleEventPress = (event) => {
//    console.log(event);
//    closeModal();
//    navigation.navigate('EditScheduleScreen', { event });
//  };
//
//  const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
//
//  return (
//    <View style={styles.container}>
//      <Calendar
//        onDayPress={handleDayPress}
//        markedDates={{
//          ...Object.keys(events).reduce((acc, date) => {
//            acc[date] = { marked: true, dotColor: 'black' };
//            return acc;
//          }, {}),
//          [today]: { selected: true, selectedColor: 'transparent', selectedTextColor: 'blue' },
//        }}
//        renderHeader={(date) => (
//            <CustomText style={styles.monthHeader}>
//                {date.toString('yyyy MMMM')}
//            </CustomText>
//        )}
//        renderArrow={(direction) => (
//          <Text style={styles.arrowText}>{direction === 'left' ? '◀' : '▶'}</Text>
//        )}
//        dayComponent={({ date }) => {
//          const dateKey = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
//          const dateEvents = events[dateKey] || [];
//          const isToday = dateKey === today;
//
//          return (
//            <TouchableOpacity onPress={() => handleDayPress(date)}>
//              <View style={styles.dayContainer}>
//                <CustomText style={[styles.dayText, isToday && styles.todayText]}>{date.day}</CustomText>
//                {dateEvents.map((event, index) => (
//                  <View key={index} style={styles.eventBackground}>
//                    <Text style={styles.eventText}>{event.title}</Text>
//                  </View>
//                ))}
//              </View>
//            </TouchableOpacity>
//          );
//        }}
//      />
//      <Modal isVisible={isModalVisible} onBackdropPress={closeModal} style={styles.modalStyle}>
//        <View style={styles.modalContent}>
//          <View style={styles.modalHeader}>
//            <CustomText style={styles.modalTitle}>
//              {selectedDate}
//            </CustomText>
//            <View style={styles.divider} />
//          </View>
//          {events[selectedDate]?.length > 0 ? (
//            <FlatList
//              data={events[selectedDate]}
//              keyExtractor={(item, index) => index.toString()}
//              renderItem={({ item }) => (
//                <TouchableOpacity onPress={() => handleEventPress(item)}>
//                  <View style={styles.eventItemModal}>
//                    <View style={styles.eventDetailsContainer}>
//                      <Text style={styles.eventTitle}>{`${item.time || '시간 없음'}  |  ${item.title}`}</Text>
//                      <Text style={styles.eventDetail}>{item.description}</Text>
//                    </View>
//                  </View>
//                </TouchableOpacity>
//              )}
//            />
//          ) : (
//            <CustomText style={styles.noEventsText}>이 날짜에는 일정이 없습니다.</CustomText>
//          )}
//
//          {/* Add Event Button */}
//          <TouchableOpacity
//            onPress={() => {
//              setModalVisible(false);
//              navigation.navigate("AddScheduleScreen", { defaultDate: selectedDate });
//            }}
//            style={styles.addEventButton}
//          >
//            <CustomText style={styles.addEventText}>일정 추가하기</CustomText>
//          </TouchableOpacity>
//
//          {/* Close Button */}
//          <TouchableOpacity onPress={closeModal} style={styles.closeModalButton}>
//            <CustomText style={styles.closeModalText}>닫기</CustomText>
//          </TouchableOpacity>
//        </View>
//      </Modal>
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    backgroundColor: '#fff',
//  },
//  arrowText: {
//    fontSize: 18,
//    color: '#6495ED',
//  },
//  dayContainer: {
//    alignItems: 'center',
//    justifyContent: 'center',
//  },
//  dayText: {
//    fontSize: 16,
//  },
//  todayText: {
//    color: '#6495ED',
//  },
//  monthHeader: {
//    fontSize: 20,
//    fontFamily: 'Pretendard-Bold',
//    textAlign: 'center',
//    marginBottom: 10,
//  },
//  eventBackground: {
//    backgroundColor: '#F0F0F0',
//    paddingHorizontal: 4,
//    paddingVertical: 2,
//    borderRadius: 4,
//    marginTop: 2,
//  },
//  eventText: {
//    fontSize: 10,
//    color: '#333',
//  },
//  modalStyle: {
//    justifyContent: 'center',
//    alignItems: 'center',
//    margin: 0,
//  },
//  modalContent: {
//    backgroundColor: 'white',
//    padding: 20,
//    borderRadius: 20,
//    width: '90%',
//  },
//  modalHeader: {
//    alignItems: 'center',
//  },
//  modalTitle: {
//    fontSize: 24,
//    fontFamily: 'Pretendard-Bold',
//    marginBottom: 20,
//  },
//  divider: {
//    height: 1,
//    backgroundColor: '#999',
//    marginVertical: 10,
//    width: '100%',
//  },
//  eventItemModal: {
//    flexDirection: 'row',
//    marginBottom: 15,
//    alignItems: 'center',
//  },
//  eventDetailsContainer: {
//    flex: 1,
//    marginLeft: 10,
//  },
//  eventTitle: {
//    fontSize: 16,
//    color: '#333',
//  },
//  eventDetail: {
//    fontSize: 14,
//    color: '#999',
//  },
//  noEventsText: {
//    fontSize: 16,
//    textAlign: 'center',
//    marginVertical: 20,
//    color: '#999',
//  },
//  closeModalButton: {
//    alignItems: 'center',
//    marginTop: 20,
//  },
//  closeModalText: {
//    fontSize: 16,
//    color: '#6495ED',
//  },
//  addEventButton: {
//    marginTop: 20,
//    backgroundColor: '#6495ED',
//    padding: 10,
//    borderRadius: 10,
//    alignItems: 'center',
//  },
//  addEventText: {
//    color: '#fff',
//    fontSize: 16,
//  },
//});
//
//export default FriendCalendarScreen;



//import React, { useState, useCallback } from 'react';
//import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
//import { Calendar, LocaleConfig } from 'react-native-calendars';
//import Modal from 'react-native-modal';
//import axios from 'axios';
//import { useFocusEffect } from '@react-navigation/native';
//import { BASE_URL } from '@env';
//import CustomText from '../CustomTextProps';
//import AsyncStorage from '@react-native-async-storage/async-storage';
//
//LocaleConfig.locales['ko'] = {
//  monthNames: ['01월', '02월', '03월', '04월', '05월', '06월', '07월', '08월', '09월', '10월', '11월', '12월'],
//  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
//  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
//  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
//  today: '오늘',
//};
//LocaleConfig.defaultLocale = 'ko';
//
//const FriendCalendarScreen = ({ navigation }) => {
//  const [isModalVisible, setModalVisible] = useState(false);
//  const [selectedDate, setSelectedDate] = useState(null);
//  const [events, setEvents] = useState({});
//
//  const fetchEvents = async () => {
//    try {
//      const jwtToken = await AsyncStorage.getItem('jwtToken');
//      if (!jwtToken) {
//          Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
//          return;
//      }
//      const response = await axios.get(`${BASE_URL}/task/myTask`, {
//        headers: { Authorization: `Bearer ${jwtToken}` }
//      });
//      const data = response.data;
//
//      const eventsData = data.reduce((acc, event) => {
//        const date = event.date;
//        if (!acc[date]) {
//          acc[date] = [];
//        }
//        acc[date].push({ time: event.startTime, title: event.title, taskId: event.id, description: event.memo});
//        return acc;
//      }, {});
//
//      setEvents(eventsData);
//    } catch (error) {
//      console.error('Error fetching events:', error);
//    }
//  };
//
//  useFocusEffect(
//    useCallback(() => {
//      fetchEvents();
//    }, [])
//  );
//
//  const handleDayPress = (day) => {
//    setSelectedDate(day.dateString);
//    setModalVisible(true);
//  };
//
//  const closeModal = () => {
//    setModalVisible(false);
//    setSelectedDate(null);
//  };
//
//  const handleEventPress = (event) => {
//    console.log(event);
//    closeModal();
//    navigation.navigate('EditScheduleScreen', { event });
//  };
//
//  const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
//
//  return (
//    <View style={styles.container}>
//      <Calendar
//        onDayPress={handleDayPress}
//        markedDates={{
//          ...Object.keys(events).reduce((acc, date) => {
//            acc[date] = { marked: true, dotColor: 'black' };
//            return acc;
//          }, {}),
//          [today]: { selected: true, selectedColor: 'transparent', selectedTextColor: 'blue' },
//        }}
//        renderHeader={(date) => (
//            <CustomText style={styles.monthHeader}>
//                {date.toString('yyyy MMMM')}
//            </CustomText>
//        )}
//        renderArrow={(direction) => (
//          <Text style={styles.arrowText}>{direction === 'left' ? '◀' : '▶'}</Text>
//        )}
//        dayComponent={({ date }) => {
//          const dateKey = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
//          const dateEvents = events[dateKey] || [];
//          const isToday = dateKey === today;
//
//          return (
//            <TouchableOpacity onPress={() => handleDayPress(date)}>
//              <View style={styles.dayContainer}>
//                <CustomText style={[styles.dayText, isToday && styles.todayText]}>{date.day}</CustomText>
//                {dateEvents.map((event, index) => (
//                  <View key={index} style={styles.eventBackground}>
//                    <Text style={styles.eventText}>{event.title}</Text>
//                  </View>
//                ))}
//              </View>
//            </TouchableOpacity>
//          );
//        }}
//      />
//      <Modal isVisible={isModalVisible} onBackdropPress={closeModal}>
//        <View style={styles.modalContent}>
//          <CustomText style={styles.modalTitle}>
//            {selectedDate ? `${selectedDate}의 일정` : '일정이 없습니다.'}
//          </CustomText>
//          {events[selectedDate]?.length > 0 ? (
//            events[selectedDate].map((event, index) => (
//              <TouchableOpacity
//                key={index}
//                style={styles.event}
//                onPress={() => handleEventPress(event)}
//              >
//                <CustomText>{event.time}: {event.title}</CustomText>
//              </TouchableOpacity>
//            ))
//          ) : (
//            <CustomText>이날은 일정이 없습니다.</CustomText>
//          )}
//        </View>
//      </Modal>
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    backgroundColor: '#fff',
//  },
//  arrowText: {
//    fontSize: 18,
//    color: '#6495ED',
//  },
//  dayContainer: {
//    alignItems: 'center',
//    justifyContent: 'center',
//  },
//  dayText: {
//    fontSize: 16,
//  },
//  todayText: {
//    color: '#6495ED', // Blue color for today's date
//  },
//  monthHeader: {
//      fontSize: 20,
//      fontFamily: 'Pretendard-Bold',
//      textAlign: 'center',
//      marginBottom: 10,
//  },
//  eventBackground: {
//    backgroundColor: '#F0F0F0',  // Gray background
//    paddingHorizontal: 4,
//    paddingVertical: 2,
//    borderRadius: 4,
//    marginTop: 2,
//  },
//  eventText: {
//    fontSize: 10,
//    color: '#333',
//  },
//  modalContent: {
//    backgroundColor: 'white',
//    padding: 20,
//    borderRadius: 10,
//  },
//  modalTitle: {
//    fontSize: 20,
//    fontFamily: 'Pretendard-Bold',
//    marginBottom: 20,
//  },
//  event: {
//    padding: 10,
//    borderBottomColor: '#ccc',
//    borderBottomWidth: 1,
//  },
//});
//
//export default FriendCalendarScreen;



//import React, { useState, useCallback } from 'react';
//import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
//import { Calendar, LocaleConfig } from 'react-native-calendars';
//import Modal from 'react-native-modal';
//import axios from 'axios';
//import { useFocusEffect } from '@react-navigation/native';
//import { BASE_URL } from '@env';
//import CustomText from '../CustomTextProps';
//import AsyncStorage from '@react-native-async-storage/async-storage';
//
//LocaleConfig.locales['ko'] = {
//  monthNames: ['01월', '02월', '03월', '04월', '05월', '06월', '07월', '08월', '09월', '10월', '11월', '12월'],
//  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
//  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
//  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
//  today: '오늘',
//};
//LocaleConfig.defaultLocale = 'ko';
//
//const FriendCalendarScreen = ({ navigation }) => {
//  const [isModalVisible, setModalVisible] = useState(false);
//  const [selectedDate, setSelectedDate] = useState(null);
//  const [events, setEvents] = useState({});
//
//  const fetchEvents = async () => {
//    try {
//      const jwtToken = await AsyncStorage.getItem('jwtToken');
//      if (!jwtToken) {
//          Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
//          return;
//      }
//      const response = await axios.get(`${BASE_URL}/task/myTask`, {
//        headers: { Authorization: `Bearer ${jwtToken}` }
//      });
//      const data = response.data;
//
//      const eventsData = data.reduce((acc, event) => {
//        const date = event.date;
//        if (!acc[date]) {
//          acc[date] = [];
//        }
//        acc[date].push({ time: event.startTime, title: event.title, ...event });
//        return acc;
//      }, {});
//
//      setEvents(eventsData);
//    } catch (error) {
//      console.error('Error fetching events:', error);
//    }
//  };
//
//  useFocusEffect(
//    useCallback(() => {
//      fetchEvents();
//    }, [])
//  );
//
//  const handleDayPress = (day) => {
//    setSelectedDate(day.dateString);
//    setModalVisible(true);
//  };
//
//  const closeModal = () => {
//    setModalVisible(false);
//    setSelectedDate(null);
//  };
//
//  const handleEventPress = (event) => {
//    closeModal();
//    navigation.navigate('EditScheduleScreen', { event });
//  };
//
//  return (
//    <View style={styles.container}>
//      <Calendar
//        onDayPress={handleDayPress}
//        markedDates={Object.keys(events).reduce((acc, date) => {
//          acc[date] = { marked: true, dotColor: 'blue' };
//          return acc;
//        }, {})}
//        dayComponent={({ date }) => {
//          const dateKey = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
//          const dateEvents = events[dateKey] || [];
//          return (
//            <TouchableOpacity onPress={() => handleDayPress(date)}>
//              <View style={styles.dayContainer}>
//                <Text style={styles.dayText}>{date.day}</Text>
//                {dateEvents.map((event, index) => (
//                  <View key={index} style={styles.eventBackground}>
//                    <Text style={styles.eventText}>{event.title}</Text>
//                  </View>
//                ))}
//              </View>
//            </TouchableOpacity>
//          );
//        }}
//      />
//      <Modal isVisible={isModalVisible} onBackdropPress={closeModal}>
//        <View style={styles.modalContent}>
//          <CustomText style={styles.modalTitle}>
//            {selectedDate ? `${selectedDate}의 일정` : '일정이 없습니다.'}
//          </CustomText>
//          {events[selectedDate]?.length > 0 ? (
//            events[selectedDate].map((event, index) => (
//              <TouchableOpacity
//                key={index}
//                style={styles.event}
//                onPress={() => handleEventPress(event)}
//              >
//                <CustomText>{event.time}: {event.title}</CustomText>
//              </TouchableOpacity>
//            ))
//          ) : (
//            <CustomText>이날은 일정이 없습니다.</CustomText>
//          )}
//        </View>
//      </Modal>
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    backgroundColor: '#fff',
//  },
//  dayContainer: {
//    alignItems: 'center',
//    justifyContent: 'center',
//  },
//  dayText: {
//    fontSize: 16,
//  },
//  eventBackground: {
//    backgroundColor: '#F0F0F0',  // Gray background
//    paddingHorizontal: 4,
//    paddingVertical: 2,
//    borderRadius: 4,
//    marginTop: 2,
//  },
//  eventText: {
//    fontSize: 10,
//    color: '#333',
//  },
//  modalContent: {
//    backgroundColor: 'white',
//    padding: 20,
//    borderRadius: 10,
//  },
//  modalTitle: {
//    fontSize: 20,
//    fontFamily: 'Pretendard-Bold',
//    marginBottom: 20,
//  },
//  event: {
//    padding: 10,
//    borderBottomColor: '#ccc',
//    borderBottomWidth: 1,
//  },
//});
//
//export default FriendCalendarScreen;




//import React, { useState, useEffect, useCallback } from 'react';
//import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
//import { Calendar, LocaleConfig } from 'react-native-calendars';
//import Modal from 'react-native-modal';
//import axios from 'axios';
//import { useFocusEffect } from '@react-navigation/native';
//import { BASE_URL } from '@env'; // @env 모듈로 불러옴
//import CustomText from '../CustomTextProps';
//import AsyncStorage from '@react-native-async-storage/async-storage';
//import {SvgXml} from 'react-native-svg';
//import {svg} from '../../assets/svg';
//
//
//LocaleConfig.locales['ko'] = {
//  monthNames: [
//    '01월', '02월', '03월', '04월', '05월', '06월', '07월', '08월', '09월', '10월', '11월', '12월',
//  ],
//  monthNamesShort: [
//    '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월',
//  ],
//  dayNames: [
//    '일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일',
//  ],
//  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
//  today: '오늘',
//};
//LocaleConfig.defaultLocale = 'ko';
//
//const FriendCalendarScreen = ({ navigation }) => {
//  const [isModalVisible, setModalVisible] = useState(false);
//  const [selectedDate, setSelectedDate] = useState(null);
//  const [events, setEvents] = useState({});  // 날짜별 이벤트 리스트
//  const [allEvents, setAllEvents] = useState([]);  // 전체 이벤트 객체 저장
//  const fetchEvents = async () => {
//    try {
//      // JWT 토큰 가져오기
//      const jwtToken = await AsyncStorage.getItem('jwtToken');
//      if (!jwtToken) {
//          Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
//          return;
//      }
//      const response = await axios.get(`${BASE_URL}/task/myTask`, {
//        headers: {
//          Authorization: `Bearer ${jwtToken}`,
//        }
//      });
//      const data = response.data;
//
//      // 서버에서 받은 모든 데이터를 allEvents에 저장
//      setAllEvents(data);
//
//      // 서버에서 받은 데이터를 날짜별로 events 객체에 저장
//      const eventsData = data.reduce((acc, event) => {
//        const date = event.date; // assuming your event data has a `date` field
//        if (!acc[date]) {
//          acc[date] = [];
//        }
//        acc[date].push({ time: event.startTime, title: event.title, ...event });
//        return acc;
//      }, {});
//
//      console.log(eventsData);
//      setEvents(eventsData);
//    } catch (error) {
//      console.error('Error fetching events:', error);
//    }
//  };
//
//  // 화면이 포커스를 받을 때마다 fetchEvents를 호출하여 데이터를 갱신
//  useFocusEffect(
//    useCallback(() => {
//      fetchEvents();
//    }, [])
//  );
//
//  const handleDayPress = (day) => {
//    setSelectedDate(day.dateString);
//    setModalVisible(true);
//  };
//
//  const closeModal = () => {
//    setModalVisible(false);
//    setSelectedDate(null);
//  };
//
//  const handleEventPress = (event) => {
//    closeModal();
//    console.log(event.id);
//    navigation.navigate('EditScheduleScreen', { event });
//  };
//
//  return (
//    <View style={styles.container}>
//      <Calendar
//        onDayPress={handleDayPress}
//        markedDates={Object.keys(events).reduce((acc, date) => {
//          acc[date] = { marked: true, dotColor: 'blue' };
//          return acc;
//        }, {})}
//      />
//      <Modal isVisible={isModalVisible} onBackdropPress={closeModal}>
//        <View style={styles.modalContent}>
//          <CustomText style={styles.modalTitle}>
//            {selectedDate ? `${selectedDate}의 일정` : '일정이 없습니다.'}
//          </CustomText>
//          {events[selectedDate]?.length > 0 ? (
//            events[selectedDate].map((event, index) => (
//              <TouchableOpacity
//                key={index}
//                style={styles.event}
//                onPress={() => handleEventPress(event)}
//              >
//                <CustomText>{event.time}: {event.title}</CustomText>
//              </TouchableOpacity>
//            ))
//          ) : (
//            <CustomText>이날은 일정이 없습니다.</CustomText>
//          )}
//        </View>
//      </Modal>
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    backgroundColor: '#fff',
//  },
//  modalContent: {
//    backgroundColor: 'white',
//    padding: 20,
//    borderRadius: 10,
//  },
//  modalTitle: {
//    fontSize: 20,
//    fontFamily: 'Pretendard-Bold',
//    marginBottom: 20,
//  },
//  event: {
//    padding: 10,
//    borderBottomColor: '#ccc',
//    borderBottomWidth: 1,
//  },
//});
//
//export default FriendCalendarScreen;
