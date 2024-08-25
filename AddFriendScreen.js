import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

const AddFriendScreen = ({ navigation }) => {
  const [uuid, setUuid] = useState('');

  const handleAddFriend = async () => {
    if (uuid.trim() === '') {
      Alert.alert('Error', '유효한 UUID를 입력해주세요.');
      return;
    }

    // 친구 추가 로직 구현하기
    try {
      // 백엔드로 친구 추가 요청 보내기
      const response = await axios.post('http://10.0.2.2:8080/friendRequest', {
        friendId: uuid,
        caregiver: {
          id: '79662e03-77d7-420d-ba2d-320a1106ba4b',
          name: '보호자',
          phoneNumber: '01012345678',
          gender: 'MALE'
        }
      });

      if (response.status === 200) {
        Alert.alert('성공', '친구 요청이 완료되었습니다.');
        navigation.goBack();
      } else {
        Alert.alert('오류', '친구 요청에 실패하였습니다.');
      }
    } catch (error) {
    console.error(error);
    Alert.alert('오류', '친구 추가 중 오류가 발생하였습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>친구 코드 입력:</Text>
      <TextInput
        style={styles.input}
        placeholder="UUID"
        value={uuid}
        onChangeText={setUuid}
      />
      <Button title="친구 요청 보내기" onPress={handleAddFriend} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default AddFriendScreen;