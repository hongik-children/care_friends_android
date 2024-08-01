// EditScheduleScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

const EditScheduleScreen = () => {
  const [title, setTitle] = useState('일정 제목');
  const [description, setDescription] = useState('일정 설명');

  const handleSave = () => {
    // 저장 로직 추가 (현재는 정적인 화면)
    console.log('Save:', { title, description });
  };

  const handleDelete = () => {
    // 삭제 로직 추가 (현재는 정적인 화면)
    console.log('Delete event');
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
      <Button title="삭제" onPress={handleDelete} color="red" />
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

export default EditScheduleScreen;
