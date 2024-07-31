// AddScheduleScreen.js

import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

const AddScheduleScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    console.log('Title:', title);
    console.log('Description:', description);
    // 여기에서 저장 로직을 추가할 수 있습니다.
    navigation.goBack(); // 이전 화면으로 돌아가기
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="제목"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="설명"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        multiline
      />
      <Button title="저장" onPress={handleSave} />
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
});

export default AddScheduleScreen;