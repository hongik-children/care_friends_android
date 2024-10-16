import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import CustomText from '../CustomTextProps';
import KakaoLoginScreen from '../user/KakaoLoginScreen';

const OnboardingScreen = ({ navigation }) => {
  return (
    <Onboarding
      nextLabel={<CustomText style={styles.navigationText}>다음</CustomText>}
      bottomBarHighlight={false}
      showSkip={false}
      showDone={false}
      pages={[
        {
          backgroundColor: '#fff',
          image: <Image source={require('../android/app/src/main/assets/image/waving-hand_1f44b.png')} style={styles.image} />,
          title: '안녕하세요. 케어프렌즈입니다.',
          subtitle: '케어프렌즈 앱에 오신 것을 환영합니다.',
          titleStyles: styles.title,
          subTitleStyles: styles.subtitle,
        },
        {
          backgroundColor: '#fff',
          image: <Image source={require('../android/app/src/main/assets/image/image2.jpg')} style={styles.largeImage} />,
          title: '케어프렌즈와 함께',
          subtitle: '더 편리한 일상을 경험해보세요.',
          titleStyles: styles.title,
          subTitleStyles: styles.subtitle,
        },
        {
          backgroundColor: '#fff',
          image: null,
          title: null,
          subtitle: <KakaoLoginScreen navigation={navigation} />,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: 150,
    height: 150,
  },
  largeImage: {
    width: 300,
    height: 200,
  },
  title: {
    fontFamily: 'Pretendard-ExtraBold',
    fontSize: 24,
    color: '#333',
  },
  subtitle: {
    fontFamily: 'Pretendard-Bole',
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    borderRadius: 40,
    width: 250,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  kakaoButtonText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    color: '#000',
  },
  navigationText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    color: '#5A7596',
  },
  loginContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OnboardingScreen;
