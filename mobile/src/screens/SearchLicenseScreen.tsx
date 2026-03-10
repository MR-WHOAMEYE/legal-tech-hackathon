import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Hash, ChevronLeft } from 'lucide-react-native';

const SearchLicenseScreen = ({ navigation }: any) => {
    const [licenseId, setLicenseId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!licenseId.trim()) {
            Alert.alert("Error", "Please enter a valid License ID");
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigation.navigate('LicenseDetail', { licenseId: licenseId.trim() });
        }, 500);
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F172A', '#1E293B', '#0F172A']} style={StyleSheet.absoluteFill} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ChevronLeft size={24} color="#94A3B8" />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <LinearGradient colors={['#2563EB', '#3B82F6']} style={styles.iconCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Search size={36} color="#FFFFFF" />
                        </LinearGradient>
                        <Text style={styles.title}>Search License</Text>
                        <Text style={styles.subtitle}>Verify a license by its ID on the blockchain</Text>
                    </View>

                    <View style={styles.formCard}>
                        <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']} style={styles.formGradient}>
                            <Text style={styles.label}>LICENSE ID</Text>
                            <View style={styles.inputGroup}>
                                <Hash color="#3B82F6" size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. GST-12345"
                                    placeholderTextColor="#475569"
                                    value={licenseId}
                                    onChangeText={setLicenseId}
                                    autoCapitalize="characters"
                                    returnKeyType="search"
                                    onSubmitEditing={handleSearch}
                                />
                            </View>

                            <TouchableOpacity onPress={handleSearch} disabled={isLoading} activeOpacity={0.8}>
                                <LinearGradient colors={['#2563EB', '#3B82F6']} style={styles.submitButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.submitText}>Search Blockchain</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>

                    <View style={styles.helpCard}>
                        <LinearGradient colors={['rgba(37,99,235,0.1)', 'rgba(37,99,235,0.03)']} style={styles.helpGradient}>
                            <Text style={styles.helpTitle}>🔗 How it works</Text>
                            <Text style={styles.helpText}>
                                This search queries the blockchain securely to verify that the license exists, is authentic, and has not been revoked or suspended. Results are fetched directly from the smart contract.
                            </Text>
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
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    },
    header: { alignItems: 'center', marginBottom: 32 },
    iconCircle: {
        width: 80, height: 80, borderRadius: 24,
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    title: { fontSize: 28, fontWeight: '800', color: '#F1F5F9', letterSpacing: -0.3 },
    subtitle: { fontSize: 14, color: '#64748B', marginTop: 6, textAlign: 'center' },
    formCard: {
        borderRadius: 20, overflow: 'hidden', marginBottom: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    formGradient: { padding: 24 },
    label: {
        fontSize: 11, fontWeight: '700', color: '#94A3B8',
        letterSpacing: 1.5, marginBottom: 10,
    },
    inputGroup: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)',
        borderRadius: 12, marginBottom: 20, paddingHorizontal: 14, height: 56,
    },
    inputIcon: { marginRight: 10 },
    input: {
        flex: 1, height: '100%', color: '#E2E8F0',
        fontSize: 16, fontWeight: '600',
    },
    submitButton: {
        borderRadius: 14, height: 54, justifyContent: 'center', alignItems: 'center',
    },
    submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    helpCard: {
        borderRadius: 16, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(37,99,235,0.15)',
    },
    helpGradient: { padding: 20 },
    helpTitle: { fontSize: 15, fontWeight: '700', color: '#93C5FD', marginBottom: 8 },
    helpText: { fontSize: 13, color: '#64748B', lineHeight: 20 },
});

export default SearchLicenseScreen;
