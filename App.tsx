import { View, Text } from 'react-native'
import React from 'react'
import MainNavigator from './src/navigation/MainNavigator'
import { AppProvider } from './src/contexts/AppContext'
import { AuthProvider } from './src/contexts/AuthContext'
const App = () => {
  return (
    <AppProvider>
      <AuthProvider>
        <MainNavigator />
      </AuthProvider>
    </AppProvider>
  )
}

export default App