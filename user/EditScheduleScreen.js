import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { BASE_URL } from '@env'; // @env 모듈로 불러옴

const EditScheduleScreen = ({ route, navigation }) => {
  // route.params에서 event 객체를 가져옴
  const { event } = route.params;

  // event 객체에서 title과 memo 값을 초기 상태로 설정
  const [id, setId] = useState(event.id);
  const [title, setTitle] = useState(event?.title || '일정 제목');
  const [memo, setMemo] = useState(event?.memo || '일정 설명');

  // 컴포넌트가 처음 렌더링될 때 event 객체의 값을 상태로 설정
  useEffect(() => {
    if (event) {
      setId(event.id);  // id도 상태로 설정
      setTitle(event.title);
      setMemo(event.memo);
    }
  }, [event]);  // event가 변경될 때마다 이 effect가 실행됨

  console.log(BASE_URL); //BASE_URL이 안불러와지는 에러 해결

  const handleSave = async () => {
    try {
      const response = await fetch(`${BASE_URL}/task/update`, {
        method: 'POST', // PUT일 수도 있음
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          title,
          memo,
        }),
      });

      if (response.ok) {
        console.log('Save successful:', { title, memo });
        Alert.alert('저장 성공', '일정이 성공적으로 저장되었습니다.');
        // 삭제 후 이전 화면으로 돌아가기
        navigation.goBack();
      } else {
        console.log('Save failed');
        Alert.alert('저장 실패', '일정을 저장하는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('저장 실패', '일정을 저장하는 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${BASE_URL}/task`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        Alert.alert('삭제 성공', '리소스가 성공적으로 삭제되었습니다.');
        console.log("삭제 성공");

        // 삭제 후 이전 화면으로 돌아가기
        navigation.goBack();
      } else {
        const errorData = await response.json();
        Alert.alert('삭제 실패', `오류: ${errorData.message}`);
      }
    } catch (error) {
      Alert.alert('오류', `요청을 처리하는 중 오류가 발생했습니다: ${error.message}`);
    }
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
        value={memo}
        onChangeText={setMemo}
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
    color: '#000000',
  },
});

export default EditScheduleScreen;
