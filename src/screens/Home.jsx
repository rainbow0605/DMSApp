import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../contexts/AuthContext';

const HomeScreen = ({ navigation }) => {
    const { logout } = React.useContext(AuthContext);

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
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Document Hub</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Icon name="logout" size={24} color={Platform.OS === 'ios' ? '#fff' : '#fff'} />
                </TouchableOpacity>
            </View>

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
                <View style={styles.activityCard}>
                    <Text style={styles.activityTitle}>Welcome to your Document Hub!</Text>
                    <Text style={styles.activityDescription}>
                        Get started by uploading your documents or searching for existing ones. Your recent activities will appear here.
                    </Text>
                    <Text style={styles.activityTimestamp}>Today, 11:39 AM</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f6f8', // Light grey background
    },
    header: {
        backgroundColor: Platform.OS === 'ios' ? '#304FFE' : '#3F51B5',
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#263238',
        marginHorizontal: 20,
        marginTop: 25,
        marginBottom: 15,
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
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
        marginHorizontal: 20,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
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
});

export default HomeScreen;