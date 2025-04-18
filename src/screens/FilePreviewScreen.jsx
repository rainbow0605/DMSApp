import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { AppContext } from '../contexts/AppContext';

const FilePreviewScreen = ({ route }) => {
    const { document } = route.params;
    const { setDownloadedFiles } = useContext(AppContext);
    const [downloading, setDownloading] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);

    const file = {
        id: document.id,
        name: document.title,
        url: document.file_url,
        type: document.file_type,
        date: document.date,
        major_head: document.major_head,
        minor_head: document.minor_head,
        tags: document.tags,
    };

    const isPreviewable = (fileType) => {
        return fileType.includes('image');
    };

    const downloadFile = async () => {
        try {
            setDownloading(true);
            const destPath = `${RNFS.DocumentDirectoryPath}/${file.name}.pdf`;

            await RNFS.downloadFile({
                fromUrl: file.url,
                toFile: destPath,
            }).promise;

            setDownloadedFiles(prev => [...prev, {
                ...file,
                localPath: destPath,
            }]);

            Alert.alert('Success', 'File downloaded successfully');
            setDownloading(false);

            if (file.type.includes('pdf')) {
                try {
                    await FileViewer.open(destPath, {
                        showOpenWithDialog: true,
                        showAppsSuggestions: true,
                    });
                } catch (err) {
                    console.error('Error opening file:', err);
                    Alert.alert('Error', 'Cannot open the file');
                }
            }
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'Failed to download file');
            setDownloading(false);
        }
    };

    const renderPreviewContent = () => {
        if (file.type.includes('image')) {
            return (
                <Image
                    source={{ uri: file.url }}
                    style={styles.previewImage}
                    resizeMode="contain"
                />
            );
        } else {
            return (
                <View style={styles.unsupportedPreview}>
                    <Icon name="file-question" size={50} color="#888" />
                    <Text style={styles.unsupportedText}>Preview not available for this file type</Text>
                </View>
            );
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{file.name}</Text>
            </View>

            <View style={styles.metadataContainer}>
                <Text style={styles.metaText}>Date: {file.date}</Text>
                <Text style={styles.metaText}>Category: {file.major_head}</Text>
                <Text style={styles.metaText}>Subcategory: {file.minor_head}</Text>
                <Text style={styles.metaText}>Tags: {file.tags.join(', ')}</Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.previewButton}
                    onPress={() => {
                        if (isPreviewable(file.type)) {
                            setPreviewVisible(true);
                        } else {
                            Alert.alert(
                                'PDF Preview',
                                'PDF files are opened with external viewers. Would you like to download and open this file?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Download & Open', onPress: downloadFile },
                                ]
                            );
                        }
                    }}
                >
                    <Icon name="eye" size={22} color="#4A90E2" />
                    <Text style={styles.previewText}>Preview</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={downloadFile}
                    disabled={downloading}
                >
                    {downloading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Icon name="download" size={22} color="#fff" />
                            <Text style={styles.downloadText}>Download</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <Modal
                isVisible={previewVisible}
                onBackdropPress={() => setPreviewVisible(false)}
                onBackButtonPress={() => setPreviewVisible(false)}
                style={styles.modal}
            >
                <View style={styles.previewContainer}>
                    <View style={styles.previewHeader}>
                        <Text style={styles.previewTitle} numberOfLines={1}>{file.name}</Text>
                        <TouchableOpacity onPress={() => setPreviewVisible(false)}>
                            <Icon name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.previewContent}>
                        {renderPreviewContent()}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    metadataContainer: {
        padding: 16,
        backgroundColor: '#fff',
        marginTop: 8,
    },
    metaText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 24,
        paddingHorizontal: 16,
    },
    previewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 6,
        borderColor: '#4A90E2',
        borderWidth: 1,
    },
    previewText: {
        color: '#4A90E2',
        fontWeight: '600',
        marginLeft: 6,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4A90E2',
        padding: 10,
        borderRadius: 6,
    },
    downloadText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 6,
    },
    modal: {
        margin: 0,
        justifyContent: 'flex-end',
    },
    previewContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        height: '80%',
        paddingTop: 15,
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    previewTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    previewContent: {
        flex: 1,
        padding: 10,
    },
    previewImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    unsupportedPreview: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unsupportedText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 15,
    },
});

export default FilePreviewScreen;
