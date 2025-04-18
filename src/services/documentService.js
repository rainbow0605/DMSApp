import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.example.com';

const getAuthInstance = async () => {
    const token = await AsyncStorage.getItem('authToken');
    return axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
        },
    });
};

export const documentService = {
    uploadDocument: async (formData) => {
        try {
            const authInstance = await getAuthInstance();
            const response = await authInstance.post('/documents/upload', formData);
            return response.data;
        } catch (error) {
            console.error('Error uploading document:', error);
            throw error;
        }
    },

    getTags: async () => {
        try {
            return [
                { id: 1, name: 'Invoice' },
                { id: 2, name: 'Receipt' },
                { id: 3, name: 'Contract' },
                { id: 4, name: 'Report' },
                { id: 5, name: 'Certificate' },
            ];
        } catch (error) {
            console.error('Error fetching tags:', error);
            throw error;
        }
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