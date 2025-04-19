import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated, Dimensions, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Easing } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { LocalStorage } from '../utils/LocalStorage';

const { width, height } = Dimensions.get('window');

interface OtpScreenProps {
    navigation: {
        navigate: (screen: string, params?: object) => void;
        replace: (screen: string, params?: object) => void;
        goBack: () => void;
    };
    route: {
        params?: {
            mobileNumber: string;
        };
    };
}

const OtpScreen: React.FC<OtpScreenProps> = (props) => {
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(30);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const { navigation, route } = props;
    const { goBack } = navigation;
    const { navigate } = navigation;
    const { replace } = navigation;
    const mobileNumber = route?.params?.mobileNumber || '';
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.8)).current;
    const inputRefs = useRef<(TextInput | null)[]>([]);

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

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleVerifyOTP = async () => {
        setIsVerifying(true);
        setError('');
        if (!otp || otp.length !== 6) {
            setError('Please enter a 6-digit OTP.');
            setIsVerifying(false);
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (otp === '123456') {
                const token = 'dummy_auth_token';
                console.log('Token stored:', token);
                LocalStorage.storeData('auth_token', token);
                LocalStorage.storeData('user_name', mobileNumber);
                Keyboard.dismiss();
                navigation.replace('HomeStack', { screen: 'Home' });
            } else {
                setError('Invalid OTP. Please try again.');
                setIsVerifying(false);
            }
        } catch (err: any) {
            setError(`Error verifying OTP: ${err.message || 'An error occurred'}`);
            setIsVerifying(false);
        }
    };

    const handleResendOTP = () => {
        if (timer === 0) {
            console.log('Resending OTP to', mobileNumber);
            setTimer(30);
            setError('');
            if (inputRefs.current[0]) {
                inputRefs.current[0]?.focus();
            }
        }
    };

    const handleInputChange = (text: string, index: number) => {
        const newOtp = otp.split('');
        newOtp[index] = text;
        const newOtpString = newOtp.join('');
        setOtp(newOtpString);

        if (text && index < 5) {
            if (inputRefs.current[index + 1]) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Animated.View style={{ alignItems: 'center', transform: [{ scale }] }}>
                    <Text style={styles.title}>Verification</Text>
                    <Text style={styles.subtitle}>
                        Enter the 6-digit code sent to {mobileNumber}
                    </Text>

                    <View style={styles.otpInputContainer}>
                        {Array.from({ length: 6 }).map((_, index) => (
                            <TextInput
                                key={index}
                                style={styles.otpInput}
                                keyboardType="number-pad"
                                maxLength={1}
                                value={otp[index] || ''}
                                onChangeText={(text) => handleInputChange(text, index)}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                textAlign="center"
                                selectionColor="#000"
                                inputMode="numeric"
                                textContentType="oneTimeCode"
                            />
                        ))}
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity
                        onPress={handleVerifyOTP}
                        style={[styles.verifyButton, isVerifying && styles.disabledButton]}
                        disabled={isVerifying}
                    >
                        <Text style={styles.verifyButtonText}>
                            {isVerifying ? 'Verifying...' : 'Verify Code'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>
                            Didn't receive the code?{' '}
                        </Text>
                        <TouchableOpacity
                            onPress={handleResendOTP}
                            disabled={timer > 0}
                        >
                            <Text style={[styles.resendLink, timer > 0 && styles.disabledLink]}>
                                Resend ({timer}s)
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Text style={styles.backButtonText}>Back to Login</Text>
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
    otpInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: width * 0.7,
        marginBottom: height * 0.03,
    },
    otpInput: {
        width: width * 0.1,
        height: width * 0.1,
        borderRadius: width * 0.015,
        borderWidth: 1,
        borderColor: '#cccccc',
        fontSize: width * 0.05,
        color: '#333333',
        backgroundColor: '#f8f8f8',
        ...Platform.select({
            ios: {
                paddingVertical: height * 0.015,
            },
            android: {
                paddingVertical: 0,
            },
        }),
    },
    errorText: {
        color: '#ff4444',
        fontSize: width * 0.035,
        marginBottom: height * 0.02,
        textAlign: 'center',
    },
    verifyButton: {
        backgroundColor: '#6a1b9a',
        borderRadius: width * 0.02,
        paddingVertical: height * 0.015,
        paddingHorizontal: width * 0.1,
        alignItems: 'center',
        marginTop: height * 0.02,
        width: width * 0.8,
    },
    verifyButtonText: {
        color: '#FFFFFF',
        fontSize: width * 0.045,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: 'rgba(106, 27, 154, 0.5)',
        opacity: 0.7,
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: height * 0.03,
    },
    resendText: {
        fontSize: width * 0.035,
        color: '#555555',
    },
    resendLink: {
        fontSize: width * 0.035,
        color: '#6a1b9a',
        fontWeight: 'bold',
    },
    disabledLink: {
        color: '#aaaaaa',
    },
    backButton: {
        marginTop: height * 0.04,
    },
    backButtonText: {
        color: '#007BFF',
        fontSize: width * 0.04,
    },
});

export default OtpScreen;
