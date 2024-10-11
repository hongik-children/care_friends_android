import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Pressable, Text, ScrollView } from 'react-native';
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
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
    },
});

export default EditScheduleScreen;
