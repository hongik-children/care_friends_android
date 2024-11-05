import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Linking, Platform } from 'react-native';
import Voice from 'react-native-voice'; // 음성 인식 라이브러리
import { GOOGLE_MAP_PLATFORM_API_KEY } from '@env'; // 구글 API 키 사용
import { OPENAI_API_KEY } from '@env'; // 구글 API 키 사용
import CustomText from './CustomTextProps';
import axios from 'axios';

const VoiceSearchScreen = ({ route, navigation }) => {
  const [recognizedText, setRecognizedText] = useState('');
  const [places, setPlaces] = useState([]);
  const [isRecording, setIsRecording] = useState(false); // 녹음 상태 추가
  const { latitude, longitude } = route.params;

  useEffect(() => {
    // Voice 라이브러리 초기화
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    // 컴포넌트 언마운트 시 리스너 해제
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const handleAreaPress = (area) => {
      navigation.navigate('RecommendScreen', {
          latitude: latitude,
          longitude: longitude,
          selectedArea: area
      });
  };

  const onSpeechStart = (event) => {
    console.log('onSpeechStart: ', event);
    setIsRecording(true); // 녹음 시작 시 상태 업데이트
  };

  const onSpeechEnd = (event) => {
    console.log('onSpeechEnd: ', event);
    setIsRecording(false); // 녹음 종료 시 상태 업데이트
  };

  const onSpeechResults = (event) => {
    console.log('onSpeechResults: ', event);
    if (event.value && event.value.length > 0) {
      const text = event.value[0];
      setRecognizedText(text);
      generateAnswer(text);
//      handleAreaPress(text);

    }
    setIsRecording(false); // 결과가 나왔을 때 녹음 중 상태 해제
  };

  const onSpeechError = (event) => {
    console.error('onSpeechError: ', event);
    setIsRecording(false); // 오류 발생 시 녹음 중 상태 해제
  };

  const startVoiceRecognition = async () => {
    try {
      setIsRecording(true); // 음성 인식 시작 시 녹음 중 상태 설정
      if (Platform.OS === 'android') {
        await Voice.start('ko-KR'); // 한국어로 음성 인식 시작
      } else {
        await Voice.start('ko-KR');
      }
    } catch (e) {
      console.error('Voice start error: ', e);
      setIsRecording(false); // 오류 시 녹음 상태 해제
    }
  };

  // 지피티 요청 함수

  async function generateAnswer(prompt) {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "사용자는 병원종류를 추천해달라고 할꺼야. 병원종류만 대답하면돼." },
          { role: "user", content: prompt + " 길게 대답하지말고 병원 종류만 딱 대답해줘 ex) 안과, 정형외과, 이비인후과, 비뇨기과, 신경외과, 치과, 정신과, 한의원" }
        ],
        max_tokens: 100,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        }
      });

      const answer = response.data.choices[0].message.content;
      console.log("답변:", answer);


      handleAreaPress(answer); // gpt 답변결과로 병원 추천
      return answer;
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
    }
  }

  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>음성으로 아픈 부위를 말해 주세요</CustomText>
      <TouchableOpacity style={styles.voiceButton} onPress={startVoiceRecognition} disabled={isRecording}>
        <CustomText style={styles.buttonText}>{isRecording ? '녹음 중...' : '음성 인식 시작'}</CustomText>
      </TouchableOpacity>
      {isRecording && <CustomText style={styles.recordingText}>녹음 중...</CustomText>}
      <CustomText style={styles.recognizedText}>인식된 내용: {recognizedText}</CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    textAlign: 'center',
  },
  voiceButton: {
    backgroundColor: '#6495ED',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
  },
  recordingText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  recognizedText: {
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  hospitalName: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    marginBottom: 8,
  },
  hospitalImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#666',
  },
});

export default VoiceSearchScreen;
