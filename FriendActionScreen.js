import React from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import CustomText from './CustomTextProps';

const FriendActionScreen = ({ route, navigation }) => {
  const { friend } = route.params;

  const handleCall = () => {
    const phoneNumber = `tel:${friend.phoneNumber}`;
    Linking.openURL(phoneNumber)
      .catch(err => console.error('Error calling phone number', err));
  };

  const handleSendMessage = () => {
    const sms = `sms:${friend.phoneNumber}`;
    Linking.openURL(sms)
      .catch(err => console.error('Error sending SMS', err));
  };

  const handleAddSchedule = () => {
    navigation.navigate('AddScheduleScreen', { friend });
  };

  const handleCheckLocation = () => {
    Alert.alert('위치 확인하기', `${friend.name}님의 위치를 확인합니다.`);
  };

  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>{friend.name}님에게</CustomText>

      <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
        <Feather name="phone" size={24} color="#fff" />
        <CustomText style={styles.actionButtonText}>전화 걸기</CustomText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleSendMessage}>
        <Feather name="message-circle" size={24} color="#fff" />
        <CustomText style={styles.actionButtonText}>문자 보내기</CustomText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleAddSchedule}>
        <Feather name="calendar" size={24} color="#fff" />
        <CustomText style={styles.actionButtonText}>일정 추가하기</CustomText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleCheckLocation}>
        <Feather name="map-pin" size={24} color="#fff" />
        <CustomText style={styles.actionButtonText}>위치 확인하기</CustomText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6495ED',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
});

export default FriendActionScreen;
