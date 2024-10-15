import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Linking, Platform } from 'react-native';
import Voice from 'react-native-voice'; // 음성 인식 라이브러리
import { GOOGLE_MAP_PLATFORM_API_KEY } from '@env'; // 구글 API 키 사용
import CustomText from './CustomTextProps';

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
      fetchNearbyHospitals(text);
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

  const fetchNearbyHospitals = (query) => {
    if (latitude && longitude) {
      const googlePlacesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1000&type=hospital&keyword=${query}&key=${GOOGLE_MAP_PLATFORM_API_KEY}`;

      fetch(googlePlacesUrl)
        .then((response) => response.json())
        .then((data) => {
          if (data.results) {
            setPlaces(data.results);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const handleCardPress = (place) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${place.name}&query_place_id=${place.place_id}`;
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>음성으로 아픈 부위를 말해 주세요</CustomText>
      <TouchableOpacity style={styles.voiceButton} onPress={startVoiceRecognition} disabled={isRecording}>
        <CustomText style={styles.buttonText}>{isRecording ? '녹음 중...' : '음성 인식 시작'}</CustomText>
      </TouchableOpacity>
      {isRecording && <CustomText style={styles.recordingText}>녹음 중...</CustomText>}
      <CustomText style={styles.recognizedText}>인식된 내용: {recognizedText}</CustomText>
      <FlatList
        data={places}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleCardPress(item)}>
            <View style={styles.card}>
              <CustomText style={styles.hospitalName}>{item.name}</CustomText>
              {item.photos && item.photos.length > 0 && (
                <Image
                  source={{
                    uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&key=${GOOGLE_MAP_PLATFORM_API_KEY}`,
                  }}
                  style={styles.hospitalImage}
                />
              )}
              <CustomText style={styles.text}>평점: {item.rating ? item.rating : 'N/A'}</CustomText>
              <CustomText style={styles.text}>주소: {item.vicinity}</CustomText>
            </View>
          </TouchableOpacity>
        )}
      />
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
    backgroundColor: '#007bff',
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
