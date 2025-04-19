import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated, Dimensions, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Easing } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC<{ navigation: { navigate: (screen: string, params?: object) => void; replace: (screen: string, params?: object) => void; } }> = ({ navigation }) => {
    const [mobileNumber, setMobileNumber] = useState('');
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [error, setError] = useState('');
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease),
            }),
            Animated.timing(scale, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease),
            }),
        ]).start();
    }, []);

    const handleLogin = async () => {
        setIsSendingOtp(true);
        setError('');
        if (!mobileNumber) {
            setError('Please enter your mobile number.');
            setIsSendingOtp(false);
            return;
        }
        if (mobileNumber.length !== 10) {
            setError('Please enter a valid 10-digit mobile number.');
            setIsSendingOtp(false);
            return;
        }

        try {

            // const result = await fetch('https://apis.allsoft.co/api/documentManagement//generateOTP', {
            //     method: 'POST',
            //     body: JSON.stringify({ mobile_number: mobileNumber }),
            //     headers: {
            //         'Content-Type': 'application/json'
            //     }
            // })
            // const response = await result.json();
            // const {status,data} = response;
            // if(status){
            //     navigation.navigate('Otp', { mobileNumber });
            // }

            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log('Sending OTP to:', mobileNumber);
            Keyboard.dismiss();
            navigation.navigate('Otp', { mobileNumber });
            setIsSendingOtp(false);

        } catch (err: any) {
            setError(`Error sending OTP: ${err.message || 'An error occurred'}`);
            setIsSendingOtp(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Animated.View style={{ alignItems: 'center', transform: [{ scale }] }}>
                    <Text style={styles.title}>Login</Text>
                    <Text style={styles.subtitle}>
                        Enter your mobile number to login/register.
                    </Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.countryCode}>+91</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="phone-pad"
                            placeholder="Mobile Number"
                            value={mobileNumber}
                            onChangeText={setMobileNumber}
                            maxLength={10}
                            placeholderTextColor="#999"
                            selectionColor="#000"
                            inputMode="numeric"
                        />
                    </View>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    <TouchableOpacity
                        onPress={handleLogin}
                        style={[styles.loginButton, isSendingOtp && styles.disabledButton]}
                        disabled={isSendingOtp}
                    >
                        <Text style={styles.loginButtonText}>
                            {isSendingOtp ? 'Sending OTP...' : 'Login/Register'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
};



const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: width * 0.08,
    },
    title: {
        fontSize: width * 0.08,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: height * 0.02,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: width * 0.04,
        color: '#555555',
        marginBottom: height * 0.05,
        textAlign: 'center',
        lineHeight: 22,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: width * 0.8,
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRadius: width * 0.02,
        paddingHorizontal: width * 0.03,
        marginBottom: height * 0.03,
        backgroundColor: '#f8f8f8'
    },
    countryCode: {
        fontSize: width * 0.045,
        color: '#333333',
        marginRight: width * 0.02,
    },
    input: {
        flex: 1,
        fontSize: width * 0.045,
        color: '#333333',
        height: height * 0.06,
        paddingVertical: 0,
    },
    loginButton: {
        backgroundColor: '#6a1b9a',
        borderRadius: width * 0.02,
        paddingVertical: height * 0.015,
        paddingHorizontal: width * 0.1,
        alignItems: 'center',
        marginTop: height * 0.02,
        width: width * 0.8,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: width * 0.045,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#ff4444',
        fontSize: width * 0.035,
        marginBottom: height * 0.02,
        textAlign: 'center',
    },
    disabledButton: {
        backgroundColor: 'rgba(106, 27, 154, 0.5)',
        opacity: 0.7,
    },
});

export default LoginScreen;
