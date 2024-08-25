// App.js

import React, { useEffect } from 'react';
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
import EditScheduleScreen from './EditScheduleScreen'; // Import the EditScheduleScreen
import messaging from '@react-native-firebase/messaging';
import AddFriendScreen from './AddFriendScreen';
import FriendsRequestListScreen from './FriendsRequestListScreen';
import CaregiverFriendsListScreen from './CaregiverFriendsListScreen';
import FriendCaregiverScreen from './FriendCaregiverScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ScheduleScreen"
      component={ScheduleScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="imgUpload"
      component={imgUpload}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="NotificationScreen"
      component={NotificationScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="AddScheduleScreen"
      component={AddScheduleScreen}
      options={{ title: '일정 추가하기' }}
    />
    <Stack.Screen
      name="EditScheduleScreen"
      component={EditScheduleScreen} // Add EditScheduleScreen to the navigator
      options={{ title: '일정 수정하기' }}
    />
    <Stack.Screen
          name="AddFriendScreen"  // Add this screen to the stack
          component={AddFriendScreen}
          options={{ title: '친구 추가하기' }}
    />
    <Stack.Screen
          name="FriendsRequestListScreen"
          component={FriendsRequestListScreen}
          options={{ title: '친구 요청 리스트 조회' }}
    />

    <Stack.Screen
          name="CaregiverFriendsListScreen"
          component={CaregiverFriendsListScreen}
          options={{ title: '보호자의 프렌즈 조회' }}
    />

    <Stack.Screen
          name="FriendCaregiverScreen"
          component={FriendCaregiverScreen}
          options={{ title: '프렌즈의 보호자 조회' }}
    />
  </Stack.Navigator>
);

const CalendarStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="CalendarScreen"
      component={CalendarScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ProfileScreen"
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const App = () => {
  useEffect(() => {
    getFcmToken();
  }, []);

  return (
    <NavigationContainer>
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
          tabBarActiveTintColor: '#1E90FF',
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
//import AddScheduleScreen from './AddScheduleScreen'; // 새로운 화면 추가
//import messaging from '@react-native-firebase/messaging';
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
//      options={{ title: '일정 추가하기' }} // 타이틀 설정
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



//// App.js
//
//import React, { useEffect } from 'react';
//import { NavigationContainer } from '@react-navigation/native';
//import { createStackNavigator } from '@react-navigation/stack';
//import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
//import FontAwesome from 'react-native-vector-icons/FontAwesome'; // 여기를 확인하세요
//import ScheduleScreen from './ScheduleScreen';
//import imgUpload from './ImgUpload';
//import CalendarScreen from './CalendarScreen';
//import NotificationScreen from './NotificationScreen';
//import ProfileScreen from './ProfileScreen';
//import messaging from '@react-native-firebase/messaging';
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






//import React, { useEffect } from 'react';
//import { NavigationContainer } from '@react-navigation/native';
//import { createStackNavigator } from '@react-navigation/stack';
//import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
//import ScheduleScreen from './ScheduleScreen';
//import imgUpload from './ImgUpload';
//import CalendarScreen from './CalendarScreen';
//import NotificationScreen from './NotificationScreen';
//import ProfileScreen from './ProfileScreen'; // 새로운 ProfileScreen 컴포넌트
//import messaging from '@react-native-firebase/messaging';
//import { View, Text } from 'react-native';
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
//const NotificationStack = () => (
//  <Stack.Navigator>
//    <Stack.Screen
//      name="NotificationScreen"
//      component={NotificationScreen}
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
//const App = () => {
//  useEffect(() => {
//    getFcmToken();
//  }, []);
//
//  return (
//    <NavigationContainer>
//      <Tab.Navigator
//        screenOptions={{
//          tabBarActiveTintColor: '#1E90FF',
//          tabBarInactiveTintColor: '#8e8e93',
//          tabBarStyle: { paddingVertical: 5, backgroundColor: '#f8f8f8' },
//          tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
//        }}
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
