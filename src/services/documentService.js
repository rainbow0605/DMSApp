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

    searchDocuments: async (searchParams) => {
        try {
            return [
                {
                    id: 1,
                    title: 'Invoice #12345',
                    date: '2023-01-15',
                    tags: ['Invoice', 'Finance'],
                    major_head: 'Professional',
                    minor_head: 'Accounts',
                    file_type: 'pdf',
                    file_url: 'https://example.com/files/invoice.pdf',
                },
                {
                    id: 2,
                    title: 'Meeting Notes',
                    date: '2023-02-20',
                    tags: ['Notes', 'Meeting'],
                    major_head: 'Professional',
                    minor_head: 'HR',
                    file_type: 'pdf',
                    file_url: 'https://example.com/files/notes.pdf',
                },
                {
                    id: 3,
                    title: 'ID Card',
                    date: '2023-03-10',
                    tags: ['ID', 'Personal'],
                    major_head: 'Personal',
                    minor_head: 'John',
                    file_type: 'image',
                    file_url: 'https://example.com/files/id.jpg',
                }
            ];
        } catch (error) {
            console.error('Error searching documents:', error);
            throw error;
        }
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