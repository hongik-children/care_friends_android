import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomText from '../CustomTextProps';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <CustomText style={styles.text}>내정보 화면</CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
  },
});

export default ProfileScreen;
