import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

const CaregiverFriendsListScreen = ({ navigation }) => {
  const [friends, setFriends] = useState([]);
  // 보호자의 UUID를 하드코딩
  const caregiverId = '4d44d2f9-5891-4e94-b19b-6e998acd6e09';

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(`http://10.0.2.2:8080/friendRequest/getFriends/${caregiverId}`);
        setFriends(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert('오류', '프렌즈 리스트를 불러오는 중 오류가 발생하였습니다.');
      }
    };

    fetchFriends();
  }, [caregiverId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>프렌즈 리스트</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.toString()}
        renderItem={({ item }) => <Text style={styles.friend}>{item}</Text>}
      />
      <Button title="뒤로가기" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  friend: {
    fontSize: 18,
    marginVertical: 10,
  },
});

export default CaregiverFriendsListScreen;
