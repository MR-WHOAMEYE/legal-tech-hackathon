import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, Building, ShieldCheck } from 'lucide-react-native';

const LoginScreen = ({ navigation }: any) => {
    const { login, register, isLoading } = useContext(AuthContext);
    
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'regulator' | 'business' | 'verifier'>('verifier');
    const [businessName, setBusinessName] = useState('');

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Email and Password are required");
            return;
        }

        try {
            if (isLogin) {
                await login(email.trim(), password);
            } else {
                if (role === 'business' && !businessName) {
                    Alert.alert("Error", "Business name is required for Business role");
                    return;
                }
                await register({ 
                    email: email.trim(), 
                    password, 
                    role, 
                    businessName: role === 'business' ? businessName : undefined 
                });
            }
        } catch (e: any) {
            Alert.alert("Error", e.response?.data?.error || e.message || "Something went wrong");
        }
    };

    const roleOptions = [
        { key: 'verifier' as const, label: 'Verifier', icon: '🔍' },
        { key: 'business' as const, label: 'Business', icon: '🏢' },
        { key: 'regulator' as const, label: 'Regulator', icon: '🏛️' },
    ];

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F172A', '#1E293B', '#0F172A']} style={StyleSheet.absoluteFill} />
            
            <KeyboardAvoidingView 
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Brand Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <LinearGradient 
                                colors={['#06B6D4', '#8B5CF6']}
                                style={styles.logoGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <ShieldCheck size={36} color="#FFFFFF" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.brandName}>TrustPass</Text>
                        <Text style={styles.tagline}>Blockchain License Verification</Text>
                        <View style={styles.tagRow}>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>🔗 On-Chain</Text>
                            </View>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>🔐 ZK-Proof</Text>
                            </View>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>📱 Offline</Text>
                            </View>
                        </View>
                    </View>

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        <LinearGradient 
                            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                            style={styles.formGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                        >
                            <Text style={styles.formTitle}>
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </Text>

                            {/* Email */}
                            <View style={styles.inputGroup}>
                                <Mail color="#8B5CF6" size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email Address"
                                    placeholderTextColor="#475569"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            {/* Password */}
                            <View style={styles.inputGroup}>
                                <Lock color="#8B5CF6" size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor="#475569"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>

                            {/* Role Selection (Register only) */}
                            {!isLogin && (
                                <View style={styles.roleSection}>
                                    <Text style={styles.roleLabel}>SELECT YOUR ROLE</Text>
                                    <View style={styles.roleButtons}>
                                        {roleOptions.map(r => (
                                            <TouchableOpacity 
                                                key={r.key}
                                                style={[styles.roleButton, role === r.key && styles.roleButtonActive]}
                                                onPress={() => setRole(r.key)}
                                            >
                                                <Text style={styles.roleEmoji}>{r.icon}</Text>
                                                <Text style={[styles.roleText, role === r.key && styles.roleTextActive]}>
                                                    {r.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Business Name (register + business role) */}
                            {!isLogin && role === 'business' && (
                                <View style={styles.inputGroup}>
                                    <Building color="#8B5CF6" size={20} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Business Name"
                                        placeholderTextColor="#475569"
                                        value={businessName}
                                        onChangeText={setBusinessName}
                                    />
                                </View>
                            )}

                            {/* Submit */}
                            <TouchableOpacity onPress={handleSubmit} disabled={isLoading} activeOpacity={0.8}>
                                <LinearGradient 
                                    colors={['#06B6D4', '#8B5CF6']}
                                    style={styles.submitButton}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.submitText}>
                                            {isLogin ? 'Sign In Securely' : 'Create Account'}
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Switch */}
                            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
                                <Text style={styles.switchText}>
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    <Text style={styles.switchHighlight}>
                                        {isLogin ? 'Sign up' : 'Log in'}
                                    </Text>
                                </Text>
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
    scrollContent: {
        flexGrow: 1, justifyContent: 'center', padding: 24,
    },
    header: { alignItems: 'center', marginBottom: 36 },
    logoContainer: { marginBottom: 16 },
    logoGradient: {
        width: 72, height: 72, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#06B6D4', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4, shadowRadius: 16,
    },
    brandName: {
        fontSize: 36, fontWeight: '900', color: '#F1F5F9',
        letterSpacing: -1,
    },
    tagline: {
        fontSize: 14, color: '#64748B', marginTop: 4, letterSpacing: 0.5,
    },
    tagRow: { flexDirection: 'row', marginTop: 16, gap: 8 },
    tag: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 20, borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    tagText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },

    formCard: {
        borderRadius: 24, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    formGradient: { padding: 28 },
    formTitle: {
        fontSize: 22, fontWeight: '800', color: '#E2E8F0',
        marginBottom: 24,
    },
    inputGroup: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderWidth: 1, borderColor: 'rgba(139,92,246,0.15)',
        borderRadius: 14, marginBottom: 14,
        paddingHorizontal: 14, height: 54,
    },
    inputIcon: { marginRight: 12 },
    input: {
        flex: 1, height: '100%', color: '#E2E8F0', fontSize: 15,
    },
    roleSection: { marginBottom: 16 },
    roleLabel: {
        fontSize: 11, fontWeight: '700', color: '#94A3B8',
        letterSpacing: 1.5, marginBottom: 10,
    },
    roleButtons: { flexDirection: 'row', gap: 8 },
    roleButton: {
        flex: 1, paddingVertical: 12,
        borderRadius: 12, borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    roleButtonActive: {
        backgroundColor: 'rgba(139,92,246,0.15)',
        borderColor: '#8B5CF6',
    },
    roleEmoji: { fontSize: 20, marginBottom: 4 },
    roleText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    roleTextActive: { color: '#C4B5FD' },
    submitButton: {
        borderRadius: 14, height: 54,
        justifyContent: 'center', alignItems: 'center',
        marginTop: 4,
    },
    submitText: {
        color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3,
    },
    switchButton: { marginTop: 20, alignItems: 'center' },
    switchText: { color: '#64748B', fontSize: 14 },
    switchHighlight: { color: '#06B6D4', fontWeight: '700' },
});

export default LoginScreen;
