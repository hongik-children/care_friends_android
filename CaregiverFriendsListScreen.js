import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '@env'; // @env 모듈로 불러옴

const CaregiverFriendsListScreen = ({ navigation }) => {
  const [friends, setFriends] = useState([]);
  // 보호자의 UUID를 하드코딩
  const caregiverId = '2ee4ee2e-344d-4abb-b78f-30a38cc0f839';

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/friendRequest/getFriends/${caregiverId}`);
        setFriends(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert('오류', '프렌즈 리스트를 불러오는 중 오류가 발생하였습니다.');
      }
    };

    fetchFriends();
  }, [caregiverId]);

  // 프렌드 ID 리스트 항목 렌더링
  const renderFriendItem = ({ item }) => (
    <View style={styles.friendItem}>
      <Text style={styles.friendId}>{item}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>프렌즈 리스트</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.toString()}
        renderItem={renderFriendItem}
      />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>뒤로가기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  friendItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  friendId: {
    fontSize: 16,
    color: '#333',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#6495ED',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CaregiverFriendsListScreen;
