import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';

const AddFriendScreen = ({ navigation }) => {
  const [uuid, setUuid] = useState('');

  const handleAddFriend = () => {
    if (uuid.trim() === '') {
      Alert.alert('Error', 'Please enter a valid UUID.');
      return;
    }

    // 친구 추가 로직 구현하기


    Alert.alert('Success', 'Friend has been added successfully!');
    navigation.goBack();
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