import axios from 'axios';

const API_URL = 'https://apis.allsoft.co/api/documentManagement';

export const authService = {
    requestOTP: async (mobileNumber) => {
        return new Promise(async (resolve, reject) => {
            try {

                let fetchParameter = {
                    method: 'POST',
                    body: JSON.stringify({ mobile_number: mobileNumber }),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                }
                let serverResponse = await fetch(API_URL + `/generateOTP`, fetchParameter);
                let response = await serverResponse.json();
                resolve(response);
            }
            catch (error) {
                reject(error);
            }
        })
    },

    verifyOTP: async (mobileNumber, otp) => {
        return new Promise(async (resolve, reject) => {
            try {

                let fetchParameter = {
                    method: 'POST',
                    body: JSON.stringify({ mobile_number: mobileNumber, otp: otp }),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                }
                let serverResponse = await fetch(API_URL + `/validateOTP`, fetchParameter);
                let response = await serverResponse.json();
                resolve(response);
            }
            catch (error) {
                reject(error);
            }
        })
    },
};