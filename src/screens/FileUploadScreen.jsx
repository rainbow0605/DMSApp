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
    ToastAndroid,
    Modal,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DocumentPicker, { pick } from '@react-native-documents/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { LocalStorage } from '../utils/LocalStorage';
import { documentService } from '../services/documentService';
import CustomDropdown from '../components/CustomDropdown';
import Header from '../components/Header';
import moment from 'moment';

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
    const [imagePickerModalVisible, setImagePickerModalVisible] = useState(false);
    const [file, setFile] = useState(null);

    const majorHeadOptions = ['Personal', 'Professional'];
    const minorHeadOptions = {
        Personal: ['John', 'Emily', 'Tom', 'Roy', 'Heena'],
        Professional: ['Accounts', 'HR', 'IT', 'Finance', 'Marketing'],
    };

    useEffect(() => {
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
                ToastAndroid.show('Error fetching tags', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error('Failed to fetch tags:', error);
            Alert.alert('Error', 'Failed to load tags');
        }
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

    const pickDocument = async () => {
        try {
            const result = await pick({
                type: ['application/pdf'],
            })

            if (result && result.length > 0) {
                const file = result[0];
                if (file.type === 'application/pdf') {
                    setSelectedFile({
                        uri: file.uri,
                        type: file.type,
                        name: file.name,
                        size: file.size,
                    });
                    setFile(result)
                } else {
                    Alert.alert('Error', 'Only PDF and image files are allowed');
                }
            }
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
            } else {
                Alert.alert('Error', 'Failed to pick document');
            }
        }
    };

    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'App needs camera permission to take pictures',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const openCamera = async () => {
        const hasPermission = await requestCameraPermission();

        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Camera permission is required to take photos');
            return;
        }

        const options = {
            mediaType: 'photo',
            quality: 0.8,
            saveToPhotos: false,
        };

        try {
            const result = await launchCamera(options);

            if (result.didCancel) {
                return;
            }

            if (result.errorCode) {
                Alert.alert('Error', result.errorMessage || 'Error taking photo');
                return;
            }

            if (result.assets && result.assets.length > 0) {
                const photo = result.assets[0];
                setSelectedFile({
                    uri: photo.uri,
                    type: photo.type || 'image/jpeg',
                    name: photo.fileName || `photo_${Date.now()}.jpg`,
                    size: photo.fileSize,
                });
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Failed to take photo');
        } finally {
            setImagePickerModalVisible(false);
        }
    };

    const openGallery = async () => {
        const options = {
            mediaType: 'mixed',
            quality: 0.8,
            selectionLimit: 1,
        };

        try {
            const result = await launchImageLibrary(options);

            if (result.didCancel) {
                return;
            }

            if (result.errorCode) {
                Alert.alert('Error', result.errorMessage || 'Error selecting media');
                return;
            }

            if (result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                if (file.type && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
                    setSelectedFile({
                        uri: file.uri,
                        type: file.type,
                        name: file.fileName || `file_${Date.now()}${file.type.includes('pdf') ? '.pdf' : '.jpg'}`,
                        size: file.fileSize,
                    });
                } else {
                    Alert.alert('Error', 'Only images and PDF files are allowed');
                }
            }
        } catch (error) {
            console.error('Gallery error:', error);
            Alert.alert('Error', 'Failed to select media');
        } finally {
            setImagePickerModalVisible(false);
        }
    };

    const handleUpload = async () => {
        if (!majorHead) {
            Alert.alert('Error', 'Please select a category');
            return;
        }

        if (!minorHead) {
            Alert.alert('Error', 'Please select a subcategory');
            return;
        }
        if (!tags.length) {
            Alert.alert('Error', 'Please select atleast one tag');
            return;
        }
        if (!selectedFile) {
            Alert.alert('Error', 'Please select a document or take a photo');
            return;
        }

        setLoading(true);
        const userData = await LocalStorage.getData('user_data');
        try {
            const tagObjects = tags.map(tag => ({ tag_name: tag }));
            const formattedDate = moment(documentDate).format('DD-MM-YYYY');
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('data', JSON.stringify({
                major_head: majorHead,
                minor_head: minorHead,
                document_date: formattedDate,
                document_remarks: remarks,
                tags: tagObjects,
                user_id: userData?.user_id
            }));

            const result = await documentService.uploadDocument(formData);
            const { status, data } = result;
            if (status) {

                const datatToSave = {
                    id: Date.now(),
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

                setLoading(false);
                Alert.alert(
                    'Success',
                    'Document saved successfully',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                navigation.goBack();
                            },
                        },
                    ]
                );
            } else {
                setLoading(false);
                Alert.alert('Error', 'Failed to upload document');
            }
            // await new Promise(resolve => setTimeout(resolve, 1500));

        } catch (error) {
            setLoading(false);
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload document');
        }
    };

    const ImagePickerModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={imagePickerModalVisible}
            onRequestClose={() => {
                setImagePickerModalVisible(false);
            }}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Choose an option</Text>

                    <TouchableOpacity style={styles.modalOption} onPress={openCamera}>
                        <Icon name="camera-alt" size={24} color="#6a1b9a" />
                        <Text style={styles.modalOptionText}>Take Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.modalOption} onPress={openGallery}>
                        <Icon name="photo-library" size={24} color="#6a1b9a" />
                        <Text style={styles.modalOptionText}>Choose from Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.modalCancelButton}
                        onPress={() => setImagePickerModalVisible(false)}
                    >
                        <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <Header title="Upload Document" navigation={navigation} />
            <ImagePickerModal />

            <ScrollView>
                <View style={styles.formContainer}>
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
                        <Text style={styles.label}>Category *</Text>
                        <CustomDropdown
                            data={majorHeadOptions}
                            value={majorHead}
                            onSelect={handleMajorHeadChange}
                            placeholder="Select Category"
                        />
                    </View>

                    <View style={{ paddingHorizontal: 28 }}>
                        <Text style={styles.label}>Subcategory *</Text>
                        <CustomDropdown
                            data={majorHead ? minorHeadOptions[majorHead] : []}
                            value={minorHead}
                            onSelect={setMinorHead}
                            placeholder="Select Subcategory"
                            disabled={!majorHead}
                        />
                    </View>

                    <View style={{ paddingHorizontal: 28 }}>
                        <Text style={styles.label}>Tags*</Text>
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
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => setImagePickerModalVisible(true)}
                            >
                                <Icon name="image" size={20} color="#fff" />
                                <Text style={styles.actionButtonText}>Choose Image</Text>
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
        </View>
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
        backgroundColor: '#6c757d',
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
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#212529',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    modalOptionText: {
        fontSize: 16,
        marginLeft: 15,
        color: '#212529',
    },
    modalCancelButton: {
        marginTop: 20,
        paddingVertical: 15,
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 5,
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6a1b9a',
    },
});

export default FileUploadScreen;