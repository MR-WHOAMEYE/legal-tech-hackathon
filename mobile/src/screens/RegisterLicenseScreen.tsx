import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { licenseApi } from '../services/api';
import { Hash, Building2, UserCircle, Calendar, HashIcon, FileSignature, ChevronLeft } from 'lucide-react-native';

const RegisterLicenseScreen = ({ navigation }: any) => {
    const [isLoading, setIsLoading] = useState(false);
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
            await licenseApi.register({
                licenseId, licenseType, businessName, holderAddress,
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
        { icon: <Hash color="#8B5CF6" size={18} />, placeholder: 'License ID (e.g. GST-12345)', value: licenseId, setter: setLicenseId },
        { icon: <FileSignature color="#8B5CF6" size={18} />, placeholder: 'License Type (GST, Trade, FSSAI)', value: licenseType, setter: setLicenseType },
        { icon: <Building2 color="#8B5CF6" size={18} />, placeholder: 'Business Name', value: businessName, setter: setBusinessName },
        { icon: <UserCircle color="#8B5CF6" size={18} />, placeholder: 'Holder Wallet Address (0x...)', value: holderAddress, setter: setHolderAddress },
        { icon: <Calendar color="#8B5CF6" size={18} />, placeholder: 'Expiry Date (YYYY-MM-DD)', value: expiryDate, setter: setExpiryDate },
        { icon: <HashIcon color="#8B5CF6" size={18} />, placeholder: 'Document Hash (IPFS CID / SHA256)', value: documentHash, setter: setDocumentHash },
    ];

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F172A', '#1E293B', '#0F172A']} style={StyleSheet.absoluteFill} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ChevronLeft size={24} color="#94A3B8" />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <LinearGradient colors={['#059669', '#10B981']} style={styles.iconCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <FileSignature size={32} color="#FFFFFF" />
                        </LinearGradient>
                        <Text style={styles.title}>Register License</Text>
                        <Text style={styles.subtitle}>On-Chain Permit Registration</Text>
                    </View>

                    <View style={styles.formCard}>
                        <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']} style={styles.formGradient}>
                            {fields.map((f, i) => (
                                <View key={i} style={styles.inputGroup}>
                                    <View style={styles.inputIconBox}>{f.icon}</View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={f.placeholder}
                                        placeholderTextColor="#475569"
                                        value={f.value}
                                        onChangeText={f.setter}
                                    />
                                </View>
                            ))}

                            <TouchableOpacity onPress={handleSubmit} disabled={isLoading} activeOpacity={0.8}>
                                <LinearGradient colors={['#059669', '#10B981']} style={styles.submitButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
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
        borderWidth: 1, borderColor: 'rgba(139,92,246,0.12)',
        borderRadius: 12, marginBottom: 12, paddingHorizontal: 12, height: 52,
    },
    inputIconBox: { marginRight: 10 },
    input: { flex: 1, height: '100%', color: '#E2E8F0', fontSize: 14 },
    submitButton: {
        borderRadius: 14, height: 54, justifyContent: 'center', alignItems: 'center', marginTop: 8,
    },
    submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});

export default RegisterLicenseScreen;
