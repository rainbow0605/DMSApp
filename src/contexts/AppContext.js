import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [downloadedFiles, setDownloadedFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const performSearch = async (query) => {
        try {
            setIsLoading(true);
            setError(null);

            await new Promise(resolve => setTimeout(resolve, 1500));

            const results = [
                {
                    id: '1',
                    name: 'Project Proposal.pdf',
                    type: 'application/pdf',
                    size: '2.4 MB',
                    url: 'https://example.com/files/proposal.pdf',
                    dateModified: '2023-10-15'
                },
                {
                    id: '2',
                    name: 'Team Photo.jpg',
                    type: 'image/jpeg',
                    size: '1.8 MB',
                    url: 'https://example.com/files/team.jpg',
                    dateModified: '2023-09-22'
                },
                {
                    id: '3',
                    name: 'Financial Report.xlsx',
                    type: 'application/vnd.ms-excel',
                    size: '3.2 MB',
                    url: 'https://example.com/files/report.xlsx',
                    dateModified: '2023-10-10'
                },
                {
                    id: '4',
                    name: 'Meeting Minutes.docx',
                    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    size: '987 KB',
                    url: 'https://example.com/files/minutes.docx',
                    dateModified: '2023-10-18'
                }
            ];

            setSearchResults(results);
            setIsLoading(false);
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to perform search. Please try again.');
            setIsLoading(false);
        }
    };

    const value = {
        searchQuery,
        setSearchQuery,
        searchResults,
        setSearchResults,
        downloadedFiles,
        setDownloadedFiles,
        isLoading,
        error,
        performSearch
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};