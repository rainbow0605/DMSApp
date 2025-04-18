import axios from 'axios';

const API_URL = 'https://api.example.com';

export const authService = {
    requestOTP: async (mobileNumber) => {
        try {
            console.log(`Requesting OTP for ${mobileNumber}`);

            return {
                success: true,
                message: 'OTP sent successfully'
            };
        } catch (error) {
            console.error('Error requesting OTP:', error);
            throw error;
        }
    },

    verifyOTP: async (mobileNumber, otp) => {
        try {
            console.log(`Verifying OTP ${otp} for ${mobileNumber}`);

            return {
                success: true,
                token: 'mock-jwt-token-12345',
                message: 'OTP verified successfully'
            };
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw error;
        }
    }
};