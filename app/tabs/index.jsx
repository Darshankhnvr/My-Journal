import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, Alert, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const moods = ['Happy', 'Sad', 'Motivated', 'Relaxed', 'Angry','Excited', 'Bored', 'Anxious', 'Confused', 'Grateful'];

export default function IndexPage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [entry, setEntry] = useState('');
  const [mood, setMood] = useState('');
  const [recentEntries, setRecentEntries] = useState([]);

  useEffect(() => {
    loadRecentEntries();
  }, []);

  const loadRecentEntries = async () => {
    try {
      const stored = await AsyncStorage.getItem('journalEntries');
      const entries = stored ? JSON.parse(stored) : [];
      const recent = entries.slice(0, 5);
      setRecentEntries(recent);
    } catch (err) {
      console.error('Error loading recent entries:', err);
    }
  };

  const handleSave = async () => {
    if (!entry.trim() || !mood) {
      Alert.alert('Error', 'Please write something and select a mood!');
      return;
    }

    const newEntry = {
      id: Date.now(),
      text: entry,
      date: new Date().toISOString(),
      mood: mood,
    };

    try {
      const stored = await AsyncStorage.getItem('journalEntries');
      const entries = stored ? JSON.parse(stored) : [];
      const updated = [newEntry, ...entries];
      await AsyncStorage.setItem('journalEntries', JSON.stringify(updated));
      setEntry('');
      setMood('');
      Alert.alert('Saved!', 'Your entry was saved successfully.');
      loadRecentEntries();
    } catch (err) {
      console.error('Error saving entry:', err);
      Alert.alert('Error', 'Could not save your entry.');
    }
  };

  const renderRecentEntry = ({ item }) => (
    <View className={`rounded-xl p-4 mb-4 shadow-sm ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <Text className={`text-xs ${
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {new Date(item.date).toLocaleString()}
      </Text>
      <Text className={`text-sm mt-1 ${
        isDarkMode ? 'text-gray-200' : 'text-gray-800'
      }`} numberOfLines={2}>
        {item.text}
      </Text>
      <Text className={`text-xs mt-1 ${
        isDarkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Mood: {item.mood}
      </Text>
    </View>
  );

  return (
    <View className={`flex-1 p-5 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <View className="flex-row justify-between items-center mb-5">
        <View className="flex-row items-center">
          <FontAwesome6 
            name="book-journal-whills" 
            size={24} 
            color={isDarkMode ? '#fff' : '#000'} 
            className="mr-2"
          />
          <Text className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            What's on your mind today?
          </Text>
        </View>
        <TouchableOpacity onPress={toggleTheme} className="p-2">
          <MaterialIcons 
            name={isDarkMode ? 'light-mode' : 'dark-mode'} 
            size={24} 
            color={isDarkMode ? '#fff' : '#000'} 
          />
        </TouchableOpacity>
      </View>

      {/* Mood Selection */}
      <View className="flex-row flex-wrap mb-4">
        {moods.map((moodOption) => (
          <TouchableOpacity
            key={moodOption}
            onPress={() => setMood(moodOption)}
            className={`px-3 py-1 mr-2 mb-2 ${
              mood === moodOption 
                ? 'bg-green-500' 
                : isDarkMode 
                  ? 'bg-gray-700' 
                  : 'bg-gray-200'
            }`}
          >
            <Text className={`text-sm ${
              mood === moodOption 
                ? 'text-white' 
                : isDarkMode 
                  ? 'text-gray-300' 
                  : 'text-gray-700'
            }`}>
              {moodOption}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Journal Entry Input */}
      <TextInput
        className={`rounded-xl p-4 text-base border mb-4 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-white border-gray-200 text-gray-800'
        }`}
        placeholder="Start writing..."
        placeholderTextColor={isDarkMode ? '#999' : '#666'}
        multiline
        value={entry}
        onChangeText={setEntry}
      />

      <TouchableOpacity
        onPress={handleSave}
        className="bg-green-500 px-4 py-3 rounded-xl mb-6"
      >
        <Text className="text-white text-center font-medium">Save Entry</Text>
      </TouchableOpacity>

      {/* Recent Entries Section */}
      {recentEntries.length > 0 && (
        <View>
          <Text className={`text-lg font-semibold mb-3 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Recent Entries
          </Text>
          <FlatList
            data={recentEntries}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRecentEntry}
            scrollEnabled={false}
          />
        </View>
      )}
    </View>
  );
}
