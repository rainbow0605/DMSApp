import { LocalStorage } from '../utils/LocalStorage';

const API_URL = 'https://apis.allsoft.co/api/documentManagement';

const getAuthInstance = async () => {
    const userData = await LocalStorage.getData('user_data');
    return userData?.token;
};

export const documentService = {
    uploadDocument: async (formData) => {
        return new Promise(async (resolve, reject) => {
            try {
                const userData = await LocalStorage.getData('user_data');
                let fetchParameter = {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'token': userData?.token
                    },
                }
                let serverResponse = await fetch(API_URL + `/saveDocumentEntry`, fetchParameter);
                let response = await serverResponse.json();
                resolve(response);
            }
            catch (error) {
                reject(error);
            }
        })
    },

    getTags: async () => {
        return new Promise(async (resolve, reject) => {
            try {
                const userData = await LocalStorage.getData('user_data');
                let fetchParameter = {
                    method: 'POST',
                    body: JSON.stringify({ term: '' }),
                    headers: {
                        'Content-Type': 'application/json',
                        'token': userData?.token
                    },
                }
                let serverResponse = await fetch(API_URL + `/documentTags`, fetchParameter);
                let response = await serverResponse.json();
                resolve(response);
            }
            catch (error) {
                reject(error);
            }
        })
    },

    searchDocuments: async (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                const userData = await LocalStorage.getData('user_data');
                let fetchParameter = {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'application/json',
                        'token': userData?.token
                    },
                }
                let serverResponse = await fetch(API_URL + `/searchDocumentEntry`, fetchParameter);
                let response = await serverResponse.json();
                resolve(response);
            }
            catch (error) {
                reject(error);
            }
        })
    },

    downloadDocument: async (documentId) => {
        try {
            const authInstance = await getAuthInstance();
            const response = await authInstance.get(`/documents/download/${documentId}`, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.error('Error downloading document:', error);
            throw error;
        }
    },

    downloadMultiple: async (documentIds) => {
        try {
            const authInstance = await getAuthInstance();
            const response = await authInstance.post('/documents/download-multiple',
                { documentIds },
                { responseType: 'blob' }
            );
            return response.data;
        } catch (error) {
            console.error('Error downloading multiple documents:', error);
            throw error;
        }
    }
};