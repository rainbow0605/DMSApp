import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/OtpScreen';

const Stack = createNativeStackNavigator();

const hideHeader = { headerShown: false };

const MainNavigator = () => {

    const AuthStack = () => {
        return (
            <Stack.Navigator initialRouteName="Login" screenOptions={hideHeader}>
                <Stack.Screen name={'Login'} component={LoginScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
                <Stack.Screen name={'Otp'} component={OtpScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
            </Stack.Navigator>
        );
    };

    const SplashStack = () => {
        return (
            <Stack.Navigator initialRouteName="Splash" screenOptions={hideHeader}>
                <Stack.Screen name={'Splash'} component={SplashScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        );
    };

    const InitialNavigators = () => {
        return (
            <Stack.Navigator>
                <Stack.Screen name='SplashStack' component={SplashStack} options={hideHeader} />
                <Stack.Screen name='AuthStack' component={AuthStack} options={hideHeader} />
            </Stack.Navigator>
        )
    }

    return (
        <NavigationContainer>
            <InitialNavigators />
        </NavigationContainer>
    )
}

export default MainNavigator