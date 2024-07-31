import React, { useEffect, useState } from 'react';
import NotificationScreen from './NotificationScreen';
import ScheduleScreen from './ScheduleScreen';
import imgUpload from './ImgUpload';
import CalendarScreen from './CalendarScreen';
import messaging from '@react-native-firebase/messaging';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS } from 'react-native-permissions';
import MapView, { Marker } from 'react-native-maps';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Button, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';

import type { PropsWithChildren } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('[Background Remote Message]', remoteMessage);
});

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    getFcmToken();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
        <Stack.Screen name="imgUpload" component={imgUpload} />
        <Stack.Screen name="ScheduleScreen" component={ScheduleScreen} />
        <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const Start = ({ navigation }) => {
  const [location, setLocation] = useState(null);

  const requestLocationPermission = async () => {
    const result = await request(
      Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
    );

    if (result === 'granted') {
      getCurrentLocation();
    } else {
      console.log('Location permission denied');
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation(position);
      },
      (error) => {
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  return (
    <View style={styles.container}>
      <Text>start!</Text>
      <Button
        title="go to Notification"
        onPress={() => navigation.navigate('NotificationScreen')}
      />
      <Button
        title="go to ScheduleScreen"
        onPress={() => navigation.navigate('ScheduleScreen')}
      />
      <Button
        title="go to Calendar"
        onPress={() => navigation.navigate('CalendarScreen')}
      />
      <Button
        title="Get Current Location"
        onPress={requestLocationPermission}
      />
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
          />
        </MapView>
      )}
    </View>
  );
};

const getFcmToken = async () => {
  const fcmToken = await messaging().getToken();
  console.log('[FCM Token] ', fcmToken);
};

function Section({ children, title }: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height / 2,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;







//import React, { useEffect, useState } from 'react';
//import NotificationScreen from './NotificationScreen';
//import ScheduleScreen from './ScheduleScreen';
//import imgUpload from './ImgUpload';
//import CalendarScreen from './CalendarScreen';
//import messaging from '@react-native-firebase/messaging';
//import Geolocation from 'react-native-geolocation-service';
//import { request, PERMISSIONS } from 'react-native-permissions';
//import { NavigationContainer } from '@react-navigation/native';
//import { createStackNavigator } from '@react-navigation/stack';
//import { Button, View, Text, StyleSheet, Platform } from 'react-native';
//
//import type { PropsWithChildren } from 'react';
//import {
//  SafeAreaView,
//  ScrollView,
//  StatusBar,
//  useColorScheme,
//} from 'react-native';
//
//import {
//  Colors,
//  DebugInstructions,
//  Header,
//  LearnMoreLinks,
//  ReloadInstructions,
//} from 'react-native/Libraries/NewAppScreen';
//
//type SectionProps = PropsWithChildren<{
//  title: string;
//}>;
//
//messaging().setBackgroundMessageHandler(async (remoteMessage) => {
//  console.log('[Background Remote Message]', remoteMessage);
//});
//
//const Stack = createStackNavigator();
//
//const App = () => {
//  useEffect(() => {
//    getFcmToken();
//  }, []);
//
//  return (
//    <NavigationContainer>
//      <Stack.Navigator initialRouteName="Start">
//        <Stack.Screen name="Start" component={Start} />
//        <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
//        <Stack.Screen name="imgUpload" component={imgUpload} />
//        <Stack.Screen name="ScheduleScreen" component={ScheduleScreen} />
//        <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
//      </Stack.Navigator>
//    </NavigationContainer>
//  );
//};
//
//const Start = ({ navigation }) => {
//  const [location, setLocation] = useState(null);
//
//  const requestLocationPermission = async () => {
//    const result = await request(
//      Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
//    );
//
//    if (result === 'granted') {
//      getCurrentLocation();
//    }
//  };
//
//  const getCurrentLocation = () => {
//    Geolocation.getCurrentPosition(
//      (position) => {
//        setLocation(position);
//      },
//      (error) => {
//        console.error(error);
//      },
//      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
//    );
//  };
//
//  return (
//    <View style={styles.container}>
//      <Text>start!</Text>
//      <Button
//        title="go to Notification"
//        onPress={() => navigation.navigate('NotificationScreen')}
//      />
//      <Button
//        title="go to ScheduleScreen"
//        onPress={() => navigation.navigate('ScheduleScreen')}
//      />
//      <Button
//        title="go to Calendar"
//        onPress={() => navigation.navigate('CalendarScreen')}
//      />
//      <Button
//        title="Get Current Location"
//        onPress={requestLocationPermission}
//      />
//      {location && (
//        <Text>
//          Latitude: {location.coords.latitude}, Longitude: {location.coords.longitude}
//        </Text>
//      )}
//    </View>
//  );
//};
//
//const getFcmToken = async () => {
//  const fcmToken = await messaging().getToken();
//  console.log('[FCM Token] ', fcmToken);
//};
//
//function Section({ children, title }: SectionProps): React.JSX.Element {
//  const isDarkMode = useColorScheme() === 'dark';
//  return (
//    <View style={styles.sectionContainer}>
//      <Text
//        style={[
//          styles.sectionTitle,
//          {
//            color: isDarkMode ? Colors.white : Colors.black,
//          },
//        ]}
//      >
//        {title}
//      </Text>
//      <Text
//        style={[
//          styles.sectionDescription,
//          {
//            color: isDarkMode ? Colors.light : Colors.dark,
//          },
//        ]}
//      >
//        {children}
//      </Text>
//    </View>
//  );
//}
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    alignItems: 'center',
//    justifyContent: 'center',
//  },
//  sectionContainer: {
//    marginTop: 32,
//    paddingHorizontal: 24,
//  },
//  sectionTitle: {
//    fontSize: 24,
//    fontWeight: '600',
//  },
//  sectionDescription: {
//    marginTop: 8,
//    fontSize: 18,
//    fontWeight: '400',
//  },
//  highlight: {
//    fontWeight: '700',
//  },
//});
//
//export default App;




//import React, { useEffect } from 'react';
//import NotificationScreen from './NotificationScreen';
//import ScheduleScreen from './ScheduleScreen';
//import imgUpload from './ImgUpload';
//import CalendarScreen from './CalendarScreen';
//import messaging from '@react-native-firebase/messaging';
//import { NavigationContainer } from '@react-navigation/native';
//import { createStackNavigator } from '@react-navigation/stack';
//import { Button, View, Text, StyleSheet } from 'react-native';
//
//import type { PropsWithChildren } from 'react';
//import {
//  SafeAreaView,
//  ScrollView,
//  StatusBar,
//  useColorScheme,
//} from 'react-native';
//
//import {
//  Colors,
//  DebugInstructions,
//  Header,
//  LearnMoreLinks,
//  ReloadInstructions,
//} from 'react-native/Libraries/NewAppScreen';
//
//type SectionProps = PropsWithChildren<{
//  title: string;
//}>;
//
//messaging().setBackgroundMessageHandler(async (remoteMessage) => {
//  console.log('[Background Remote Message]', remoteMessage);
//});
//
//const Stack = createStackNavigator();
//
//const App = () => {
//  useEffect(() => {
//    getFcmToken();
//  }, []);
//
//  return (
//    <NavigationContainer>
//      <Stack.Navigator initialRouteName="Start">
//        <Stack.Screen name="Start" component={Start} />
//        <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
//        <Stack.Screen name="imgUpload" component={imgUpload} />
//        <Stack.Screen name="ScheduleScreen" component={ScheduleScreen} />
//        <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
//      </Stack.Navigator>
//    </NavigationContainer>
//  );
//};
//
//const Start = ({ navigation }) => {
//  return (
//    <View style={styles.container}>
//      <Text>start!</Text>
//      <Button
//        title="go to Notification"
//        onPress={() => navigation.navigate('NotificationScreen')}
//      />
//      <Button
//        title="go to ScheduleScreen"
//        onPress={() => navigation.navigate('ScheduleScreen')}
//      />
//      <Button
//        title="go to Calendar"
//        onPress={() => navigation.navigate('CalendarScreen')}
//      />
//    </View>
//  );
//};
//
//const getFcmToken = async () => {
//  const fcmToken = await messaging().getToken();
//  console.log('[FCM Token] ', fcmToken);
//};
//
//function Section({ children, title }: SectionProps): React.JSX.Element {
//  const isDarkMode = useColorScheme() === 'dark';
//  return (
//    <View style={styles.sectionContainer}>
//      <Text
//        style={[
//          styles.sectionTitle,
//          {
//            color: isDarkMode ? Colors.white : Colors.black,
//          },
//        ]}
//      >
//        {title}
//      </Text>
//      <Text
//        style={[
//          styles.sectionDescription,
//          {
//            color: isDarkMode ? Colors.light : Colors.dark,
//          },
//        ]}
//      >
//        {children}
//      </Text>
//    </View>
//  );
//}
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    alignItems: 'center',
//    justifyContent: 'center',
//  },
//  sectionContainer: {
//    marginTop: 32,
//    paddingHorizontal: 24,
//  },
//  sectionTitle: {
//    fontSize: 24,
//    fontWeight: '600',
//  },
//  sectionDescription: {
//    marginTop: 8,
//    fontSize: 18,
//    fontWeight: '400',
//  },
//  highlight: {
//    fontWeight: '700',
//  },
//});
//
//export default App;






////App.js
//
//import React, { useEffect } from 'react';
//import NotificationScreen from './NotificationScreen';
//import ScheduleScreen from './ScheduleScreen.js'
//import imgUpload from './ImgUpload.js'
// import messaging from '@react-native-firebase/messaging';
//import { NavigationContainer } from "@react-navigation/native";
//import { createStackNavigator } from "@react-navigation/stack";
//import {Button} from "react-native";
//
// import type { PropsWithChildren } from 'react';
// import {
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   useColorScheme,
//   View,
// } from 'react-native';
//
// import {
//   Colors,
//   DebugInstructions,
//   Header,
//   LearnMoreLinks,
//   ReloadInstructions,
// } from 'react-native/Libraries/NewAppScreen';
//
// type SectionProps = PropsWithChildren<{
//   title: string;
// }>;
//
// messaging().setBackgroundMessageHandler(async (remoteMessage) => {
//   console.log('[Background Remote Message]', remoteMessage);
// });
//
//const App = () => {
//    const Stack = createStackNavigator();
//   useEffect(() => {
//     getFcmToken();
//   }, []);
//
//    return (
//        <NavigationContainer>
//            <Stack.Navigator initialRouteName="Start">
//                <Stack.Screen name="Start" component={ScheduleScreen} />
//                <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
//                <Stack.Screen name="imgUpload" component={imgUpload} />
//            </Stack.Navigator>
//        </NavigationContainer>
//
//    );
//};
//
//function Start({navigation}) {
//  return (
//    <View>
//      <Text>start!</Text>
//      <Button
//        title="go to Notification"
//        onPress={() => navigation.navigate('NotificationScreen')}
//      />
//
//      <Button
//              title="go to ScheduleScreen"
//              onPress={() => navigation.navigate('ScheduleScreen')}
//            />
//    </View>
//  );
//}
//
//
// const getFcmToken = async () => {
//   const fcmToken = await messaging().getToken();
//   console.log('[FCM Token] ', fcmToken);
// };
//
// function Section({ children, title }: SectionProps): React.JSX.Element {
//   const isDarkMode = useColorScheme() === 'dark';
//   return (
//     <View style={styles.sectionContainer}>
//       <Text
//         style={[
//           styles.sectionTitle,
//           {
//             color: isDarkMode ? Colors.white : Colors.black,
//           },
//         ]}
//       >
//         {title}
//       </Text>
//       <Text
//         style={[
//           styles.sectionDescription,
//           {
//             color: isDarkMode ? Colors.light : Colors.dark,
//           },
//         ]}
//       >
//         {children}
//       </Text>
//     </View>
//   );
// }
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   sectionContainer: {
//     marginTop: 32,
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//   },
//   sectionDescription: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '400',
//   },
//   highlight: {
//     fontWeight: '700',
//   },
// });
//
// export default App;