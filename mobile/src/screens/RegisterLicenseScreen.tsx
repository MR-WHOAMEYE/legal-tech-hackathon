import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Platform, KeyboardAvoidingView, Modal, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { licenseApi } from '../services/api';
import { Hash, Building2, UserCircle, Calendar, HashIcon, FileSignature, ChevronLeft } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const LICENSE_TYPES = [
    { id: '1', label: 'GST Registration', value: 'GST' },
    { id: '2', label: 'Trade License', value: 'Trade License' },
    { id: '3', label: 'FSSAI Permit', value: 'FSSAI' },
    { id: '4', label: 'Incorporation Certificate', value: 'Incorporation' },
];

const RegisterLicenseScreen = ({ navigation }: any) => {
    const [isLoading, setIsLoading] = useState(false);
    const [licenseId, setLicenseId] = useState('');
    const [licenseType, setLicenseType] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [holderAddress, setHolderAddress] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [documentHash, setDocumentHash] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);

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

            let formattedAddress = holderAddress.trim();
            if (!formattedAddress.startsWith('0x')) {
                formattedAddress = '0x' + formattedAddress;
            }
            if (formattedAddress.length !== 42) {
                Alert.alert("Invalid Address", "Holder Wallet Address must be a 42-character valid hex address.");
                setIsLoading(false);
                return;
            }

            await licenseApi.register({
                licenseId, licenseType, businessName, holderAddress: formattedAddress,
                expiryDate: expDate.toISOString(), documentHash
            });
            Alert.alert("Success", "License registered to the blockchain securely.");
            navigation.goBack();
        } catch (e: any) {
            Alert.alert("Registration Error", e.response?.data?.error || e.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    const fields = [
        { key: 'licenseId', icon: <Hash color="#0c4651" size={18} />, placeholder: 'License ID (e.g. GST-12345)', value: licenseId, setter: setLicenseId },
        { key: 'type', icon: <FileSignature color="#0c4651" size={18} />, placeholder: 'License Type (Tap to select)', value: licenseType, setter: setLicenseType, isTypeDropdown: true },
        { key: 'business', icon: <Building2 color="#0c4651" size={18} />, placeholder: 'Business Name', value: businessName, setter: setBusinessName },
        { key: 'address', icon: <UserCircle color="#0c4651" size={18} />, placeholder: 'Holder Wallet Address (0x...)', value: holderAddress, setter: setHolderAddress },
        { key: 'date', icon: <Calendar color="#0c4651" size={18} />, placeholder: 'Expiry Date (Tap to select)', value: expiryDate, setter: setExpiryDate, isDate: true },
        { key: 'hash', icon: <HashIcon color="#0c4651" size={18} />, placeholder: 'Document Hash (IPFS CID / SHA256)', value: documentHash, setter: setDocumentHash },
    ];

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#001621', '#011e2d', '#001621']} style={StyleSheet.absoluteFill} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ChevronLeft size={24} color="#94A3B8" />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <LinearGradient colors={['#cc3200', '#ff4103']} style={styles.iconCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <FileSignature size={32} color="#FFFFFF" />
                        </LinearGradient>
                        <Text style={styles.title}>Register License</Text>
                        <Text style={styles.subtitle}>On-Chain Permit Registration</Text>
                    </View>

                    <View style={styles.formCard}>
                        <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']} style={styles.formGradient}>
                            {fields.map((f, i) => (
                                <View key={f.key} style={styles.inputGroup}>
                                    <View style={styles.inputIconBox}>{f.icon}</View>
                                    
                                    {f.isDate ? (
                                        <TouchableOpacity 
                                            style={{ flex: 1, justifyContent: 'center' }} 
                                            onPress={() => setShowDatePicker(true)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.input, { textAlignVertical: 'center', paddingTop: 14, color: f.value ? '#E2E8F0' : '#475569' }]}>
                                                {f.value || f.placeholder}
                                            </Text>
                                        </TouchableOpacity>
                                    ) : f.isTypeDropdown ? (
                                        <TouchableOpacity 
                                            style={{ flex: 1, justifyContent: 'center' }} 
                                            onPress={() => setShowTypeDropdown(true)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.input, { textAlignVertical: 'center', paddingTop: 14, color: f.value ? '#E2E8F0' : '#475569' }]}>
                                                {f.value || f.placeholder}
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TextInput
                                            style={styles.input}
                                            placeholder={f.placeholder}
                                            placeholderTextColor="#475569"
                                            value={f.value}
                                            onChangeText={f.setter}
                                        />
                                    )}
                                </View>
                            ))}

                            {/* Date Picker Modal */}
                            {showDatePicker && (
                                <DateTimePicker
                                    value={expiryDate ? new Date(expiryDate) : new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(false);
                                        if (selectedDate) {
                                            setExpiryDate(selectedDate.toISOString().split('T')[0]);
                                        }
                                    }}
                                />
                            )}

                            {/* License Type Dropdown Modal */}
                            <Modal
                                visible={showTypeDropdown}
                                transparent={true}
                                animationType="fade"
                                onRequestClose={() => setShowTypeDropdown(false)}
                            >
                                <TouchableOpacity 
                                    style={styles.modalOverlay} 
                                    activeOpacity={1} 
                                    onPress={() => setShowTypeDropdown(false)}
                                >
                                    <View style={styles.dropdownContainer}>
                                        <Text style={styles.dropdownTitle}>Select License Type</Text>
                                        <FlatList
                                            data={LICENSE_TYPES}
                                            keyExtractor={(item) => item.id}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity 
                                                    style={styles.dropdownItem}
                                                    onPress={() => {
                                                        setLicenseType(item.value);
                                                        setShowTypeDropdown(false);
                                                    }}
                                                >
                                                    <Text style={styles.dropdownItemText}>{item.label}</Text>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </View>
                                </TouchableOpacity>
                            </Modal>

                            <TouchableOpacity onPress={handleSubmit} disabled={isLoading} activeOpacity={0.8}>
                                <LinearGradient colors={['#cc3200', '#ff4103']} style={styles.submitButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.submitText}>Mint License to Blockchain</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, padding: 24, paddingTop: 60 },
    backButton: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    header: { alignItems: 'center', marginBottom: 24 },
    iconCircle: {
        width: 64, height: 64, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    },
    title: { fontSize: 26, fontWeight: '800', color: '#F1F5F9', letterSpacing: -0.3 },
    subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
    formCard: {
        borderRadius: 22, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    formGradient: { padding: 24 },
    inputGroup: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderWidth: 1, borderColor: 'rgba(12,70,81,0.12)',
        borderRadius: 12, marginBottom: 12, paddingHorizontal: 12, height: 52,
    },
    inputIconBox: { marginRight: 10 },
    input: { flex: 1, height: '100%', color: '#E2E8F0', fontSize: 14 },
    submitButton: {
        borderRadius: 14, height: 54, justifyContent: 'center', alignItems: 'center', marginTop: 8,
    },
    submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
    
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 24,
    },
    dropdownContainer: {
        backgroundColor: '#011e2d',
        borderRadius: 16,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
    },
    dropdownTitle: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '700',
        paddingHorizontal: 20,
        paddingBottom: 12,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    dropdownItem: {
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    dropdownItemText: {
        color: '#F1F5F9',
        fontSize: 16,
        fontWeight: '500',
    }
});

export default RegisterLicenseScreen;
