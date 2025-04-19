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

    const minorHeadOptions = {
        Personal: ['John', 'Tom', 'Emily', 'Sarah', 'Mike'],
        Professional: ['Accounts', 'HR', 'IT', 'Finance', 'Marketing'],
    };

    useEffect(() => {
        getAllTheDocuments();
        const fetchTags = async () => {
            try {
                const tags = await documentService.getTags();
                setAvailableTags(tags);
            } catch (error) {
                console.error('Failed to fetch tags:', error);
            }
        };

        fetchTags();
    }, []);

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

    const getAllTheDocuments = async () => {
        try {
            const result = await LocalStorage.getData('documents_data');
            console.log({ result });

            setSearchResults(result);
        } catch (error) {
            console.log(error);
        }
    }

    const handleSearch = async () => {
        setLoading(true);
        try {
            const allDocuments = await LocalStorage.getData('documents_data');

            const filteredDocuments = allDocuments.filter(doc => {
                const docDate = new Date(doc.date);

                const isMajorMatch = majorHead ? doc.major_head === majorHead : true;
                const isMinorMatch = minorHead ? doc.minor_head === minorHead : true;

                const isTagMatch =
                    tags?.length > 0
                        ? tags.every(tag => doc.tags.includes(tag))
                        : true;

                const isDateInRange =
                    (!fromDate || docDate >= fromDate) &&
                    (!toDate || docDate <= toDate);

                return isMajorMatch && isMinorMatch && isTagMatch && isDateInRange;
            });

            setSearchResults(filteredDocuments);
            setSelectedDocuments([]);
        } catch (error) {
            Alert.alert('Error', 'Failed to search documents');
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = async () => {
        setMajorHead(null);
        setMinorHead(null);
        setTags([]);
        setFromDate(null);
        setToDate(null);
        setSelectedDocuments([]);
        // setLoading(true);

        try {
            const allDocuments = await LocalStorage.getData('documents_data');
            setSearchResults(allDocuments);
        } catch (error) {
            Alert.alert('Error', 'Failed to reset documents');
        } finally {
            setLoading(false);
        }
    };



    const toggleDocumentSelection = (documentId) => {
        if (selectedDocuments?.includes(documentId)) {
            setSelectedDocuments(selectedDocuments.filter(id => id !== documentId));
        } else {
            setSelectedDocuments([...selectedDocuments, documentId]);
        }
    };

    const handlePreviewDocument = (document) => {
        navigation.navigate('FilePreview', { document });
    };

    const handleDownloadSelected = () => {
        if (selectedDocuments?.length === 0) {
            Alert.alert('Info', 'Please select at least one document to download');
            return;
        }

        Alert.alert(
            'Download Files',
            `Download ${selectedDocuments?.length} selected document(s)?`,
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

    const renderDocumentItem = ({ item }) => (
        <View style={styles.card}>
            <TouchableOpacity
                style={styles.checkbox}
                onPress={() => toggleDocumentSelection(item.id)}
            >
                <Icon
                    name={selectedDocuments.includes(item.id) ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color="#2c3e50"
                />
            </TouchableOpacity>

            <View style={styles.info}>
                <Text style={styles.date}>📝 {item?.title}</Text>
                <Text style={[styles.date, { marginTop: 5 }]}>📅 {item.date}</Text>
                <Text style={[styles.category, { marginTop: 5 }]}>
                    🗂️ {item.major_head} → {item.minor_head}
                </Text>

                <View style={[styles.tagsContainer, { marginTop: 5 }]}>
                    {item.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                    ))}
                </View>
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
                                {minorHeadOptions[majorHead].map((option) => (
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

                    {/* Date Range */}
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

                    {/* Search Button */}
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

                <View style={[styles.resultsContainer, { paddingHorizontal: 28 }]}>
                    <View style={styles.resultsHeader}>
                        {/* <Text style={styles.resultsTitle}>
                        Search Results ({searchResults.length})
                    </Text> */}
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
                        <FlatList
                            data={searchResults}
                            renderItem={renderDocumentItem}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={styles.resultsList}
                        />
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
        maxHeight: '50%',
    },
    header: {
        backgroundColor: '#6a1b9a',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 15,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
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
    tagAddButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    dateRangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    dateInput: {
        flexDirection: 'row',
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
        width: '80%'
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    resultsContainer: {
        flex: 1,
        padding: 15,
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    resultsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
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
        marginTop: 10,
    },
    noResults: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
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
        marginBottom: 4,
    },
    category: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    tag: {
        backgroundColor: '#e0f7fa',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        marginRight: 6,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 12,
        color: '#00796b',
    },
    previewButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#eafaf1',
    },
    clearButton: {
        backgroundColor: '#e74c3c',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        marginLeft: 20
    },

    clearButtonText: {
        color: '#fff',
        fontWeight: '600',
    },

});

export default FileSearchScreen;
