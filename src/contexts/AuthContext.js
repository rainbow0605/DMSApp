import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [user, setUser] = useState(null);
    const [mobileNumber, setMobileNumber] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const userData = await AsyncStorage.getItem('userData');
                if (token && userData) {
                    setUserToken(token);
                    setUser(JSON.parse(userData));
                }
            } catch (e) {
                console.error('Failed to fetch token from storage', e);
            } finally {
                setIsLoading(false);
            }
        };

        bootstrapAsync();
    }, []);

    const sendOTP = async (mobile) => {
        try {
            console.log(`OTP sent to ${mobile}`);
            setMobileNumber(mobile);
            setOtpSent(true);
            return true;
        } catch (error) {
            console.error('Error sending OTP:', error);
            return false;
        }
    };

    const verifyOTP = async (otp) => {
        try {
            if (otp && otp.length === 6) {
                const token = 'token_' + Math.random().toString(36).substring(2, 15);
                const userData = {
                    mobileNumber,
                    name: 'User ' + mobileNumber.substring(mobileNumber.length - 4),
                    id: Math.random().toString(36).substring(2, 9)
                };

                await AsyncStorage.setItem('userToken', token);
                await AsyncStorage.setItem('userData', JSON.stringify(userData));

                setUserToken(token);
                setUser(userData);
                setOtpSent(false);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error verifying OTP:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            setUserToken(null);
            setUser(null);
            setMobileNumber('');
        } catch (e) {
            console.error('Error logging out:', e);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isLoading,
                userToken,
                user,
                mobileNumber,
                otpSent,
                setOtpSent,
                sendOTP,
                verifyOTP,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};