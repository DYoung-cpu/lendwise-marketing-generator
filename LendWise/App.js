import React from 'react';
import { StatusBar } from 'expo-status-bar';
import WaitingScreen from './src/components/WaitingScreen';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <WaitingScreen />
    </>
  );
}
