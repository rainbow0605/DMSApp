import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
    Alert,
    ActivityIndicator,
    PermissionsAndroid,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DocumentPicker from '@react-native-documents/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { LocalStorage } from '../utils/LocalStorage';

const FileUploadScreen = ({ navigation }) => {
    const [documentDate, setDocumentDate] = useState(new Date());
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [majorHead, setMajorHead] = useState('');
    const [minorHead, setMinorHead] = useState('');
    const [tags, setTags] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [currentTag, setCurrentTag] = useState('');
    const [remarks, setRemarks] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [documentTitle, setDocumentTitle] = useState('');


    const minorHeadOptions = {
        Personal: ['Hitesh', 'Rakesh', 'Abhishek', 'Tara', 'Heena'],
        Professional: ['Accounts', 'HR', 'IT', 'Finance', 'Marketing'],
    };

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const fetchedTags = [
                    { id: 1, name: 'Important' },
                    { id: 2, name: 'Confidential' },
                    { id: 3, name: 'Urgent' },
                    { id: 4, name: 'Archive' },
                    { id: 5, name: 'Project A' },
                ];
                setAvailableTags(fetchedTags);
            } catch (error) {
                console.error('Failed to fetch tags:', error);
                Alert.alert('Error', 'Failed to load tags');
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

    const pickDocument = async () => {
        console.log('Picking document...');

        try {
            const result = await DocumentPicker.pickDirectory({
                type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
            });

            console.log({ result });


            if (result && result.length > 0) {
                setSelectedFile({
                    uri: result[0].uri,
                    type: result[0].type,
                    name: result[0].name,
                    size: result[0].size,
                });
            }
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
            } else {
                Alert.alert('Error', 'Failed to pick document');
            }
        }
    };

    const takePhoto = async () => {
        const options = {
            mediaType: 'photo',
            quality: 0.8,
        };

        try {


            let granted = null;
            if (Platform.OS === 'android') {
                granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Document Management System Camera Permission',
                        message: 'Document Management System needs access to your camera ',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
            }

            if (
                Platform.OS === 'ios' ||
                granted === PermissionsAndroid.RESULTS.GRANTED
            ) {
                const result = await launchImageLibrary(options);
                console.log({ result });

                if (result && result.assets) {
                    const photo = result.assets[0];
                    setSelectedFile({
                        uri: photo.uri,
                        type: photo.type,
                        name: `photo_${Date.now()}.jpg`,
                        size: photo.fileSize,
                    });
                }
            }

        } catch (error) {
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const handleUpload = async () => {
        if (!documentTitle) {
            Alert.alert('Error', 'Please enter a document title');
            return;
        }
        if (!selectedFile) {
            Alert.alert('Error', 'Please select a document or take a photo');
            return;
        }

        if (!majorHead) {
            Alert.alert('Error', 'Please select a category');
            return;
        }

        if (!minorHead) {
            Alert.alert('Error', 'Please select a subcategory');
            return;
        }

        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const datatToSave = {
                id: Date.now(),
                title: documentTitle,
                date: documentDate.toISOString().split('T')[0],
                major_head: majorHead,
                minor_head: minorHead,
                tags: tags,
                remarks: remarks,
                file_name: selectedFile
            };

            const existingData = await LocalStorage.getData('documents_data');
            let updatedData = [];

            if (Array.isArray(existingData)) {
                updatedData = [...existingData, datatToSave];
            } else {
                updatedData = [datatToSave];
            }

            await LocalStorage.storeData('documents_data', updatedData);

            console.log(await LocalStorage.getData('documents_data'));

            setLoading(false);
            Alert.alert(
                'Success',
                'Document uploaded successfully',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.goBack();
                        },
                    },
                ]
            );
        } catch (error) {
            setLoading(false);
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload document');
        }
    };


    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upload Document</Text>
            </View>

            <View style={styles.formContainer}>

                <View style={{ paddingHorizontal: 28 }}>
                    <Text style={styles.label}>Document Title *</Text>
                    <TextInput
                        style={styles.inputField}
                        placeholder="Enter document title"
                        value={documentTitle}
                        onChangeText={(text) => setDocumentTitle(text)}
                        placeholderTextColor={'#757575'}
                    />
                </View>
                <View style={{ paddingHorizontal: 28 }}>
                    <Text style={styles.label}>Document Date</Text>
                    <TouchableOpacity
                        style={styles.inputField}
                        onPress={() => setDatePickerOpen(true)}
                    >
                        <Text style={styles.inputText}>
                            {documentDate.toLocaleDateString()}
                        </Text>
                        <Icon name="calendar-today" size={20} color="#757575" />
                    </TouchableOpacity>
                    <DatePicker
                        modal
                        open={datePickerOpen}
                        date={documentDate}
                        mode="date"
                        onConfirm={(date) => {
                            setDatePickerOpen(false);
                            setDocumentDate(date);
                        }}
                        onCancel={() => {
                            setDatePickerOpen(false);
                        }}
                    />
                </View>

                <View style={{ paddingHorizontal: 28 }}>
                    <Text style={[styles.label, {}]}>Category*</Text>
                    <View style={styles.segmentedControl}>
                        <TouchableOpacity
                            style={[
                                styles.segmentButton,
                                majorHead === 'Personal' && styles.segmentButtonActive,
                            ]}
                            onPress={() => handleMajorHeadChange('Personal')}
                        >
                            <Text
                                style={[
                                    styles.segmentButtonText,
                                    majorHead === 'Personal' && styles.segmentButtonTextActive,
                                ]}
                            >
                                Personal
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.segmentButton,
                                majorHead === 'Professional' && styles.segmentButtonActive,
                            ]}
                            onPress={() => handleMajorHeadChange('Professional')}
                        >
                            <Text
                                style={[
                                    styles.segmentButtonText,
                                    majorHead === 'Professional' && styles.segmentButtonTextActive,
                                ]}
                            >
                                Professional
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {majorHead && (
                    <View style={{}}>
                        <Text style={[styles.label, { paddingHorizontal: 28 }]}>Subcategory*</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={[styles.chipsContainer, {}]}
                        >
                            {minorHeadOptions[majorHead].map((option, index) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.chip,
                                        minorHead === option && styles.chipActive,
                                        { marginLeft: index === 0 ? 28 : 5 },
                                    ]}
                                    onPress={() => setMinorHead(option)}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            minorHead === option && styles.chipTextActive,
                                        ]}
                                    >
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={{ paddingHorizontal: 28 }}>
                    <Text style={styles.label}>Tags</Text>
                    <View style={styles.inputWithButton}>
                        <TextInput
                            style={[styles.inputText, styles.tagInput]}
                            placeholder="Add tags"
                            value={currentTag}
                            onChangeText={setCurrentTag}
                            onSubmitEditing={handleAddTag}
                            returnKeyType="done"
                            placeholderTextColor={'#999'}
                        />
                        <TouchableOpacity style={styles.addButton} onPress={handleAddTag}>
                            <Icon name="add" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
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
                <View style={[styles.selectedChipsContainer, { paddingHorizontal: 28 }]}>
                    {tags.map((tag, index) => (
                        <View key={index} style={[styles.selectedChip, {}]}>
                            <Text style={styles.selectedChipText}>{tag}</Text>
                            <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                                <Icon name="close" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                <View style={{ paddingHorizontal: 28 }}>
                    <Text style={styles.label}>Remarks</Text>
                    <TextInput
                        style={[styles.inputText, styles.multilineInput, { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 10 }]}
                        placeholder="Add any additional notes"
                        value={remarks}
                        onChangeText={setRemarks}
                        multiline
                        textAlignVertical="top"
                        placeholderTextColor={'#999'}
                    />
                </View>

                <View style={{ paddingHorizontal: 28 }}>
                    <Text style={styles.label}>Document</Text>
                    <View style={styles.fileActions}>
                        <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
                            <Icon name="camera-alt" size={20} color="#fff" />
                            <Text style={styles.actionButtonText}>Choose Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={pickDocument}>
                            <Icon name="attach-file" size={20} color="#fff" />
                            <Text style={styles.actionButtonText}>Choose File</Text>
                        </TouchableOpacity>
                    </View>

                    {selectedFile && (
                        <View style={styles.selectedFile}>
                            <Icon
                                name={selectedFile.type === 'application/pdf' ? 'picture-as-pdf' : 'image'}
                                size={24}
                                color="#007bff"
                            />
                            <Text style={styles.selectedFileName} numberOfLines={1}>
                                {selectedFile.name}
                            </Text>
                            <TouchableOpacity onPress={() => setSelectedFile(null)}>
                                <Icon name="close" size={20} color="#dc3545" />
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={handleUpload}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Icon name="cloud-upload" size={20} color="#fff" />
                                <Text style={styles.uploadButtonText}>Upload</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    formContainer: {
        paddingVertical: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#495057',
        marginBottom: 8,
        marginTop: 15,
    },
    inputField: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    inputText: {
        fontSize: 16,
        color: '#212529',
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: '#e9ecef',
        borderRadius: 5,
        marginBottom: 15,
        overflow: 'hidden',
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
    },
    segmentButtonActive: {
        backgroundColor: '#007bff',
    },
    segmentButtonText: {
        color: '#495057',
        fontSize: 16,
    },
    segmentButtonTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    chipsContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    chip: {
        backgroundColor: '#e9ecef',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        marginRight: 8,
    },
    chipActive: {
        backgroundColor: '#007bff',
    },
    chipText: {
        color: '#495057',
        fontSize: 15,
    },
    chipTextActive: {
        color: '#fff',
    },
    inputWithButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    addButton: {
        backgroundColor: '#28a745',
        borderRadius: 5,
        padding: 10,
        marginLeft: 10,
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
    multilineInput: {
        minHeight: 100,
        paddingVertical: 15,
    },
    fileActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6c757d', // Secondary grey
        borderRadius: 5,
        paddingVertical: 10,
        flex: 0.48,
    },
    actionButtonText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 16,
    },
    selectedFile: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e7f3ff',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        borderColor: '#b8daff',
        borderWidth: 1,
    },
    selectedFileName: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
        fontSize: 16,
        color: '#212529',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6a1b9a',
        borderRadius: 5,
        paddingVertical: 12,
        marginTop: 20,
    },
    uploadButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 18,
    },
    tagInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 5,
        paddingHorizontal: 15,
        width: '85%'
    }
});

export default FileUploadScreen;
