import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';
import ScheduleScreen from './caregiver/ScheduleScreen';
import FriendScheduleScreen from './friend/FriendScheduleScreen';
import CalendarScreen from './user/CalendarScreen';
import ProfileScreen from './user/ProfileScreen';
import KakaoLoginScreen from './user/KakaoLoginScreen';
import SignupScreen from './user/SignupScreen';
import UserTypeSelectionScreen from './user/UserTypeSelectionScreen';
import SplashScreen from './SplashScreen';
import FriendActionScreen from './caregiver/FriendActionScreen';
import FriendAddScheduleScreen from './friend/FriendAddScheduleScreen';
import AddScheduleScreen from './caregiver/AddScheduleScreen';
import CaregiverFriendsListScreen from './caregiver/CaregiverFriendsListScreen';
import AddFriendScreen from './caregiver/AddFriendScreen';
import FriendsRequestListScreen from './friend/FriendsRequestListScreen';
import FriendCaregiverScreen from './friend/FriendCaregiverScreen';
import RecommendScreen from './RecommendScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// CaregiverTabs 네비게이터
const CaregiverTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'Calendar') {
          iconName = 'calendar';
        } else if (route.name === 'Friends') {
          iconName = 'users';
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
    <Tab.Screen name="Home" component={ScheduleStack} />
    <Tab.Screen name="Calendar" component={CalendarStack} />
    <Tab.Screen name="Friends" component={FriendsStack} />
    <Tab.Screen name="Profile" component={ProfileStack} />
  </Tab.Navigator>
);

// FriendTabs 네비게이터
const FriendTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'Calendar') {
          iconName = 'calendar';
        } else if (route.name === 'Caregiver') {
          iconName = 'heart';
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
    <Tab.Screen name="Home" component={FriendScheduleStack} />
    <Tab.Screen name="Calendar" component={CalendarStack} />
    <Tab.Screen name="Caregiver" component={CaregiverStack} />
    <Tab.Screen name="Profile" component={ProfileStack} />
  </Tab.Navigator>
);

// 스택 네비게이터
const ScheduleStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ScheduleScreen" component={ScheduleScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AddScheduleScreen" component={AddScheduleScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AddFriendScreen" component={AddFriendScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const FriendScheduleStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="FriendScheduleScreen" component={FriendScheduleScreen} options={{ headerShown: false }} />
    <Stack.Screen name="FriendAddScheduleScreen" component={FriendAddScheduleScreen} options={{ headerShown: false }} />
    <Stack.Screen name="FriendsRequestListScreen" component={FriendsRequestListScreen} options={{ headerShown: false }} />
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

const FriendsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="CaregiverFriendsListScreen" component={CaregiverFriendsListScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const CaregiverStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="FriendCaregiverScreen" component={FriendCaregiverScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashScreen">
        <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="KakaoLoginScreen" component={KakaoLoginScreen} options={{ title: '카카오 로그인' }} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} options={{ title: '회원 가입' }} />
        <Stack.Screen name="UserTypeSelectionScreen" component={UserTypeSelectionScreen} options={{ title: '회원 유형 선택' }} />
        <Stack.Screen name="FriendActionScreen" component={FriendActionScreen} options={{ title: '프렌즈 관리' }} />
        <Stack.Screen name="CaregiverTabs" component={CaregiverTabs} options={{ headerShown: false }} />
        <Stack.Screen name="FriendTabs" component={FriendTabs} options={{ headerShown: false }} />
        <Stack.Screen name="RecommendScreen" component={RecommendScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;