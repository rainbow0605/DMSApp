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

    const handleSearch = async () => {
        setLoading(true);
        try {
            const searchParams = {
                major_head: majorHead,
                minor_head: minorHead,
                tags: tags,
                from_date: fromDate ? fromDate.toISOString().split('T')[0] : null,
                to_date: toDate ? toDate.toISOString().split('T')[0] : null,
            };

            const results = await documentService.searchDocuments(searchParams);
            setSearchResults(results);
            setSelectedDocuments([]);
        } catch (error) {
            Alert.alert('Error', 'Failed to search documents');
        } finally {
            setLoading(false);
        }
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

    const renderDocumentItem = ({ item }) => (
        <View style={styles.documentItem}>
            <TouchableOpacity
                style={styles.documentCheckbox}
                onPress={() => toggleDocumentSelection(item.id)}
            >
                <Icon
                    name={selectedDocuments.includes(item.id) ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color="#3498db"
                />
            </TouchableOpacity>
            <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>{item.title}</Text>
                <Text style={styles.documentDate}>Date: {item.date}</Text>
                <Text style={styles.documentCategory}>
                    {item.major_head} - {item.minor_head}
                </Text>
                <View style={styles.documentTags}>
                    {item.tags.map((tag, index) => (
                        <View key={index} style={styles.tagChip}>
                            <Text style={styles.tagChipText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            </View>
            <View style={styles.documentActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handlePreviewDocument(item)}
                >
                    <Icon name="visibility" size={20} color="#3498db" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView style={styles.searchForm}>
                {/* Major Head (Category) */}
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
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={handleSearch}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Icon name="search" size={20} color="#fff" />
                            <Text style={styles.searchButtonText}>Search Documents</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Results Section */}
            <View style={styles.resultsContainer}>
                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsTitle}>
                        Search Results ({searchResults.length})
                    </Text>
                    {searchResults.length > 0 && (
                        <TouchableOpacity
                            style={styles.downloadButton}
                            onPress={handleDownloadSelected}
                        >
                            <Icon name="file-download" size={20} color="#fff" />
                            <Text style={styles.downloadButtonText}>Download Selected</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {searchResults.length > 0 ? (
                    <FlatList
                        data={searchResults}
                        renderItem={renderDocumentItem}
                        keyExtractor={(item) => item.id.toString()}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    searchForm: {
        padding: 15,
        maxHeight: '50%',
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
        marginTop: 20,
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
    },
    noResultsText: {
        fontSize: 16,
        color: '#777',
        marginTop: 10,
    },
});

export default FileSearchScreen;
