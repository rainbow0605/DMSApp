import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    FlatList,
    ActivityIndicator,
    Alert,
    Platform,
    ToastAndroid,
    Linking,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { documentService } from '../services/documentService';
import { LocalStorage } from '../utils/LocalStorage';

const FileSearchScreen = ({ navigation }) => {
    const [majorHead, setMajorHead] = useState('');
    const [minorHead, setMinorHead] = useState('');
    const [tags, setTags] = useState([]);
    const [currentTag, setCurrentTag] = useState('');
    const [availableTags, setAvailableTags] = useState([]);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [fromDatePickerOpen, setFromDatePickerOpen] = useState(false);
    const [toDatePickerOpen, setToDatePickerOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchText, setSearchText] = useState('');

    const minorHeadOptions = {
        Personal: ['John', 'Emily', 'Tom', 'Roy', 'Heena'],
        Professional: ['Accounts', 'HR', 'IT', 'Finance', 'Marketing'],
        Company: ['Work Order', 'Contract', 'Invoice', 'Receipt']
    };

    useEffect(() => {
        fetchInitialDocuments();
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const result = await documentService.getTags();
            const { status, data } = result;
            if (status) {
                const fetchedTags = data?.map(tag => ({ id: tag?.id, name: tag?.label }));
                setAvailableTags(fetchedTags);
            } else {
                if (Platform.OS === 'android') {
                    ToastAndroid.show('Error fetching tags', ToastAndroid.SHORT);
                } else {
                    Alert.alert('Error', 'Failed to fetch tags');
                }
            }
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        }
    };

    const fetchInitialDocuments = async () => {
        setLoading(true);
        try {
            const response = await fetchDocuments(0);
            if (response.status) {
                // const filteredData = response.data.filter(doc => doc.filterId === 'test_hitesh');
                // console.log({ filteredData });

                setSearchResults(response.data);
                setTotalRecords(response.recordsTotal);
            }
        } catch (error) {
            console.error('Error fetching initial documents:', error);
            Alert.alert('Error', 'Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const fetchDocuments = async (start = 0) => {
        const userData = await LocalStorage.getData('user_data');
        const userId = userData?.user_id || userData?.user_name || '';

        const formattedFromDate = fromDate ? formatDate(fromDate) : '';
        const formattedToDate = toDate ? formatDate(toDate) : '';

        const formattedTags = tags.map(tag => ({ tag_name: tag }));

        const tagsToSend = formattedTags.length > 0
            ? formattedTags
            : [{ tag_name: '' }, { tag_name: '' }];

        const requestData = {
            major_head: majorHead || '',
            minor_head: minorHead || '',
            from_date: formattedFromDate,
            to_date: formattedToDate,
            tags: tagsToSend,
            uploaded_by: userId,
            start: start,
            length: pageSize,
            filterId: userId,
            search: {
                value: searchText
            }
        };

        try {
            const result = await documentService.searchDocuments(requestData);
            return result;
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleMajorHeadChange = (value) => {
        setMajorHead(value);
        setMinorHead('');
    };

    const handleAddTag = () => {
        if (currentTag.trim() !== '' && !tags.includes(currentTag.trim())) {
            setTags([...tags, currentTag.trim()]);
            setCurrentTag('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };
    const handleSearch = async () => {
        setLoading(true);
        setPage(0);
        try {
            const result = await fetchDocuments(0);
            if (result.status) {
                setSearchResults(result.data);
                setTotalRecords(result.recordsTotal);
                setSelectedDocuments([]);
            } else {
                Alert.alert('Error', 'Failed to search documents');
            }
        } catch (error) {
            console.error('Search error:', error);
            Alert.alert('Error', 'Failed to search documents');
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = async () => {
        if (loadingMore || searchResults.length >= totalRecords) return;

        setLoadingMore(true);
        const nextPage = page + 1;
        const start = nextPage * pageSize;

        try {
            const result = await fetchDocuments(start);
            if (result.status) {
                setSearchResults([...searchResults, ...result.data]);
                setPage(nextPage);
            }
        } catch (error) {
            console.error('Load more error:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleClearFilters = async () => {
        setMajorHead('');
        setMinorHead('');
        setTags([]);
        setFromDate(null);
        setToDate(null);
        setSelectedDocuments([]);
        setPage(0);
        setSearchText('');

        fetchInitialDocuments();
    };

    const toggleDocumentSelection = (documentId) => {
        if (selectedDocuments.includes(documentId)) {
            setSelectedDocuments(selectedDocuments.filter(id => id !== documentId));
        } else {
            setSelectedDocuments([...selectedDocuments, documentId]);
        }
    };

    const handlePreviewDocument = (document) => {
        navigation.navigate('FilePreview', { document });
        // Linking.openURL(document?.file_url);
    };

    const handleDownloadSelected = () => {
        if (selectedDocuments.length === 0) {
            Alert.alert('Info', 'Please select at least one document to download');
            return;
        }

        Alert.alert(
            'Download Files',
            `Download ${selectedDocuments.length} selected document(s)?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Download',
                    onPress: async () => {
                        try {
                            Alert.alert('Success', 'Files downloaded successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to download files');
                        }
                    },
                },
            ]
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;

        return (
            <View style={styles.loaderFooter}>
                <ActivityIndicator size="small" color="#3498db" />
                <Text style={styles.loadingMoreText}>Loading more documents...</Text>
            </View>
        );
    };

    const renderDocumentItem = ({ item }) => (
        <View style={styles.card}>
            <TouchableOpacity
                style={styles.checkbox}
                onPress={() => toggleDocumentSelection(item.document_id)}
            >
                <Icon
                    name={selectedDocuments.includes(item.document_id) ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color="#2c3e50"
                />
            </TouchableOpacity>

            <View style={styles.info}>
                <Text style={styles.date}>📝 Document #{item.document_id}</Text>
                <Text style={[styles.date, { marginTop: 5 }]}>📅 {new Date(item.document_date).toLocaleDateString()}</Text>
                <Text style={[styles.category, { marginTop: 5 }]}>
                    🗂️ {item.major_head} → {item.minor_head}
                </Text>

                {item.document_remarks && (
                    <Text style={[styles.remarks, { marginTop: 5 }]}>
                        💬 {item.document_remarks}
                    </Text>
                )}

                <Text style={[styles.uploader, { marginTop: 5 }]}>
                    👤 Uploaded by: {item.uploaded_by} on {new Date(item.upload_time).toLocaleString()}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.previewButton}
                onPress={() => handlePreviewDocument(item)}
            >
                <Icon name="visibility" size={22} color="#2ecc71" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Search Document</Text>
            </View>

            <ScrollView>
                <View style={[styles.searchForm, { paddingHorizontal: 28 }]}>
                    <View style={styles.searchBarContainer}>
                        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search documents by keyword..."
                            value={searchText}
                            onChangeText={setSearchText}
                            returnKeyType="search"
                            onSubmitEditing={handleSearch}
                            placeholderTextColor="#999"
                        />
                        {searchText !== '' && (
                            <TouchableOpacity
                                style={styles.clearSearchButton}
                                onPress={() => setSearchText('')}
                            >
                                <Icon name="clear" size={20} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={styles.label}>Category</Text>
                    <View style={styles.pickerContainer}>
                        <TouchableOpacity
                            style={[
                                styles.pickerOption,
                                majorHead === 'Personal' && styles.selectedOption,
                            ]}
                            onPress={() => handleMajorHeadChange('Personal')}
                        >
                            <Text
                                style={[
                                    styles.pickerOptionText,
                                    majorHead === 'Personal' && styles.selectedOptionText,
                                ]}
                            >
                                Personal
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.pickerOption,
                                majorHead === 'Professional' && styles.selectedOption,
                            ]}
                            onPress={() => handleMajorHeadChange('Professional')}
                        >
                            <Text
                                style={[
                                    styles.pickerOptionText,
                                    majorHead === 'Professional' && styles.selectedOptionText,
                                ]}
                            >
                                Professional
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {majorHead && (
                        <>
                            <Text style={styles.label}>Subcategory</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.minorHeadContainer}
                            >
                                {minorHeadOptions[majorHead]?.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.minorHeadOption,
                                            minorHead === option && styles.selectedOption,
                                        ]}
                                        onPress={() => setMinorHead(option)}
                                    >
                                        <Text
                                            style={[
                                                styles.minorHeadOptionText,
                                                minorHead === option && styles.selectedOptionText,
                                            ]}
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </>
                    )}

                    <Text style={styles.label}>Tags</Text>
                    <View style={styles.tagInputContainer}>
                        <TextInput
                            style={styles.tagInput}
                            placeholder="Add tags"
                            value={currentTag}
                            onChangeText={setCurrentTag}
                            placeholderTextColor={'#999'}
                        />
                        <TouchableOpacity style={styles.tagAddButton} onPress={handleAddTag}>
                            <Icon name="add" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.selectedTags}>
                        {tags.map((tag, index) => (
                            <View key={index} style={styles.tagChip}>
                                <Text style={styles.tagChipText}>{tag}</Text>
                                <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                                    <Icon name="close" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.suggestionsContainer}
                    >
                        {availableTags.map((tag, index) => (
                            <TouchableOpacity
                                key={tag.id}
                                style={[styles.suggestionChip, { marginLeft: index === 0 ? 28 : 5 }]}
                                onPress={() => {
                                    if (!tags.includes(tag.name)) {
                                        setTags([...tags, tag.name]);
                                    }
                                }}
                            >
                                <Text style={styles.suggestionChipText}>{tag.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.dateRangeContainer}>
                        <View style={styles.datePickerWrapper}>
                            <Text style={styles.label}>From Date</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setFromDatePickerOpen(true)}
                            >
                                <Text>
                                    {fromDate ? fromDate.toISOString().split('T')[0] : 'Select Date'}
                                </Text>
                                <Icon name="calendar-today" size={20} color="#666" />
                            </TouchableOpacity>
                            <DatePicker
                                modal
                                open={fromDatePickerOpen}
                                date={fromDate || new Date()}
                                mode="date"
                                onConfirm={(date) => {
                                    setFromDatePickerOpen(false);
                                    setFromDate(date);
                                }}
                                onCancel={() => {
                                    setFromDatePickerOpen(false);
                                }}
                            />
                        </View>

                        <View style={styles.datePickerWrapper}>
                            <Text style={styles.label}>To Date</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setToDatePickerOpen(true)}
                            >
                                <Text>
                                    {toDate ? toDate.toISOString().split('T')[0] : 'Select Date'}
                                </Text>
                                <Icon name="calendar-today" size={20} color="#666" />
                            </TouchableOpacity>
                            <DatePicker
                                modal
                                open={toDatePickerOpen}
                                date={toDate || new Date()}
                                mode="date"
                                onConfirm={(date) => {
                                    setToDatePickerOpen(false);
                                    setToDate(date);
                                }}
                                onCancel={() => {
                                    setToDatePickerOpen(false);
                                }}
                            />
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                        <TouchableOpacity
                            style={styles.searchButton}
                            onPress={handleSearch}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon name="search" size={20} color="#fff" />
                                    <Text style={styles.searchButtonText}>Search Documents</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
                            <Icon name="clear" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.resultsContainer, { paddingHorizontal: 28, marginTop: 20 }]}>
                    <View style={styles.resultsHeader}>
                        {searchResults?.length > 0 && (
                            <TouchableOpacity
                                style={styles.downloadButton}
                                onPress={handleDownloadSelected}
                            >
                                <Icon name="file-download" size={20} color="#fff" />
                                <Text style={styles.downloadButtonText}>Download Selected</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {searchResults?.length > 0 ? (
                        <>
                            <FlatList
                                data={searchResults}
                                renderItem={renderDocumentItem}
                                keyExtractor={(item) => item.document_id.toString()}
                                contentContainerStyle={styles.resultsList}
                                ListFooterComponent={renderFooter}
                            />

                            {searchResults.length < totalRecords && (
                                <TouchableOpacity
                                    style={styles.loadMoreButton}
                                    onPress={handleLoadMore}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Icon name="arrow-downward" size={18} color="#fff" />
                                            <Text style={styles.loadMoreButtonText}>
                                                Load More ({searchResults.length} of {totalRecords})
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )}
                        </>
                    ) : (
                        <View style={styles.noResults}>
                            <Icon name="search" size={50} color="#ddd" />
                            <Text style={styles.noResultsText}>
                                {loading
                                    ? 'Searching...'
                                    : 'No documents found. Try adjusting your search criteria.'}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    searchForm: {
        padding: 15,
    },
    header: {
        backgroundColor: '#6a1b9a',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 15,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginVertical: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 45,
        fontSize: 16,
        color: '#333',
    },
    clearSearchButton: {
        padding: 8,
    },
    suggestionsContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    suggestionChip: {
        backgroundColor: '#f0f8ff',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#add8e6',
    },
    suggestionChipText: {
        color: '#007bff',
        fontSize: 15,
    },
    selectedChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    selectedChip: {
        backgroundColor: '#007bff',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    selectedChipText: {
        color: '#fff',
        marginRight: 8,
        fontSize: 15,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 10,
        color: '#2c3e50',
    },
    pickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pickerOption: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginRight: 10,
        alignItems: 'center',
    },
    selectedOption: {
        backgroundColor: '#3498db',
        borderColor: '#3498db',
    },
    pickerOptionText: {
        color: '#333',
    },
    selectedOptionText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    minorHeadContainer: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    minorHeadOption: {
        padding: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginRight: 10,
    },
    minorHeadOptionText: {
        color: '#333',
        fontSize: 12,
    },
    tagInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagInput: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
    },
    tagAddButton: {
        backgroundColor: '#3498db',
        borderRadius: 5,
        padding: 10,
        marginLeft: 10,
    },
    selectedTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    tagChip: {
        backgroundColor: '#007bff',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginRight: 8,
        marginBottom: 8,
    },
    tagChipText: {
        color: '#fff',
        marginRight: 8,
        fontSize: 14,
    },
    dateRangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    datePickerWrapper: {
        flex: 1,
        marginRight: 10,
    },
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
    },
    searchButton: {
        backgroundColor: '#3498db',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
        width: '80%',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    clearButton: {
        backgroundColor: '#e74c3c',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        marginLeft: 20,
    },
    resultsContainer: {
        flex: 1,
        padding: 15,
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 10,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3498db',
        borderRadius: 5,
        padding: 10,
    },
    downloadButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    resultsList: {
        paddingBottom: 20,
    },
    noResults: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    noResultsText: {
        fontSize: 16,
        color: '#777',
        marginTop: 10,
        textAlign: 'center',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginVertical: 8,
        marginHorizontal: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    checkbox: {
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    date: {
        fontSize: 14,
        color: '#555',
    },
    category: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    remarks: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    uploader: {
        fontSize: 12,
        color: '#888',
    },
    previewButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#eafaf1',
    },
    loaderFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    loadingMoreText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#666',
    },
    paginationInfo: {
        textAlign: 'center',
        padding: 10,
        color: '#666',
        fontSize: 14,
    },
    loadMoreButton: {
        backgroundColor: '#3498db',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginVertical: 15,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loadMoreButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },
});

export default FileSearchScreen;