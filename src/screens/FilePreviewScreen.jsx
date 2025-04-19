import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { AppContext } from '../contexts/AppContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const FilePreviewScreen = ({ route, navigation }) => {
    const { document } = route.params;
    const { setDownloadedFiles } = useContext(AppContext);
    const [downloading, setDownloading] = useState(false);

    const file = {
        id: document.id,
        name: document?.title,
        url: document.file_name?.uri,
        type: document?.file_name?.type,
        date: document.date,
        major_head: document.major_head,
        minor_head: document.minor_head,
        tags: document.tags,
    };

    const isPreviewable = (fileType) => fileType?.includes('image');

    const downloadFile = async () => {
        if (!file.url.startsWith('http')) {
            Alert.alert('Invalid URL', 'Cannot download a local file.');
            return;
        }

        try {
            setDownloading(true);
            const fileExtension = file.type.includes('pdf') ? '.pdf' : '.jpg';
            const destPath = `${RNFS.DocumentDirectoryPath}/${file.name}${fileExtension}`;

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


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>File Preview</Text>
            </View>
            {isPreviewable(file.type) ? (
                <Image
                    source={{ uri: file.url }}
                    style={styles.previewImage}
                    resizeMode="contain"
                />
            ) : (
                <View style={styles.unsupportedPreview}>
                    <Icon name="file-question" size={50} color="#888" />
                    <Text style={styles.unsupportedText}>Preview not available for this file type</Text>
                </View>
            )}

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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    previewImage: {
        flex: 1,
        width: '100%',
        height: '100%',
        marginTop: 20,
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
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6a1b9a',
        padding: 14,
        margin: 16,
        borderRadius: 8,
    },
    downloadText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 16,
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
});

export default FilePreviewScreen;
