import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '@env'; // @env 모듈로 불러옴

const FriendCaregiverScreen = ({ navigation }) => {
  const [caregiver, setCaregiver] = useState(null);
  // 프렌즈의 UUID를 하드코딩
  const friendId = 'bc4527ff-9554-486f-865e-1364591a13f5';


  useEffect(() => {
    const fetchCaregiver = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/friendRequest/getCaregiver/${friendId}`);
        setCaregiver(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert('오류', '보호자 정보를 불러오는 중 오류가 발생하였습니다.');
      }
    };

    fetchCaregiver();
  }, [friendId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>나의 보호자</Text>
      {caregiver ? (
        <Text style={styles.caregiver}>{caregiver}</Text>
      ) : (
        <Text>보호자 정보가 없습니다.</Text>
      )}
      <Button title="뒤로가기" onPress={() => navigation.goBack()} color="#6495ED" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  caregiver: {
    fontSize: 18,
    marginVertical: 10,
  },
});

export default FriendCaregiverScreen;
