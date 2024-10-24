import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import CustomText from './CustomTextProps';

const SelectPainAreaScreen = ({ route, navigation }) => {
  const [selectedArea, setSelectedArea] = useState(''); // 선택된 부위를 상태로 저장
  const { latitude, longitude } = route.params;

  const handleAreaPress = (area) => {
    setSelectedArea(area); // 부위를 누르면 상태 업데이트
    navigation.navigate('RecommendScreen', {
        latitude: latitude,
        longitude: longitude,
        selectedArea: area
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.bodyContainer}>
        <Image
          source={require('./assets/body_front.jpg')}
          style={styles.bodyImage}
          resizeMode="contain"
        />
        {/* Head Button */}
        <TouchableOpacity
          style={[styles.touchableArea, { top: '20%', left: '63%' }]}
          onPress={() => handleAreaPress('신경외과')}
        />
        {/* Shoulder Button */}
        <TouchableOpacity
          style={[styles.touchableArea, { top: '30%', left: '74%' }]}
          onPress={() => handleAreaPress('한의원')}
        />
        {/* Stomach Button */}
        <TouchableOpacity
          style={[styles.touchableArea, { top: '42%', left: '64%' }]}
          onPress={() => handleAreaPress('내과')}
        />
        {/* Leg Button */}
        <TouchableOpacity
          style={[styles.touchableArea, { top: '60%', left: '57%' }]}
          onPress={() => handleAreaPress('정형외과')}
        />
      </View>
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
  selectedText: {
    fontSize: 18,
    marginBottom: 16,
    color: '#555',
    textAlign: 'center',
  },
  bodyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyImage: {
    width: '100%',
    height: '80%',
    position: 'absolute',
  },
  touchableArea: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 0, 0, 0.3)', // 반투명 색상으로 영역 표시
    borderRadius: 25,
  },
});

export default SelectPainAreaScreen;
