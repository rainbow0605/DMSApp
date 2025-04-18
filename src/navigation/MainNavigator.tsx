import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/OtpScreen';
import Home from '../screens/Home';
import FileUploadScreen from '../screens/FileUploadScreen';
import FileSearchScreen from '../screens/FileSearchScreen';
import FilePreviewScreen from '../screens/FilePreviewScreen';

type RootStackParamList = {
    Splash: undefined;
    Login: undefined;
    Otp: undefined;
    Home: undefined;
    SplashStack: undefined;
    AuthStack: undefined;
    HomeStack: undefined;
    FileSearch: undefined;
    FileUpload: undefined;
    FilePreview: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const hideHeader = { headerShown: false };

const MainNavigator = () => {

    const HomeStack = () => {
        return (
            <Stack.Navigator initialRouteName="Home" screenOptions={hideHeader}>
                <Stack.Screen name={'Home'} component={Home} options={{ headerShown: false }} />
                <Stack.Screen name={'FileUpload'} component={FileUploadScreen} options={{ headerShown: false }} />
                <Stack.Screen name={'FileSearch'} component={FileSearchScreen} options={{ headerShown: false }} />
                <Stack.Screen name={'FilePreview'} component={FilePreviewScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        );
    };

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
                <Stack.Screen name='HomeStack' component={HomeStack} options={hideHeader} />
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