import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const moods = ['Happy', 'Sad', 'Motivated', 'Relaxed', 'Angry'];

export default function ExplorePage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editText, setEditText] = useState('');
  const [editMood, setEditMood] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [searchQuery, entries]);

  const loadEntries = async () => {
    try {
      const stored = await AsyncStorage.getItem('journalEntries');
      const parsed = stored ? JSON.parse(stored) : [];
      setEntries(parsed);
      setFilteredEntries(parsed);
    } catch (err) {
      console.error('Error loading entries:', err);
    }
  };

  const filterEntries = () => {
    let filtered = [...entries];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((entry) => 
        entry.text.toLowerCase().includes(query)
      );
    }
    
    setFilteredEntries(filtered);
  };

  const handleDelete = async (id) => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const updatedEntries = entries.filter(entry => entry.id !== id);
              await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
              setEntries(updatedEntries);
              Alert.alert("Success", "Entry deleted successfully");
            } catch (err) {
              console.error('Error deleting entry:', err);
              Alert.alert("Error", "Could not delete the entry");
            }
          }
        }
      ]
    );
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setEditText(entry.text);
    setEditMood(entry.mood);
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editText.trim() || !editMood) {
      Alert.alert('Error', 'Please write something and select a mood!');
      return;
    }

    try {
      const updatedEntry = {
        ...editingEntry,
        text: editText,
        mood: editMood,
      };

      const updatedEntries = entries.map(entry => 
        entry.id === editingEntry.id ? updatedEntry : entry
      );

      await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
      setEditModalVisible(false);
      Alert.alert("Success", "Entry updated successfully");
    } catch (err) {
      console.error('Error updating entry:', err);
      Alert.alert("Error", "Could not update the entry");
    }
  };

  const renderEntry = ({ item }) => (
    <View className={`rounded-xl p-4 mb-4 shadow-sm ${
      isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'
    }`}>
      <View className="flex-row justify-between items-center mb-2">
        <Text className={`text-xs ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {new Date(item.date).toLocaleString()}
        </Text>
        <View className="flex-row space-x-2">
          <TouchableOpacity 
            onPress={() => handleEdit(item)}
            className="p-1"
          >
            <MaterialIcons 
              name="edit" 
              size={20} 
              color={isDarkMode ? '#fff' : '#374151'} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDelete(item.id)}
            className="p-1"
          >
            <MaterialIcons 
              name="delete" 
              size={20} 
              color={isDarkMode ? '#fff' : '#374151'} 
            />
          </TouchableOpacity>
        </View>
      </View>
      <Text className={`text-base leading-6 mb-3 ${
        isDarkMode ? 'text-gray-200' : 'text-gray-800'
      }`}>
        {item.text}
      </Text>
      <View className="flex-row items-center">
        <Text className={`text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Mood: {item.mood}
        </Text>
      </View>
    </View>
  );

  return (
    <View className={`flex-1 p-5 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <View className="mb-5">
        <Text className={`text-2xl font-bold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Explore Entries
        </Text>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search entries..."
          className={`rounded-xl p-4 text-base border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-white' 
              : 'bg-white border-gray-200 text-gray-800'
          }`}
          placeholderTextColor={isDarkMode ? '#999' : '#666'}
        />
      </View>

      <FlatList
        data={filteredEntries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {editModalVisible && (
        <Modal
          visible={editModalVisible}
          animationType="slide"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View className={`flex-1 p-5 ${
            isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
          }`}>
            <View className="flex-row justify-between items-center mb-5">
              <Text className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Edit Entry
              </Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialIcons 
                  name="close" 
                  size={24} 
                  color={isDarkMode ? '#fff' : '#374151'} 
                />
              </TouchableOpacity>
            </View>

            <TextInput
              value={editText}
              onChangeText={setEditText}
              placeholder="Edit your entry..."
              className={`rounded-xl p-4 text-base border mb-4 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-200 text-gray-800'
              }`}
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              multiline
            />

            <TouchableOpacity
              onPress={handleUpdate}
              className="bg-green-500 px-4 py-3 rounded-xl shadow-sm"
            >
              <Text className="text-white text-center font-medium">Update Entry</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
}

