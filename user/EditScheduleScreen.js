import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Alert, Pressable, Text, ScrollView, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';

const EditScheduleScreen = ({ route, navigation }) => {
    const { event } = route.params;  // 전달된 event 데이터를 받아옴
    const [taskId, setTaskId] = useState(event.taskId);
    const [task, setTask] = useState({});
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [memo, setMemo] = useState('');

    useEffect(() => {
        fetchTask();

        const backAction = () => {
            navigation.goBack();  // 뒤로 가기
            return true;  // 기본 동작을 막고 커스텀 동작 실행
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();  // 클린업
    }, []);

    useEffect(() => {
        // task 데이터가 로드되면 상태 업데이트
        if (task) {
            setTitle(task.title || '');
            setLocation(task.location || '');
            setMemo(task.memo || '');
        }
    }, [task]);

    const handleSave = async () => {
        try {
            const jwtToken = await AsyncStorage.getItem('jwtToken');
            const updatedTask = {
                title,
                location,
                memo,
            };
            // PUT 요청으로 API에 수정 요청
            const response = await axios.put(`${BASE_URL}/task/${taskId}`, updatedTask, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            console.log('Updated event:', response.data);
            Alert.alert('성공', '일정이 성공적으로 수정되었습니다.');
            navigation.goBack();  // 저장 후 이전 화면으로 돌아감
        } catch (error) {
            console.error('일정 수정 오류:', error);
            Alert.alert('오류', '일정 수정 중 오류가 발생했습니다.');
        }
    };

     const handleDelete = async () => {
         try {
             const jwtToken = await AsyncStorage.getItem('jwtToken');
             await axios.delete(`${BASE_URL}/task`, {
                 headers: {
                     Authorization: `Bearer ${jwtToken}`,
                 },
                 data: {
                     id: taskId,
                 },
             });

             Alert.alert("삭제 완료", "일정이 성공적으로 삭제되었습니다.");

             // 이전 화면으로 돌아가기
             navigation.goBack();  // navigation을 통해 전 화면으로 이동
         } catch (error) {
             console.error('일정 삭제 실패:', error);
             Alert.alert("삭제 실패", "일정을 삭제하는 중 문제가 발생했습니다.");
         }
     };

    const fetchTask = async () => {
        try {
            const jwtToken = await AsyncStorage.getItem('jwtToken');
            const response = await axios.get(`${BASE_URL}/task/taskID/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            const data = response.data;
            setTask(data);
        } catch (error) {
            console.error('일정 불러오기 오류:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* 제목 입력 */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>제목</Text>
                <TextInput
                    placeholder="제목을 입력하세요"
                    value={title}  // title을 상태에서 가져옴
                    onChangeText={setTitle}
                    style={styles.input}
                    placeholderTextColor={'#aaa'}
                />
            </View>

            {/* 위치 입력 */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>위치</Text>
                <TextInput
                    placeholder="위치를 입력하세요"
                    value={location}  // location을 상태에서 가져옴
                    onChangeText={setLocation}
                    style={styles.input}
                    placeholderTextColor={'#aaa'}
                />
            </View>

            {/* 메모 입력 */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>메모</Text>
                <TextInput
                    placeholder="메모를 입력하세요"
                    value={memo}  // memo를 상태에서 가져옴
                    onChangeText={setMemo}
                    style={styles.input}
                    multiline
                    placeholderTextColor={'#aaa'}
                />
            </View>

            {/* 저장 버튼 */}
            <Pressable
                style={styles.saveButton}
                onPress={handleSave}>
                <Text style={styles.saveButtonText}>저장</Text>
            </Pressable>

            {/* 삭제 버튼 */}
            <Pressable
                style={styles.deleteButton}
                onPress={handleDelete}>
                <Text style={styles.saveButtonText}>삭제</Text>
            </Pressable>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 16,
        color: '#000',
    },
    saveButton: {
        borderRadius: 6,
        height: 48,
        backgroundColor: '#6495ED',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    deleteButton: {
        borderRadius: 6,
        height: 48,
        backgroundColor: '#FF4C4C',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
    },
});

export default EditScheduleScreen;



//import React, { useState, useEffect } from 'react';
//import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
//import { BASE_URL } from '@env'; // @env 모듈로 불러옴
//
//const EditScheduleScreen = ({ route, navigation }) => {
//  // route.params에서 event 객체를 가져옴
//  const { event } = route.params;
//
//  // event 객체에서 title과 memo 값을 초기 상태로 설정
//  const [id, setId] = useState(event.id);
//  const [title, setTitle] = useState(event?.title || '일정 제목');
//  const [memo, setMemo] = useState(event?.memo || '일정 설명');
//
//  // 컴포넌트가 처음 렌더링될 때 event 객체의 값을 상태로 설정
//  useEffect(() => {
//    if (event) {
//      setId(event.id);  // id도 상태로 설정
//      setTitle(event.title);
//      setMemo(event.memo);
//    }
//  }, [event]);  // event가 변경될 때마다 이 effect가 실행됨
//
//  console.log(BASE_URL); //BASE_URL이 안불러와지는 에러 해결
//
//  const handleSave = async () => {
//    try {
//      const response = await fetch(`${BASE_URL}/task/update`, {
//        method: 'POST', // PUT일 수도 있음
//        headers: {
//          'Content-Type': 'application/json',
//        },
//        body: JSON.stringify({
//          id,
//          title,
//          memo,
//        }),
//      });
//
//      if (response.ok) {
//        console.log('Save successful:', { title, memo });
//        Alert.alert('저장 성공', '일정이 성공적으로 저장되었습니다.');
//        // 삭제 후 이전 화면으로 돌아가기
//        navigation.goBack();
//      } else {
//        console.log('Save failed');
//        Alert.alert('저장 실패', '일정을 저장하는 중 오류가 발생했습니다.');
//      }
//    } catch (error) {
//      console.error('Error:', error);
//      Alert.alert('저장 실패', '일정을 저장하는 중 오류가 발생했습니다.');
//    }
//  };
//
//  const handleDelete = async () => {
//    try {
//      const response = await fetch(`${BASE_URL}/task`, {
//        method: 'DELETE',
//        headers: {
//          'Content-Type': 'application/json',
//        },
//        body: JSON.stringify({ id }),
//      });
//
//      if (response.ok) {
//        Alert.alert('삭제 성공', '리소스가 성공적으로 삭제되었습니다.');
//        console.log("삭제 성공");
//
//        // 삭제 후 이전 화면으로 돌아가기
//        navigation.goBack();
//      } else {
//        const errorData = await response.json();
//        Alert.alert('삭제 실패', `오류: ${errorData.message}`);
//      }
//    } catch (error) {
//      Alert.alert('오류', `요청을 처리하는 중 오류가 발생했습니다: ${error.message}`);
//    }
//  };
//
//  return (
//    <View style={styles.container}>
//      <TextInput
//        placeholder="제목"
//        value={title}
//        onChangeText={setTitle}
//        style={styles.input}
//      />
//      <TextInput
//        placeholder="설명"
//        value={memo}
//        onChangeText={setMemo}
//        style={styles.input}
//        multiline
//      />
//      <Button title="저장" onPress={handleSave} />
//      <Button title="삭제" onPress={handleDelete} color="red" />
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    padding: 20,
//    backgroundColor: '#FFFFFF',
//  },
//  input: {
//    height: 50,
//    borderColor: '#CCCCCC',
//    borderWidth: 1,
//    marginBottom: 20,
//    paddingHorizontal: 10,
//    color: '#000000',
//  },
//});
//
//export default EditScheduleScreen;
