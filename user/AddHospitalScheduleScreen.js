import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Linking, Platform, Alert, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, NAVER_CLOUD_ID, NAVER_CLOUD_SECRET, GOOGLE_MAP_PLATFORM_API_KEY, BASE_URL } from '@env';

const AddHospitalScheduleScreen = ({ route, navigation }) => {
  const { hospitalName, naverMapUrl } = route.params || {};
  const [visitDate, setVisitDate] = useState(new Date());
  const [visitTime, setVisitTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [inputHospitalName, setInputHospitalName] = useState(hospitalName || '');
  const [naverMapLink, setNaverMapLink] = useState(naverMapUrl || '');
  const [hospitalAddress, setHospitalAddress] = useState(''); // 선택된 병원 주소
  const [memo, setMemo] = useState('');
  const [searchResults, setSearchResults] = useState([]); // 검색 결과 저장

  const handleOpenMap = () => {
    if (naverMapLink) {
      console.log("네이버 지도 링크:", naverMapLink); // 링크 로그 출력
      Linking.openURL(naverMapLink).catch(err => console.error("Couldn't load page", err));
    } else {
      console.log("naverMapLink가 설정되지 않았습니다.");
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || visitDate;
    setShowDatePicker(false);
    setVisitDate(currentDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || visitTime;
    setShowTimePicker(false);
    setVisitTime(currentTime);
  };


  // 진료 일정 저장 API 요청
  const handleScheduleSave = async () => {
    if (!inputHospitalName || !hospitalAddress) {
      Alert.alert("병원 이름과 주소를 입력하거나 선택해주세요.");
      return;
    }

    const payload = {
      title: inputHospitalName,
      link: naverMapLink,
      address: hospitalAddress,
      telephone: "", // 병원 전화번호가 있다면 추가
      date: visitDate.toISOString().split('T')[0],
      time: visitTime.toTimeString().split(' ')[0],
      memo: memo,
    };

    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!jwtToken) {
        Alert.alert("오류", "JWT 토큰을 찾을 수 없습니다. 다시 로그인하세요.");
        return;
      }

      console.log(BASE_URL); //BASE_URL이 안불러와지는 에러 해결
      const apiUrl = `${BASE_URL}/treatment`; // API URL

      const response = await axios.post(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${jwtToken}`, // 토큰을 가져오는 함수로 토큰 추가
        },
      });

      if (response.status === 200) {
        Alert.alert("일정이 성공적으로 저장되었습니다.");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      Alert.alert("일정 저장 중 오류가 발생했습니다.");
    }
  };

  // 병원 검색 함수
  const handleSearchHospital = () => {
    if (!inputHospitalName.trim()) {
      Alert.alert("병원 이름을 입력해주세요.");
      return;
    }

    const searchUrl = `https://openapi.naver.com/v1/search/local.json?query=${inputHospitalName}&display=5&start=1&sort=random`;

    fetch(searchUrl, {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          setSearchResults(data.items); // 모든 검색 결과를 저장
        } else {
          Alert.alert("검색 결과가 없습니다.");
          setSearchResults([]); // 결과가 없을 경우 빈 배열 설정
        }
      })
      .catch((error) => {
        console.error(error);
        Alert.alert("검색 중 오류가 발생했습니다.");
      });
  };

  // 병원 선택 핸들러
  const handleSelectHospital = (hospital) => {
    const cleanHospitalName = hospital.title.replace(/<[^>]+>/g, ''); // 병원 이름에서 HTML 태그 제거
    setInputHospitalName(cleanHospitalName);
    setHospitalAddress(hospital.roadAddress);

    // 병원 이름과 주소를 결합하여 URL 생성
    const searchQuery = `${cleanHospitalName} ${hospital.roadAddress}`;
    setNaverMapLink(`https://map.naver.com/v5/search/${encodeURIComponent(searchQuery)}`);

    setSearchResults([]); // 선택 후 검색 결과 숨기기
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>방문 일정 추가</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="병원 이름 입력"
          value={inputHospitalName}
          onChangeText={setInputHospitalName}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchHospital}>
          <Text style={styles.searchButtonText}>검색</Text>
        </TouchableOpacity>
      </View>

      {/* 검색 결과 리스트 표시 */}
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => `${item.link}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectHospital(item)}>
              <Text style={styles.resultTitle}>{item.title.replace(/<[^>]+>/g, '')}</Text>
              <Text style={styles.resultAddress}>{item.roadAddress}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {hospitalAddress ? (
        <Text style={styles.label}>주소: {hospitalAddress}</Text>
      ) : null}

      {naverMapLink && (
        <TouchableOpacity onPress={handleOpenMap}>
          <Text style={styles.mapLink}>네이버 지도에서 보기</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.label}>방문 예정 날짜</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateButtonText}>{visitDate.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={visitDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.label}>방문 예정 시간</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.dateButtonText}>{visitTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={visitTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <Text style={styles.label}>메모</Text>
      <TextInput
        style={[styles.input, styles.memoInput]}
        placeholder="메모를 입력하세요"
        value={memo}
        onChangeText={setMemo}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleScheduleSave}>
        <Text style={styles.saveButtonText}>일정 저장</Text>
      </TouchableOpacity>
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
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    padding: 12,
    fontSize: 16,
    borderRadius: 5,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  searchButton: {
    backgroundColor: '#6495ED',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultAddress: {
    fontSize: 14,
    color: '#666',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  mapLink: {
    fontSize: 16,
    color: '#1E90FF',
    marginBottom: 16,
    textDecorationLine: 'underline',
  },
  dateButton: {
    backgroundColor: '#E8EAF6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#6495ED',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddHospitalScheduleScreen;




//import React, { useState } from 'react';
//import { View, Text, TextInput, TouchableOpacity, StyleSheet, Linking, Platform, Alert } from 'react-native';
//import DateTimePicker from '@react-native-community/datetimepicker';
//import { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, NAVER_CLOUD_ID, NAVER_CLOUD_SECRET, GOOGLE_MAP_PLATFORM_API_KEY } from '@env';
//
//const AddHospitalScheduleScreen = ({ route, navigation }) => {
//  const { hospitalName, naverMapUrl } = route.params || {};
//  const [visitDate, setVisitDate] = useState(new Date());
//  const [visitTime, setVisitTime] = useState(new Date());
//  const [showDatePicker, setShowDatePicker] = useState(false);
//  const [showTimePicker, setShowTimePicker] = useState(false);
//  const [inputHospitalName, setInputHospitalName] = useState(hospitalName || '');
//  const [naverMapLink, setNaverMapLink] = useState(naverMapUrl || '');
//  const [hospitalAddress, setHospitalAddress] = useState(''); // 검색된 병원 주소
//  const [memo, setMemo] = useState('');
//
//  const handleOpenMap = () => {
//    if (naverMapLink) {
//      Linking.openURL(naverMapLink).catch(err => console.error("Couldn't load page", err));
//    }
//  };
//
//  const handleDateChange = (event, selectedDate) => {
//    const currentDate = selectedDate || visitDate;
//    setShowDatePicker(false);
//    setVisitDate(currentDate);
//  };
//
//  const handleTimeChange = (event, selectedTime) => {
//    const currentTime = selectedTime || visitTime;
//    setShowTimePicker(false);
//    setVisitTime(currentTime);
//  };
//
//  const handleScheduleSave = () => {
//    console.log("Scheduled visit:", inputHospitalName, hospitalAddress, visitDate.toDateString(), visitTime.toLocaleTimeString(), memo);
//    navigation.goBack();
//  };
//
//  // 병원 검색 함수
//  const handleSearchHospital = () => {
//    if (!inputHospitalName.trim()) {
//      Alert.alert("병원 이름을 입력해주세요.");
//      return;
//    }
//
//    const searchUrl = `https://openapi.naver.com/v1/search/local.json?query=${inputHospitalName}&display=1&start=1&sort=random`;
//
//    fetch(searchUrl, {
//      method: 'GET',
//      headers: {
//        'X-Naver-Client-Id': NAVER_CLIENT_ID,
//        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
//      },
//    })
//      .then((response) => response.json())
//      .then((data) => {
//        if (data.items && data.items.length > 0) {
//          const hospital = data.items[0];
//          setHospitalAddress(hospital.roadAddress);
//          setNaverMapLink(`https://map.naver.com/v5/search/${encodeURIComponent(hospital.title)}`);
//        } else {
//          Alert.alert("검색 결과가 없습니다.");
//        }
//      })
//      .catch((error) => {
//        console.error(error);
//        Alert.alert("검색 중 오류가 발생했습니다.");
//      });
//  };
//
//  return (
//    <View style={styles.container}>
//      <Text style={styles.title}>방문 일정 추가</Text>
//
//      <View style={styles.searchContainer}>
//        <TextInput
//          style={styles.input}
//          placeholder="병원 이름 입력"
//          value={inputHospitalName}
//          onChangeText={setInputHospitalName}
//        />
//        <TouchableOpacity style={styles.searchButton} onPress={handleSearchHospital}>
//          <Text style={styles.searchButtonText}>검색</Text>
//        </TouchableOpacity>
//      </View>
//
//      {/* 검색된 병원 정보 표시 */}
//      {hospitalAddress ? (
//        <Text style={styles.label}>주소: {hospitalAddress}</Text>
//      ) : null}
//
//      {naverMapLink && (
//        <TouchableOpacity onPress={handleOpenMap}>
//          <Text style={styles.mapLink}>네이버 지도에서 보기</Text>
//        </TouchableOpacity>
//      )}
//
//      <Text style={styles.label}>방문 예정 날짜</Text>
//      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
//        <Text style={styles.dateButtonText}>{visitDate.toLocaleDateString()}</Text>
//      </TouchableOpacity>
//      {showDatePicker && (
//        <DateTimePicker
//          value={visitDate}
//          mode="date"
//          display="default"
//          onChange={handleDateChange}
//        />
//      )}
//
//      <Text style={styles.label}>방문 예정 시간</Text>
//      <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
//        <Text style={styles.dateButtonText}>{visitTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
//      </TouchableOpacity>
//      {showTimePicker && (
//        <DateTimePicker
//          value={visitTime}
//          mode="time"
//          display="default"
//          onChange={handleTimeChange}
//        />
//      )}
//
//      <Text style={styles.label}>메모</Text>
//      <TextInput
//        style={[styles.input, styles.memoInput]}
//        placeholder="메모를 입력하세요"
//        value={memo}
//        onChangeText={setMemo}
//        multiline
//        numberOfLines={4}
//      />
//
//      <TouchableOpacity style={styles.saveButton} onPress={handleScheduleSave}>
//        <Text style={styles.saveButtonText}>일정 저장</Text>
//      </TouchableOpacity>
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    padding: 16,
//    backgroundColor: '#f9f9f9',
//  },
//  title: {
//    fontSize: 24,
//    fontFamily: 'Pretendard-Bold',
//    color: '#333',
//    marginBottom: 16,
//    textAlign: 'center',
//  },
//  searchContainer: {
//    flexDirection: 'row',
//    alignItems: 'center',
//    marginBottom: 10,
//  },
//  input: {
//    flex: 1,
//    borderWidth: 1,
//    padding: 12,
//    fontSize: 16,
//    borderRadius: 5,
//    borderColor: '#ddd',
//    backgroundColor: '#fff',
//  },
//  searchButton: {
//    backgroundColor: '#6495ED',
//    paddingVertical: 10,
//    paddingHorizontal: 15,
//    borderRadius: 5,
//    marginLeft: 10,
//  },
//  searchButtonText: {
//    color: '#fff',
//    fontSize: 16,
//  },
//  label: {
//    fontSize: 16,
//    color: '#333',
//    marginBottom: 8,
//  },
//  mapLink: {
//    fontSize: 16,
//    color: '#1E90FF',
//    marginBottom: 16,
//    textDecorationLine: 'underline',
//  },
//  dateButton: {
//    backgroundColor: '#E8EAF6',
//    paddingVertical: 10,
//    paddingHorizontal: 12,
//    borderRadius: 5,
//    marginBottom: 20,
//    alignItems: 'center',
//  },
//  dateButtonText: {
//    fontSize: 16,
//    color: '#333',
//  },
//  saveButton: {
//    backgroundColor: '#6495ED',
//    paddingVertical: 15,
//    borderRadius: 8,
//    alignItems: 'center',
//    marginTop: 20,
//  },
//  saveButtonText: {
//    color: '#fff',
//    fontSize: 18,
//    fontWeight: 'bold',
//  },
//});
//
//export default AddHospitalScheduleScreen;




//import React, { useState } from 'react';
//import { View, Text, TextInput, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
//import DateTimePicker from '@react-native-community/datetimepicker';
//
//const AddHospitalScheduleScreen = ({ route, navigation }) => {
//  const { hospitalName, naverMapUrl } = route.params || {};
//  const [visitDate, setVisitDate] = useState(new Date());
//  const [visitTime, setVisitTime] = useState(new Date());
//  const [showDatePicker, setShowDatePicker] = useState(false);
//  const [showTimePicker, setShowTimePicker] = useState(false);
//  const [inputHospitalName, setInputHospitalName] = useState(hospitalName || '');
//  const [memo, setMemo] = useState('');
//
//  const handleOpenMap = () => {
//    if (naverMapUrl) {
//      Linking.openURL(naverMapUrl).catch(err => console.error("Couldn't load page", err));
//    }
//  };
//
//  const handleDateChange = (event, selectedDate) => {
//    const currentDate = selectedDate || visitDate;
//    setShowDatePicker(false);
//    setVisitDate(currentDate);
//  };
//
//  const handleTimeChange = (event, selectedTime) => {
//    const currentTime = selectedTime || visitTime;
//    setShowTimePicker(false);
//    setVisitTime(currentTime);
//  };
//
//  const handleScheduleSave = () => {
//    console.log("Scheduled visit:", inputHospitalName, visitDate.toDateString(), visitTime.toLocaleTimeString(), memo);
//    navigation.goBack();
//  };
//
//  return (
//    <View style={styles.container}>
//      <Text style={styles.title}>방문 일정 추가</Text>
//
//      {hospitalName ? (
//        <Text style={styles.label}>병원 이름: {hospitalName}</Text>
//      ) : (
//        <TextInput
//          style={styles.input}
//          placeholder="병원 이름 입력"
//          value={inputHospitalName}
//          onChangeText={setInputHospitalName}
//        />
//      )}
//
//      {naverMapUrl && (
//        <TouchableOpacity onPress={handleOpenMap}>
//          <Text style={styles.mapLink}>네이버 지도에서 보기</Text>
//        </TouchableOpacity>
//      )}
//
//      {/* 방문 날짜 선택 */}
//      <Text style={styles.label}>방문 예정 날짜</Text>
//      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
//        <Text style={styles.dateButtonText}>{visitDate.toLocaleDateString()}</Text>
//      </TouchableOpacity>
//      {showDatePicker && (
//        <DateTimePicker
//          value={visitDate}
//          mode="date"
//          display="default"
//          onChange={handleDateChange}
//        />
//      )}
//
//      {/* 방문 시간 선택 */}
//      <Text style={styles.label}>방문 예정 시간</Text>
//      <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
//        <Text style={styles.dateButtonText}>{visitTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
//      </TouchableOpacity>
//      {showTimePicker && (
//        <DateTimePicker
//          value={visitTime}
//          mode="time"
//          display="default"
//          onChange={handleTimeChange}
//        />
//      )}
//
//      <Text style={styles.label}>메모</Text>
//      <TextInput
//        style={[styles.input, styles.memoInput]}
//        placeholder="메모를 입력하세요"
//        value={memo}
//        onChangeText={setMemo}
//        multiline
//        numberOfLines={4}
//      />
//
//      <TouchableOpacity style={styles.saveButton} onPress={handleScheduleSave}>
//        <Text style={styles.saveButtonText}>일정 저장</Text>
//      </TouchableOpacity>
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    padding: 16,
//    backgroundColor: '#f9f9f9',
//  },
//  title: {
//    fontSize: 24,
//    fontFamily: 'Pretendard-Bold',
//    color: '#333',
//    marginBottom: 16,
//    textAlign: 'center',
//  },
//  label: {
//    fontSize: 16,
//    color: '#333',
//    marginBottom: 8,
//  },
//  input: {
//    borderWidth: 1,
//    padding: 12,
//    marginBottom: 20,
//    fontSize: 16,
//    borderRadius: 5,
//    borderColor: '#ddd',
//    backgroundColor: '#fff',
//  },
//  memoInput: {
//    height: 100,
//    textAlignVertical: 'top',
//  },
//  mapLink: {
//    fontSize: 16,
//    color: '#1E90FF',
//    marginBottom: 16,
//    textDecorationLine: 'underline',
//  },
//  dateButton: {
//    backgroundColor: '#E8EAF6',
//    paddingVertical: 10,
//    paddingHorizontal: 12,
//    borderRadius: 5,
//    marginBottom: 20,
//    alignItems: 'center',
//  },
//  dateButtonText: {
//    fontSize: 16,
//    color: '#333',
//  },
//  saveButton: {
//    backgroundColor: '#6495ED',
//    paddingVertical: 15,
//    borderRadius: 8,
//    alignItems: 'center',
//    marginTop: 20,
//  },
//  saveButtonText: {
//    color: '#fff',
//    fontSize: 18,
//    fontWeight: 'bold',
//  },
//});
//
//export default AddHospitalScheduleScreen;





//// AddHospitalScheduleScreen.js
//import React, { useState } from 'react';
//import { View, Text, TextInput, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
//import DateTimePicker from '@react-native-community/datetimepicker';
//
//const AddHospitalScheduleScreen = ({ route, navigation }) => {
//  // 병원 이름과 네이버 지도 링크를 params로 전달받습니다.
//  const { hospitalName, naverMapUrl } = route.params || {};
//  const [visitDate, setVisitDate] = useState(new Date());
//  const [showDatePicker, setShowDatePicker] = useState(false);
//  const [inputHospitalName, setInputHospitalName] = useState(hospitalName || ''); // 초기값을 hospitalName 또는 빈 값으로 설정
//  const [memo, setMemo] = useState(''); // 메모 상태 추가
//
//  const handleOpenMap = () => {
//    if (naverMapUrl) {
//      Linking.openURL(naverMapUrl).catch(err => console.error("Couldn't load page", err));
//    }
//  };
//
//  const handleDateChange = (event, selectedDate) => {
//    const currentDate = selectedDate || visitDate;
//    setShowDatePicker(Platform.OS === 'ios'); // iOS는 항상 표시, Android는 선택 후 닫기
//    setVisitDate(currentDate);
//  };
//
//  const handleScheduleSave = () => {
//    // 일정 데이터를 저장하는 로직
//    console.log("Scheduled visit:", inputHospitalName, visitDate.toDateString(), memo);
//    navigation.goBack();
//  };
//
//  return (
//    <View style={styles.container}>
//      <Text style={styles.title}>방문 일정 추가</Text>
//
//      {/* 병원 정보가 전달된 경우 자동으로 표시, 그렇지 않으면 입력 필드 표시 */}
//      {hospitalName ? (
//        <Text style={styles.label}>병원 이름: {hospitalName}</Text>
//      ) : (
//        <TextInput
//          style={styles.input}
//          placeholder="병원 이름 입력"
//          value={inputHospitalName}
//          onChangeText={setInputHospitalName}
//        />
//      )}
//
//      {/* 네이버 지도 링크가 있을 경우에만 표시 */}
//      {naverMapUrl && (
//        <TouchableOpacity onPress={handleOpenMap}>
//          <Text style={styles.mapLink}>네이버 지도에서 보기</Text>
//        </TouchableOpacity>
//      )}
//
//      <Text style={styles.label}>방문 예정 날짜</Text>
//      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
//        <Text style={styles.dateButtonText}>{visitDate.toLocaleDateString()}</Text>
//      </TouchableOpacity>
//      {showDatePicker && (
//        <DateTimePicker
//          value={visitDate}
//          mode="date"
//          display="default"
//          onChange={handleDateChange}
//        />
//      )}
//
//      {/* 메모 입력 필드 */}
//      <Text style={styles.label}>메모</Text>
//      <TextInput
//        style={[styles.input, styles.memoInput]}
//        placeholder="메모를 입력하세요"
//        value={memo}
//        onChangeText={setMemo}
//        multiline
//        numberOfLines={4}
//      />
//
//      <TouchableOpacity style={styles.saveButton} onPress={handleScheduleSave}>
//        <Text style={styles.saveButtonText}>일정 저장</Text>
//      </TouchableOpacity>
//    </View>
//  );
//};
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    padding: 16,
//    backgroundColor: '#f9f9f9',
//  },
//  title: {
//    fontSize: 24,
//    fontFamily: 'Pretendard-Bold',
//    color: '#333',
//    marginBottom: 16,
//    textAlign: 'center',
//  },
//  label: {
//    fontSize: 16,
//    color: '#333',
//    marginBottom: 8,
//  },
//  input: {
//    borderWidth: 1,
//    padding: 12,
//    marginBottom: 20,
//    fontSize: 16,
//    borderRadius: 5,
//    borderColor: '#ddd',
//    backgroundColor: '#fff',
//  },
//  memoInput: {
//    height: 100,
//    textAlignVertical: 'top',
//  },
//  mapLink: {
//    fontSize: 16,
//    color: '#1E90FF',
//    marginBottom: 16,
//    textDecorationLine: 'underline',
//  },
//  dateButton: {
//    backgroundColor: '#E8EAF6',
//    paddingVertical: 10,
//    paddingHorizontal: 12,
//    borderRadius: 5,
//    marginBottom: 20,
//    alignItems: 'center',
//  },
//  dateButtonText: {
//    fontSize: 16,
//    color: '#333',
//  },
//  saveButton: {
//    backgroundColor: '#6495ED',
//    paddingVertical: 15,
//    borderRadius: 8,
//    alignItems: 'center',
//    marginTop: 20,
//  },
//  saveButtonText: {
//    color: '#fff',
//    fontSize: 18,
//    fontWeight: 'bold',
//  },
//});
//
//export default AddHospitalScheduleScreen;





