import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { LocalStorage } from '../utils/LocalStorage';

interface SplashScreenProps {
    navigation: {
        navigate: (screen: string) => void;
        replace: (screen: string, params?: object) => void;
    };
}

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<SplashScreenProps> = (props) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.5)).current;
    const { navigation } = props;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease),
            }),
            Animated.timing(scale, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease),
            }),
        ]).start();

        const timeout = setTimeout(async () => {
            const userData = await LocalStorage.getData('user_data');
            if (userData?.token) {
                navigation.replace('HomeStack', { screen: 'Home' });
            } else {
                navigation.replace('AuthStack', { screen: 'Login' });
            }
        }, 3000);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={'#6a1b9a'} barStyle={'light-content'} />
            <Animated.View style={{ alignItems: 'center', transform: [{ scale }] }}>
                <Animated.Text style={[styles.text, { opacity }]}>
                    DMS App
                </Animated.Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#6a1b9a',
    },
    logo: {
        width: width * 0.4,
        height: width * 0.4,
        marginBottom: 20,
    },
    text: {
        fontSize: width * 0.06,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.4)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
});

export default SplashScreen;
