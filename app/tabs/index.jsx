import { View, Text, TextInput, Button, Alert, FlatList, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export default function JournalScreen() {
  const [entry, setEntry] = useState('');
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const stored = await AsyncStorage.getItem('journalEntries');
      const parsed = stored ? JSON.parse(stored) : [];
      setEntries(parsed);
    } catch (err) {
      console.error('Error loading entries:', err);
    }
  };

  const handleSave = async () => {
    if (!entry.trim()) {
      Alert.alert('Write something first!');
      return;
    }

    const newEntry = {
      id: Date.now(),
      text: entry,
      date: new Date().toISOString(),
    };

    try {
      const updated = [newEntry, ...entries];
      await AsyncStorage.setItem('journalEntries', JSON.stringify(updated));
      setEntries(updated);
      setEntry('');
      Alert.alert('Saved!', 'Your entry was saved successfully.');
    } catch (err) {
      console.error('Error saving entry:', err);
      Alert.alert('Error', 'Could not save your entry.');
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setEntry(entry.text);
    setModalVisible(true);
  };

  const handleUpdateEntry = async () => {
    if (!entry.trim()) {
      Alert.alert('Entry cannot be empty.');
      return;
    }

    const updatedEntries = entries.map((e) =>
      e.id === editingEntry.id ? { ...e, text: entry } : e
    );

    try {
      await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
      setEntry('');
      setEditingEntry(null);
      setModalVisible(false);
      Alert.alert('Updated', 'Your journal entry was updated!');
    } catch (err) {
      console.error('Update Error:', err);
      Alert.alert('Error', 'Could not update the entry.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const filtered = entries.filter((entry) => entry.id !== id);
      await AsyncStorage.setItem('journalEntries', JSON.stringify(filtered));
      setEntries(filtered);
      Alert.alert('Deleted', 'Entry has been removed.');
    } catch (err) {
      console.error('Delete Error:', err);
      Alert.alert('Error', 'Could not delete the entry.');
    }
  };

  const renderEntry = ({ item }) => (
    <View className="mb-3 p-3 bg-gray-100 rounded-xl">
      <Text className="text-sm text-gray-500">{new Date(item.date).toLocaleString()}</Text>
      <Text className="mt-1 text-base mb-2">{item.text}</Text>

      <View className="flex-row justify-end space-x-2 gap-3">
        <Button title="Edit" onPress={() => handleEdit(item)} />
        <Button title="Delete" color="red" onPress={() => handleDelete(item.id)} />
      </View>
    </View>
  );

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-xl font-bold mb-4">What's on your mind today?</Text>

      <TextInput
        multiline
        placeholder="Start writing..."
        className="border border-gray-300 rounded-xl p-4 h-40 text-base mb-4"
        value={entry}
        onChangeText={setEntry}
      />

      <Button
        title={editingEntry ? "Update Entry" : "Save Entry"}
        onPress={editingEntry ? handleUpdateEntry : handleSave}
      />

      <Text className="text-lg font-semibold mt-6 mb-2">Previous Entries</Text>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEntry}
      />

      {/* Modal for editing entry */}
      {modalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/60">
            <View className="bg-white p-6 rounded-xl w-[90%]">
              <Text className="text-xl font-semibold mb-4">Edit your entry</Text>
              <TextInput
                multiline
                className="border border-gray-300 rounded-xl p-4 h-40 text-base mb-4"
                value={entry}
                onChangeText={setEntry}
              />
              <Button title="Update" onPress={handleUpdateEntry} />
              <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
