import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ScheduleScreen from './ScheduleScreen';
import imgUpload from './ImgUpload';
import CalendarScreen from './CalendarScreen';
import NotificationScreen from './NotificationScreen';
import ProfileScreen from './ProfileScreen';
import AddScheduleScreen from './AddScheduleScreen';
import EditScheduleScreen from './EditScheduleScreen';
import messaging from '@react-native-firebase/messaging';
import AddFriendScreen from './AddFriendScreen';
import FriendsRequestListScreen from './FriendsRequestListScreen';
import CaregiverFriendsListScreen from './CaregiverFriendsListScreen';
import FriendCaregiverScreen from './FriendCaregiverScreen';
import KakaoLoginScreen from './KakaoLoginScreen';
import SignupScreen from './SignupScreen';
import UserTypeSelectionScreen from './UserTypeSelectionScreen';
import SplashScreen from './SplashScreen';
import { Linking, Alert } from 'react-native';

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
              iconName = focused ? 'home' : 'home';
            } else if (route.name === 'Calendar') {
              iconName = focused ? 'calendar' : 'calendar-o';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'user' : 'user-o';
            }

            return <FontAwesome name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6495ED',
          tabBarInactiveTintColor: '#8e8e93',
          tabBarStyle: { paddingVertical: 5, backgroundColor: '#f8f8f8' },
          tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
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






//import React, { useEffect } from 'react';
//import { NavigationContainer } from '@react-navigation/native';
//import { createStackNavigator } from '@react-navigation/stack';
//import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
//import FontAwesome from 'react-native-vector-icons/FontAwesome';
//import ScheduleScreen from './ScheduleScreen';
//import imgUpload from './ImgUpload';
//import CalendarScreen from './CalendarScreen';
//import NotificationScreen from './NotificationScreen';
//import ProfileScreen from './ProfileScreen';
//import AddScheduleScreen from './AddScheduleScreen';
//import EditScheduleScreen from './EditScheduleScreen';
//import messaging from '@react-native-firebase/messaging';
//import AddFriendScreen from './AddFriendScreen';
//import FriendsRequestListScreen from './FriendsRequestListScreen';
//import CaregiverFriendsListScreen from './CaregiverFriendsListScreen';
//import FriendCaregiverScreen from './FriendCaregiverScreen';
//import KakaoLoginScreen from './KakaoLoginScreen';
//import SignupScreen from './SignupScreen';
//import UserTypeSelectionScreen from './UserTypeSelectionScreen';
//import { Linking } from 'react-native';
//import { Text } from 'react-native';
//
//const Stack = createStackNavigator();
//const Tab = createBottomTabNavigator();
//
//const HomeStack = () => (
//  <Stack.Navigator>
//    <Stack.Screen name="ScheduleScreen" component={ScheduleScreen} options={{ headerShown: false }} />
//    <Stack.Screen name="imgUpload" component={imgUpload} options={{ headerShown: false }} />
//    <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={{ headerShown: false }} />
//    <Stack.Screen name="AddScheduleScreen" component={AddScheduleScreen} options={{ title: '일정 추가하기' }} />
//    <Stack.Screen name="EditScheduleScreen" component={EditScheduleScreen} options={{ title: '일정 수정하기' }} />
//    <Stack.Screen name="AddFriendScreen" component={AddFriendScreen} options={{ title: '친구 추가하기' }} />
//    <Stack.Screen name="FriendsRequestListScreen" component={FriendsRequestListScreen} options={{ title: '친구 요청 리스트 조회' }} />
//    <Stack.Screen name="CaregiverFriendsListScreen" component={CaregiverFriendsListScreen} options={{ title: '보호자의 프렌즈 조회' }} />
//    <Stack.Screen name="FriendCaregiverScreen" component={FriendCaregiverScreen} options={{ title: '프렌즈의 보호자 조회' }} />
//    <Stack.Screen name="KakaoLoginScreen" component={KakaoLoginScreen} options={{ title: '카카오 로그인' }} />
//    <Stack.Screen name="Signup" component={SignupScreen} />
//    <Stack.Screen name="UserTypeSelection" component={UserTypeSelectionScreen} options={{ title: '회원 유형 선택' }} />
//  </Stack.Navigator>
//);
//
//const CalendarStack = () => (
//  <Stack.Navigator>
//    <Stack.Screen name="CalendarScreen" component={CalendarScreen} options={{ headerShown: false }} />
//  </Stack.Navigator>
//);
//
//const ProfileStack = () => (
//  <Stack.Navigator>
//    <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
//  </Stack.Navigator>
//);
//
//const linking = {
//  prefixes: ['myapp://'],
//  config: {
//    screens: {
//        UserTypeSelection: '/signup', // 'select-user-type' 경로를 UserTypeSelectionScreen에 매핑
//    },
//  },
//};
//
//const App = () => {
//  useEffect(() => {
//    getFcmToken();
//  }, []);
//
//  return (
//    <NavigationContainer linking={linking}>
//      <Tab.Navigator
//        screenOptions={({ route }) => ({
//          tabBarIcon: ({ focused, color, size }) => {
//            let iconName;
//
//            if (route.name === 'Home') {
//              iconName = focused ? 'home' : 'home';
//            } else if (route.name === 'Calendar') {
//              iconName = focused ? 'calendar' : 'calendar-o';
//            } else if (route.name === 'Profile') {
//              iconName = focused ? 'user' : 'user-o';
//            }
//
//            return <FontAwesome name={iconName} size={size} color={color} />;
//          },
//          tabBarActiveTintColor: '#1E90FF',
//          tabBarInactiveTintColor: '#8e8e93',
//          tabBarStyle: { paddingVertical: 5, backgroundColor: '#f8f8f8' },
//          tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
//        })}
//      >
//        <Tab.Screen name="Home" component={HomeStack} />
//        <Tab.Screen name="Calendar" component={CalendarStack} />
//        <Tab.Screen name="Profile" component={ProfileStack} />
//      </Tab.Navigator>
//    </NavigationContainer>
//  );
//};
//
//const getFcmToken = async () => {
//  const fcmToken = await messaging().getToken();
//  console.log('[FCM Token] ', fcmToken);
//};
//
//export default App;


//// App.js
//
//import React, { useEffect } from 'react';
//import { NavigationContainer } from '@react-navigation/native';
//import { createStackNavigator } from '@react-navigation/stack';
//import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
//import FontAwesome from 'react-native-vector-icons/FontAwesome';
//import ScheduleScreen from './ScheduleScreen';
//import imgUpload from './ImgUpload';
//import CalendarScreen from './CalendarScreen';
//import NotificationScreen from './NotificationScreen';
//import ProfileScreen from './ProfileScreen';
//import AddScheduleScreen from './AddScheduleScreen';
//import EditScheduleScreen from './EditScheduleScreen'; // Import the EditScheduleScreen
//import messaging from '@react-native-firebase/messaging';
//import AddFriendScreen from './AddFriendScreen';
//import FriendsRequestListScreen from './FriendsRequestListScreen';
//import CaregiverFriendsListScreen from './CaregiverFriendsListScreen';
//import FriendCaregiverScreen from './FriendCaregiverScreen';
//import KakaoLoginScreen from './KakaoLoginScreen'; // 카카오 로그인 화면
//import SignupScreen from './SignupScreen';
//import UserTypeSelectionScreen from './UserTypeSelectionScreen';
//import { Linking } from 'react-native';
//
//const Stack = createStackNavigator();
//const Tab = createBottomTabNavigator();
//
//const HomeStack = () => (
//  <Stack.Navigator>
//    <Stack.Screen
//      name="ScheduleScreen"
//      component={ScheduleScreen}
//      options={{ headerShown: false }}
//    />
//    <Stack.Screen
//      name="imgUpload"
//      component={imgUpload}
//      options={{ headerShown: false }}
//    />
//    <Stack.Screen
//      name="NotificationScreen"
//      component={NotificationScreen}
//      options={{ headerShown: false }}
//    />
//    <Stack.Screen
//      name="AddScheduleScreen"
//      component={AddScheduleScreen}
//      options={{ title: '일정 추가하기' }}
//    />
//    <Stack.Screen
//      name="EditScheduleScreen"
//      component={EditScheduleScreen} // Add EditScheduleScreen to the navigator
//      options={{ title: '일정 수정하기' }}
//    />
//    <Stack.Screen
//          name="AddFriendScreen"  // Add this screen to the stack
//          component={AddFriendScreen}
//          options={{ title: '친구 추가하기' }}
//    />
//    <Stack.Screen
//          name="FriendsRequestListScreen"
//          component={FriendsRequestListScreen}
//          options={{ title: '친구 요청 리스트 조회' }}
//    />
//
//    <Stack.Screen
//          name="CaregiverFriendsListScreen"
//          component={CaregiverFriendsListScreen}
//          options={{ title: '보호자의 프렌즈 조회' }}
//    />
//
//    <Stack.Screen
//          name="FriendCaregiverScreen"
//          component={FriendCaregiverScreen}
//          options={{ title: '프렌즈의 보호자 조회' }}
//    />
//    <Stack.Screen
//        name="KakaoLoginScreen"
//        component={KakaoLoginScreen}
//        options={{ title: '카카오 로그인' }}
//    />
//    <Stack.Screen
//        name="Signup"
//        component={SignupScreen}
//    />
//    <Stack.Screen
//        name="UserTypeSelection"
//        component={UserTypeSelectionScreen}
//        options={{ title: '회원 유형 선택' }}
//    />
//  </Stack.Navigator>
//);
//
//const CalendarStack = () => (
//  <Stack.Navigator>
//    <Stack.Screen
//      name="CalendarScreen"
//      component={CalendarScreen}
//      options={{ headerShown: false }}
//    />
//  </Stack.Navigator>
//);
//
//const ProfileStack = () => (
//  <Stack.Navigator>
//    <Stack.Screen
//      name="ProfileScreen"
//      component={ProfileScreen}
//      options={{ headerShown: false }}
//    />
//  </Stack.Navigator>
//);
//
//const linking = {
//    prefixes: ['myapp://'],
//    config: {
//        screens: {
//            UserTypeSelection: 'signup', // signup path를 UserTypeSelectionScreen에 매핑
//        },
//    },
//};
//
//const App = () => {
//  useEffect(() => {
//    getFcmToken();
//  }, []);
//
//  return (
//    <NavigationContainer>
//      <Tab.Navigator
//        screenOptions={({ route }) => ({
//          tabBarIcon: ({ focused, color, size }) => {
//            let iconName;
//
//            if (route.name === 'Home') {
//              iconName = focused ? 'home' : 'home';
//            } else if (route.name === 'Calendar') {
//              iconName = focused ? 'calendar' : 'calendar-o';
//            } else if (route.name === 'Profile') {
//              iconName = focused ? 'user' : 'user-o';
//            }
//
//            return <FontAwesome name={iconName} size={size} color={color} />;
//          },
//          tabBarActiveTintColor: '#1E90FF',
//          tabBarInactiveTintColor: '#8e8e93',
//          tabBarStyle: { paddingVertical: 5, backgroundColor: '#f8f8f8' },
//          tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
//        })}
//      >
//        <Tab.Screen name="Home" component={HomeStack} />
//        <Tab.Screen name="Calendar" component={CalendarStack} />
//        <Tab.Screen name="Profile" component={ProfileStack} />
//      </Tab.Navigator>
//    </NavigationContainer>
//  );
//};
//
//const getFcmToken = async () => {
//  const fcmToken = await messaging().getToken();
//  console.log('[FCM Token] ', fcmToken);
//};
//
//export default App;






