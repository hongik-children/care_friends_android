import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

const CalendarScreen = () => {
  return (
    <View style={styles.container}>
      <Calendar
        // Marked dates example
        markedDates={{
          '2024-03-07': { marked: true },
          '2024-03-08': { marked: true, dotColor: 'red', activeOpacity: 0 },
          '2024-03-09': { marked: true, dotColor: 'blue' },
        }}
        // Handler which gets executed on day press
        onDayPress={(day) => {
          console.log('selected day', day);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default CalendarScreen;
