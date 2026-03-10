import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Search, Hash } from 'lucide-react-native';

const SearchLicenseScreen = ({ navigation }: any) => {
    const [licenseId, setLicenseId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!licenseId.trim()) {
            Alert.alert("Error", "Please enter a valid License ID");
            return;
        }

        setIsLoading(true);
        // Add a tiny delay for UX so it doesn't instantly snap
        setTimeout(() => {
            setIsLoading(false);
            navigation.navigate('LicenseDetail', { licenseId: licenseId.trim() });
        }, 500);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.iconCircle}>
                        <Search size={48} color="#3B82F6" />
                    </View>
                    <Text style={styles.title}>Search License</Text>
                    <Text style={styles.subtitle}>Manually verify a license by ID</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>License ID</Text>
                    <View style={styles.inputGroup}>
                        <Hash color="#6B7280" size={20} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. GST-12345"
                            placeholderTextColor="#9CA3AF"
                            value={licenseId}
                            onChangeText={setLicenseId}
                            autoCapitalize="characters"
                            returnKeyType="search"
                            onSubmitEditing={handleSearch}
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.submitButton} 
                        onPress={handleSearch}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitText}>Search Blockchain</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.helpBox}>
                    <Text style={styles.helpTitle}>How it works?</Text>
                    <Text style={styles.helpText}>
                        This search queries the blockchain securely to verify that the license exists, is authentic, and has not been revoked or suspended.
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        marginBottom: 20,
        paddingHorizontal: 12,
        height: 54,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#1F2937',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 8,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    helpBox: {
        backgroundColor: '#EFF6FF',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    helpTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1E3A8A',
        marginBottom: 8,
    },
    helpText: {
        fontSize: 14,
        color: '#1E40AF',
        lineHeight: 20,
    }
});

export default SearchLicenseScreen;
