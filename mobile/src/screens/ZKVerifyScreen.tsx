import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck, Hash, ScanLine, ChevronLeft } from 'lucide-react-native';
import { zkApi } from '../services/api';

const ZKVerifyScreen = ({ navigation }: any) => {
    const [proofHash, setProofHash] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async () => {
        if (!proofHash.trim()) {
            Alert.alert("Error", "Please enter a valid proof hash");
            return;
        }

        setIsLoading(true);
        try {
            const res = await zkApi.verifyProof(proofHash.trim());
            navigation.navigate('ZKResult', { result: res.data });
        } catch (e: any) {
            if (e.response?.status === 404) {
                navigation.navigate('ZKResult', { result: { verified: false, message: 'No privacy proof found for this hash.' } });
            } else {
                Alert.alert("Error", e.response?.data?.error || e.message || "Verification failed");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F172A', '#1E293B', '#0F172A']} style={StyleSheet.absoluteFill} />
            
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Back button */}
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ChevronLeft size={24} color="#94A3B8" />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconRing}>
                            <LinearGradient 
                                colors={['#06B6D4', '#8B5CF6']} 
                                style={styles.iconGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <ShieldCheck size={40} color="#FFFFFF" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.title}>Zero-Knowledge{'\n'}Verification</Text>
                        <Text style={styles.subtitle}>
                            Verify a license without accessing any sensitive business information
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formCard}>
                        <LinearGradient 
                            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']} 
                            style={styles.formGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                        >
                            <Text style={styles.label}>PROOF HASH</Text>
                            <View style={styles.inputGroup}>
                                <Hash color="#8B5CF6" size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="0x..."
                                    placeholderTextColor="#475569"
                                    value={proofHash}
                                    onChangeText={setProofHash}
                                    autoCapitalize="none"
                                    returnKeyType="go"
                                    onSubmitEditing={handleVerify}
                                />
                            </View>

                            <TouchableOpacity onPress={handleVerify} disabled={isLoading}>
                                <LinearGradient 
                                    colors={['#06B6D4', '#8B5CF6']} 
                                    style={styles.submitButton}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.submitText}>Verify Privacy Proof</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.scanButton}
                                onPress={() => navigation.navigate('Scan')}
                            >
                                <ScanLine size={20} color="#06B6D4" />
                                <Text style={styles.scanText}>Scan QR Code Instead</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>

                    {/* Info */}
                    <View style={styles.infoCard}>
                        <LinearGradient 
                            colors={['rgba(6,182,212,0.1)', 'rgba(139,92,246,0.05)']} 
                            style={styles.infoGradient}
                        >
                            <Text style={styles.infoTitle}>🔐 How ZK Verification Works</Text>
                            <Text style={styles.infoText}>
                                • The proof cryptographically confirms a valid license exists{'\n'}
                                • You will ONLY learn: Valid/Invalid + License Type{'\n'}
                                • Business name, ID, and all other data remain hidden{'\n'}
                                • Powered by on-chain hash commitments
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
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 20,
    },
    header: { alignItems: 'center', marginBottom: 32 },
    iconRing: {
        width: 88, height: 88, borderRadius: 44,
        borderWidth: 2, borderColor: 'rgba(139,92,246,0.3)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 20,
    },
    iconGradient: {
        width: 72, height: 72, borderRadius: 36,
        justifyContent: 'center', alignItems: 'center',
    },
    title: {
        fontSize: 28, fontWeight: '800', color: '#F1F5F9',
        textAlign: 'center', letterSpacing: -0.5, lineHeight: 34,
    },
    subtitle: {
        fontSize: 14, color: '#64748B', textAlign: 'center',
        marginTop: 10, lineHeight: 20, paddingHorizontal: 20,
    },
    formCard: {
        borderRadius: 20, overflow: 'hidden', marginBottom: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    formGradient: { padding: 24 },
    label: {
        fontSize: 12, fontWeight: '700', color: '#94A3B8',
        letterSpacing: 1.5, marginBottom: 10,
    },
    inputGroup: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)',
        borderRadius: 12, marginBottom: 20, paddingHorizontal: 14, height: 54,
    },
    inputIcon: { marginRight: 10 },
    input: {
        flex: 1, height: '100%', color: '#E2E8F0',
        fontSize: 15, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    submitButton: {
        borderRadius: 14, height: 54,
        justifyContent: 'center', alignItems: 'center',
    },
    submitText: {
        color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3,
    },
    scanButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginTop: 16, paddingVertical: 8,
    },
    scanText: { color: '#06B6D4', fontSize: 14, fontWeight: '600', marginLeft: 8 },
    infoCard: {
        borderRadius: 16, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(6,182,212,0.15)',
    },
    infoGradient: { padding: 20 },
    infoTitle: {
        fontSize: 15, fontWeight: '700', color: '#E2E8F0', marginBottom: 10,
    },
    infoText: {
        fontSize: 13, color: '#94A3B8', lineHeight: 22,
    },
});

export default ZKVerifyScreen;
