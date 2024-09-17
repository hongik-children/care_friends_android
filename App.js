import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ScheduleScreen from './caregiver/ScheduleScreen';
import imgUpload from './user/ImgUpload';
import CalendarScreen from './user/CalendarScreen';
import NotificationScreen from './friend/NotificationScreen';
import ProfileScreen from './user/ProfileScreen';
import AddScheduleScreen from './user/AddScheduleScreen';
import EditScheduleScreen from './user/EditScheduleScreen';
import messaging from '@react-native-firebase/messaging';
import AddFriendScreen from './caregiver/AddFriendScreen';
import FriendsRequestListScreen from './friend/FriendsRequestListScreen';
import CaregiverFriendsListScreen from './caregiver/CaregiverFriendsListScreen';
import FriendCaregiverScreen from './caregiver/FriendCaregiverScreen';
import KakaoLoginScreen from './user/KakaoLoginScreen';
import SignupScreen from './user/SignupScreen';
import UserTypeSelectionScreen from './user/UserTypeSelectionScreen';
import SplashScreen from './SplashScreen';
import { Linking, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FriendActionScreen from './caregiver/FriendActionScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ScheduleScreen" component={ScheduleScreen} options={{ headerShown: false }} />
    <Stack.Screen name="imgUpload" component={imgUpload} options={{ headerShown: false }} />
    <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AddScheduleScreen" component={AddScheduleScreen} options={{ title: '일정 추가하기' }} />
    <Stack.Screen name="EditScheduleScreen" component={EditScheduleScreen} options={{ title: '일정 수정하기' }} />
    <Stack.Screen name="AddFriendScreen" component={AddFriendScreen} options={{ title: '친구 추가하기' }} />
    <Stack.Screen name="FriendsRequestListScreen" component={FriendsRequestListScreen} options={{ title: '친구 요청 리스트 조회' }} />
    <Stack.Screen name="CaregiverFriendsListScreen" component={CaregiverFriendsListScreen} options={{ title: '나의 프렌즈' }} />
    <Stack.Screen name="FriendCaregiverScreen" component={FriendCaregiverScreen} options={{ title: '나의 보호자' }} />
    <Stack.Screen name="KakaoLoginScreen" component={KakaoLoginScreen} options={{ title: '카카오 로그인' }} />
    <Stack.Screen name="SignupScreen" component={SignupScreen} />
    <Stack.Screen name="UserTypeSelection" component={UserTypeSelectionScreen} options={{ title: '회원 유형 선택' }} />
    <Stack.Screen name="FriendActionScreen" component={FriendActionScreen} options={{ title: '프렌즈 관리' }} />
  </Stack.Navigator>
);

const CalendarStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="CalendarScreen" component={CalendarScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

// 수동 쿼리 파라미터 파싱 함수
const getQueryParams = (queryString) => {
  return queryString
    ? queryString
        .split('&')
        .reduce((acc, param) => {
          const [key, value] = param.split('=');
          acc[key] = decodeURIComponent(value);
          return acc;
        }, {})
    : {};
};

const App = () => {
  const navigationRef = useRef(null);

  const handleDeepLink = ({ url }) => {
    const route = url.replace(/.*?:\/\//g, ''); // 스킴을 제거하고 경로만 남김
    const [path, query] = route.split('?');

    if (path === 'signup') {
      const params = getQueryParams(query); // 쿼리 파라미터 파싱
      const email = params.email;
      navigationRef.current?.navigate('UserTypeSelection', { email });
    } else {
      Alert.alert('잘못된 경로입니다.', url);
    }
  };

  useEffect(() => {
    // 앱이 처음 시작할 때 전달된 URL 처리
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // 앱이 포그라운드로 돌아올 때 URL 이벤트 처리
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Calendar') {
            iconName = 'calendar';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          }

            return <Feather name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6495ED',
          tabBarInactiveTintColor: '#8e8e93',
          tabBarStyle: { paddingVertical: 5, backgroundColor: '#f8f8f8', height: 60 },
          tabBarLabelStyle: { fontSize: 16, fontFamily: 'Pretendard-SemiBold' },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Calendar" component={CalendarStack} />
        <Tab.Screen name="Profile" component={ProfileStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const getFcmToken = async () => {
  const fcmToken = await messaging().getToken();
  console.log('[FCM Token] ', fcmToken);
};

export default App;