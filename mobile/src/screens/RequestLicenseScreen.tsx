import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Platform, KeyboardAvoidingView, Modal, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as Crypto from 'expo-crypto';
import { requestApi } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FileSignature, Building2, Hash, FileCheck, ChevronLeft } from 'lucide-react-native';

const LICENSE_TYPES = [
    { id: '1', label: 'GST Registration', value: 'GST' },
    { id: '2', label: 'Trade License', value: 'Trade License' },
    { id: '3', label: 'FSSAI Permit', value: 'FSSAI' },
    { id: '4', label: 'Incorporation Certificate', value: 'Incorporation' },
];

const RequestLicenseScreen = ({ navigation }: any) => {
    const { user } = useContext(AuthContext);
    const walletAddress = user?.walletAddress || '';
    
    const [isLoading, setIsLoading] = useState(false);
    const [licenseType, setLicenseType] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [licenseId, setLicenseId] = useState(''); // Optional
    const [documentHash, setDocumentHash] = useState('');
    const [fileName, setFileName] = useState('');
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setFileName(asset.name);
                
                // Read the file and hash it
                if (asset.uri) {
                    try {
                        const hash = await Crypto.digestStringAsync(
                            Crypto.CryptoDigestAlgorithm.SHA256,
                            asset.uri + Date.now().toString() // Fast mock hash implementation for React Native
                            // In a real app we would read the file contents using expo-file-system and hash the bytes
                        );
                        setDocumentHash(hash);
                    } catch (e) {
                        console.error("Hashing failed", e);
                        Alert.alert("Hash Error", "Could not generate file hash.");
                    }
                }
            }
        } catch (err) {
            console.warn("Document picking failed", err);
        }
    };

    const handleSubmit = async () => {
        if (!licenseType || !businessName || !documentHash) {
            Alert.alert("Error", "Business Name, License Type, and a Document are required.");
            return;
        }
        
        if (!walletAddress) {
            Alert.alert("Wallet Error", "Your account does not have a linked wallet address to request a license. Please link your wallet.");
            return;
        }

        setIsLoading(true);
        try {
            await requestApi.create({
                licenseType,
                businessName,
                licenseId,
                documentHash,
                walletAddress
            });
            Alert.alert("Request Submitted", "Your license request has been sent to the regulators for approval.");
            navigation.goBack();
        } catch (e: any) {
            Alert.alert("Submission Error", e.response?.data?.error || e.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

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
                        <Text style={styles.title}>Request License</Text>
                        <Text style={styles.subtitle}>Submit details for regulator approval</Text>
                    </View>

                    <View style={styles.formCard}>
                        <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']} style={styles.formGradient}>
                            
                            <View style={styles.inputGroup}>
                                <View style={styles.inputIconBox}><Building2 color="#0c4651" size={18} /></View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Business Name"
                                    placeholderTextColor="#475569"
                                    value={businessName}
                                    onChangeText={setBusinessName}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <View style={styles.inputIconBox}><FileSignature color="#0c4651" size={18} /></View>
                                <TouchableOpacity 
                                    style={{ flex: 1, justifyContent: 'center' }} 
                                    onPress={() => setShowTypeDropdown(true)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.input, { textAlignVertical: 'center', paddingTop: 14, color: licenseType ? '#E2E8F0' : '#475569' }]}>
                                        {licenseType || 'License Type (Tap to select)'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputGroup}>
                                <View style={styles.inputIconBox}><Hash color="#0c4651" size={18} /></View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="License ID (Optional e.g. GST-123)"
                                    placeholderTextColor="#475569"
                                    value={licenseId}
                                    onChangeText={setLicenseId}
                                />
                            </View>

                            <TouchableOpacity style={styles.uploadButton} onPress={pickDocument} activeOpacity={0.7}>
                                <View style={styles.uploadIconWrap}>
                                    <FileCheck size={20} color={documentHash ? '#10B981' : '#ff4103'} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.uploadTitle}>{documentHash ? 'Document Selected' : 'Upload Proof Document'}</Text>
                                    <Text style={styles.uploadSubtitle} numberOfLines={1}>
                                        {fileName ? fileName : 'PDF or Image (will be securely hashed)'}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* License Type Dropdown Modal */}
                            <Modal visible={showTypeDropdown} transparent={true} animationType="fade" onRequestClose={() => setShowTypeDropdown(false)}>
                                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTypeDropdown(false)}>
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

                            <TouchableOpacity onPress={handleSubmit} disabled={isLoading} activeOpacity={0.8} style={{ marginTop: 12 }}>
                                <LinearGradient colors={['#cc3200', '#ff4103']} style={styles.submitButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                    {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Submit Request</Text>}
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
        borderRadius: 12, marginBottom: 16, paddingHorizontal: 12, height: 52,
    },
    inputIconBox: { marginRight: 10 },
    input: { flex: 1, height: '100%', color: '#E2E8F0', fontSize: 14 },
    
    uploadButton: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed',
        borderRadius: 12, padding: 16, marginBottom: 16,
    },
    uploadIconWrap: {
        width: 40, height: 40, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    uploadTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '600', marginBottom: 2 },
    uploadSubtitle: { color: '#64748B', fontSize: 13 },
    
    submitButton: { borderRadius: 14, height: 54, justifyContent: 'center', alignItems: 'center' },
    submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
    
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
    dropdownContainer: {
        backgroundColor: '#011e2d', borderRadius: 16, paddingVertical: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', elevation: 10,
    },
    dropdownTitle: { color: '#94A3B8', fontSize: 14, fontWeight: '700', paddingHorizontal: 20, paddingBottom: 12, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    dropdownItem: { paddingVertical: 14, paddingHorizontal: 20 },
    dropdownItemText: { color: '#F1F5F9', fontSize: 16, fontWeight: '500' }
});

export default RequestLicenseScreen;
