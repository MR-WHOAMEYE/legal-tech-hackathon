import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, Building, ShieldCheck } from 'lucide-react-native';
import { useWalletConnectModal } from '@walletconnect/modal-react-native';

const LoginScreen = ({ navigation }: any) => {
    const { login, loginWithWallet, register, isLoading } = useContext(AuthContext);
    const { open, isConnected, address } = useWalletConnectModal();
    
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'regulator' | 'business' | 'verifier'>('verifier');
    const [businessName, setBusinessName] = useState('');
    const [pendingAction, setPendingAction] = useState<'login' | 'link' | null>(null);

    // Effect to trigger login when wallet connects
    React.useEffect(() => {
        if (isConnected && address) {
            if (pendingAction === 'login') {
                loginWithWallet(address).catch((err) => {
                    Alert.alert("Wallet Login Error", err.response?.data?.error || err.message);
                });
                setPendingAction(null);
            } else if (pendingAction === 'link') {
                Alert.alert("Wallet Linked!", "Your address will be submitted when you complete registration.");
                setPendingAction(null);
            }
        }
    }, [isConnected, address, pendingAction]);

    const handleWalletConnect = async (action: 'login' | 'link') => {
        setPendingAction(action);
        try {
            await open();
        } catch (error: any) {
            console.log("WalletConnect open error:", error.message);
            
            // Fallback: If socket stalls or WC fails, alert and try to direct deep-link
            Alert.alert(
                'WalletConnect Failed', 
                'Relay servers might be down or not responding. We will try a direct MetaMask connection.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Try Direct Link', onPress: () => {
                        // Direct universal link to MetaMask
                        const metamaskUrl = 'https://metamask.app.link/dapp/localhost:8081';
                        import('react-native').then(({ Linking }) => {
                            Linking.canOpenURL(metamaskUrl).then(supported => {
                                if (supported) {
                                    Linking.openURL(metamaskUrl);
                                } else {
                                    Alert.alert("MetaMask not found", "Please install MetaMask to continue.");
                                }
                            });
                        });
                    }}
                ]
            );
        }
    };

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
                    businessName: role === 'business' ? businessName : undefined,
                    walletAddress: isConnected ? address : undefined
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
            <LinearGradient colors={['#001621', '#011e2d', '#001621']} style={StyleSheet.absoluteFill} />
            
            <KeyboardAvoidingView 
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Brand Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Image 
                                source={require('../../assets/icon.png')} 
                                style={[styles.logoGradient, { backgroundColor: 'transparent' }]}
                                resizeMode="cover" 
                            />
                        </View>
                        <Text style={styles.brandName}>BizBlock</Text>
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
                                <Mail color="#0c4651" size={20} style={styles.inputIcon} />
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
                                <Lock color="#0c4651" size={20} style={styles.inputIcon} />
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
                                    <Building color="#0c4651" size={20} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Business Name"
                                        placeholderTextColor="#475569"
                                        value={businessName}
                                        onChangeText={setBusinessName}
                                    />
                                </View>
                            )}

                            {/* Connect with Wallet / MetaMask button */}
                            <TouchableOpacity 
                                onPress={() => handleWalletConnect(isLogin ? 'login' : 'link')} 
                                disabled={isLoading || (isConnected && !isLogin)}
                                style={[styles.walletButton, { marginBottom: 12, backgroundColor: (isConnected && !isLogin) ? 'rgba(0,0,0,0.2)' : '#1E293B' }]}
                                activeOpacity={0.8}
                            >
                                <View style={styles.walletContent}>
                                    <View style={(isConnected && !isLogin) ? styles.foxIconBgConnected : styles.foxIconBg}>
                                        <Text style={styles.foxEmoji}>{(isConnected && !isLogin) ? '✓' : '🦊'}</Text>
                                    </View>
                                    <Text style={(isConnected && !isLogin) ? styles.walletTextConnected : styles.walletText}>
                                        {isLogin ? 'Connect & Login with Web3' : (isConnected ? `Linked: ${address?.substring(0,8)}...` : 'Link MetaMask Address')}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* Submit */}
                            <TouchableOpacity onPress={handleSubmit} disabled={isLoading} activeOpacity={0.8}>
                                <LinearGradient 
                                    colors={['#ff4103', '#0c4651']}
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
        shadowColor: '#ff4103', shadowOffset: { width: 0, height: 8 },
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
        borderWidth: 1, borderColor: 'rgba(12,70,81,0.15)',
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
        backgroundColor: 'rgba(12,70,81,0.15)',
        borderColor: '#0c4651',
    },
    roleEmoji: { fontSize: 20, marginBottom: 4 },
    roleText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    roleTextActive: { color: '#ffaa88' },
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
    switchHighlight: { color: '#ff4103', fontWeight: '700' },
    walletButton: {
        marginTop: 16,
        backgroundColor: '#1E293B',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 14,
        alignItems: 'center',
    },
    walletContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    foxIconBg: {
        width: 28, height: 28,
        backgroundColor: '#F6851B',
        borderRadius: 8,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    foxIconBgConnected: {
        width: 28, height: 28,
        backgroundColor: '#10B981',
        borderRadius: 8,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    foxEmoji: { fontSize: 16 },
    walletText: {
        color: '#F1F5F9',
        fontSize: 16,
        fontWeight: '600',
    },
    walletTextConnected: {
        color: '#10B981',
        fontSize: 16,
        fontWeight: '600',
    }
});

export default LoginScreen;
