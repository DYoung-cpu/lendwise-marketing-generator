import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function WaitingScreen() {
  const [recentCalls, setRecentCalls] = useState([]);

  useEffect(() => {
    // Load recent calls from Supabase when we set it up
    loadRecentCalls();
  }, []);

  const loadRecentCalls = async () => {
    // Will connect to Supabase later
    // For now, using mock data
    setRecentCalls([
      { id: '1', from_number: '(555) 123-4567', created_at: new Date().toISOString(), status: 'completed' },
      { id: '2', from_number: '(555) 987-6543', created_at: new Date().toISOString(), status: 'missed' },
    ]);
  };

  const renderCall = ({ item }) => (
    <View style={styles.callItem}>
      <Text style={styles.callFrom}>{item.from_number}</Text>
      <Text style={styles.callTime}>
        {new Date(item.created_at).toLocaleTimeString()}
      </Text>
      <Text style={styles.callStatus}>{item.status}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>LendWise</Text>
        <Text style={styles.status}>Waiting for calls...</Text>
        <ActivityIndicator size="large" color="#ffffff" style={styles.spinner} />
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.recentTitle}>Recent Calls</Text>
        <FlatList
          data={recentCalls}
          renderItem={renderCall}
          keyExtractor={(item) => item.id}
          style={styles.callList}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 20,
  },
  spinner: {
    marginTop: 20,
  },
  recentSection: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 15,
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  callList: {
    flex: 1,
  },
  callItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  callFrom: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  callTime: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  callStatus: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.7,
    textTransform: 'uppercase',
  },
});