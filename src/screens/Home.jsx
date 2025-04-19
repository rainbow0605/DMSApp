import React, { useContext, useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
    StatusBar,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../contexts/AuthContext';
import { LocalStorage } from '../utils/LocalStorage';
import { useIsFocused } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
    const isFocused = useIsFocused();
    const { logout } = useContext(AuthContext);
    const [userName, setUserName] = useState('');
    const [documents, setDocuments] = useState();


    useEffect(() => {
        const fetchUser = async () => {
            const name = await LocalStorage.getData('user_name');
            if (name) setUserName(name);
        };
        fetchUser();
        getDocuments();
    }, [isFocused]);

    const getDocuments = async () => {
        try {
            const d_data = await LocalStorage.getData('documents_data');
            setDocuments(d_data[d_data?.length - 1]);
        } catch (error) {
            console.log(error);
        }
    }

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    onPress: async () => {
                        LocalStorage.clearAllData();
                        await logout();
                        navigation.replace('AuthStack', { screen: 'Login' });
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const features = [
        {
            name: 'Upload Document',
            icon: 'cloud-upload',
            screen: 'FileUpload',
            color: '#6200EE',
        },
        {
            name: 'Search Documents',
            icon: 'search',
            screen: 'FileSearch',
            color: '#03DAC6',
        },
    ];

    return (
        <ScrollView style={styles.container}>
            <StatusBar backgroundColor={'#6a1b9a'} barStyle={'light-content'} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>DMS App</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Icon name="logout" size={24} color={Platform.OS === 'ios' ? '#fff' : '#fff'} />
                </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: 28 }}>
                <Text style={styles.welcomeText}>👋 Welcome back, {userName || 'User'}!</Text>

                <Text style={styles.tipText}>💡 Tip of the day: You can search by file name or tag!</Text>

                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.featuresContainer}>
                    {features.map((feature, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.featureCard, { backgroundColor: feature.color }]}
                            onPress={() => navigation.navigate(feature.screen)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.featureIconContainer}>
                                <Icon name={feature.icon} size={36} color="#fff" />
                            </View>
                            <Text style={styles.featureText}>{feature.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>


                <View style={styles.recentContainer}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    {
                        documents ?
                            <View style={styles.activityCard}>
                                <Text style={styles.activityTitle}>Uploaded: {documents?.title}</Text>
                                <Text style={styles.activityDescription}>You uploaded this file to HR folder.</Text>
                                <Text style={styles.activityTimestamp}>2 hours ago</Text>
                            </View>
                            :
                            <View style={{}}>
                                <Text style={{ textAlign: 'left', color: '#3F51B5' }}>No recent activity</Text>
                                <Text style={{ textAlign: 'left', marginTop: 10, color: '#3F51B5' }}>You can upload documents to see them here</Text>
                            </View>
                    }
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
        paddingTop: Platform.OS === 'ios' ? 50 : 10,
        paddingBottom: 15,
        paddingHorizontal: 28,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    logo: {
        width: 100,
        height: 40,
        resizeMode: 'contain',
        marginBottom: 10,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    logoutButton: {
        padding: 8,
        borderRadius: 5,
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 10,
        color: '#37474F',
    },
    tipText: {
        backgroundColor: '#FFF3CD',
        padding: 12,
        borderRadius: 8,
        color: '#856404',
        fontSize: 14,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#263238',
        marginTop: 25,
        marginBottom: 15,
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        paddingBottom: 15,
    },
    featureCard: {
        width: '46%',
        height: 130,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    featureIconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 24,
        padding: 12,
        marginBottom: 10,
    },
    featureText: {
        color: '#fff',
        marginTop: 8,
        fontWeight: '500',
        textAlign: 'center',
        fontSize: 16,
    },
    recentContainer: {
        marginBottom: 20,
    },
    activityCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 18,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    activityTitle: {
        fontWeight: 'bold',
        fontSize: 17,
        marginBottom: 8,
        color: '#263238',
    },
    activityDescription: {
        color: '#78909c',
        fontSize: 15,
        marginBottom: 12,
    },
    activityTimestamp: {
        color: '#90A4AE',
        fontSize: 12,
    },
    myFilesButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E88E5',
        padding: 12,
        borderRadius: 8,
        marginTop: 20,
        alignSelf: 'flex-start',
    },
    myFilesButtonText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '500',
    },
});

export default HomeScreen;
