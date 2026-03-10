import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { licenseApi } from '../services/api';
import { Hash, Building2, UserCircle, Calendar, HashIcon, FileSignature } from 'lucide-react-native';

const RegisterLicenseScreen = ({ navigation }: any) => {
    const [isLoading, setIsLoading] = useState(false);
    
    // Form fields
    const [licenseId, setLicenseId] = useState('');
    const [licenseType, setLicenseType] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [holderAddress, setHolderAddress] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [documentHash, setDocumentHash] = useState('');

    const handleSubmit = async () => {
        if (!licenseId || !licenseType || !businessName || !holderAddress || !expiryDate || !documentHash) {
            Alert.alert("Error", "All fields are required");
            return;
        }

        setIsLoading(true);
        try {
            const expDate = new Date(expiryDate);
            if (isNaN(expDate.getTime())) {
                Alert.alert("Invalid Date", "Please enter a valid format, e.g. 2026-12-31");
                setIsLoading(false);
                return;
            }

            const data = {
                licenseId,
                licenseType,
                businessName,
                holderAddress,
                expiryDate: expDate.toISOString(),
                documentHash
            };

            await licenseApi.register(data);
            Alert.alert("Success", "License registered to the blockchain securely.");
            navigation.goBack();
        } catch (e: any) {
            Alert.alert("Registration Error", e.response?.data?.error || e.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <FileSignature size={48} color="#10B981" style={styles.icon} />
                    <Text style={styles.title}>Register License</Text>
                    <Text style={styles.subtitle}>On-Chain Permit Registration</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Hash color="#6B7280" size={20} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="License ID (e.g. GST-12345)"
                            placeholderTextColor="#9CA3AF"
                            value={licenseId}
                            onChangeText={setLicenseId}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <FileSignature color="#6B7280" size={20} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="License Type (e.g. GST, Trade)"
                            placeholderTextColor="#9CA3AF"
                            value={licenseType}
                            onChangeText={setLicenseType}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Building2 color="#6B7280" size={20} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Business Name"
                            placeholderTextColor="#9CA3AF"
                            value={businessName}
                            onChangeText={setBusinessName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <UserCircle color="#6B7280" size={20} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Holder Wallet Address (0x...)"
                            placeholderTextColor="#9CA3AF"
                            value={holderAddress}
                            onChangeText={setHolderAddress}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Calendar color="#6B7280" size={20} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Expiry Date (YYYY-MM-DD)"
                            placeholderTextColor="#9CA3AF"
                            value={expiryDate}
                            onChangeText={setExpiryDate}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <HashIcon color="#6B7280" size={20} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Document Hash (IPFS CID / SHA256)"
                            placeholderTextColor="#9CA3AF"
                            value={documentHash}
                            onChangeText={setDocumentHash}
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.submitButton} 
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitText}>Mint License to Blockchain</Text>
                        )}
                    </TouchableOpacity>
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
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 20,
    },
    icon: {
        marginBottom: 12,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
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
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 12,
        height: 50,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#1F2937',
        fontSize: 15,
    },
    submitButton: {
        backgroundColor: '#10B981',
        borderRadius: 8,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default RegisterLicenseScreen;
