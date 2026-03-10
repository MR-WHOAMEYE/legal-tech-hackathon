import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, Building, UserCircle2 } from 'lucide-react-native';

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

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Lock size={64} color="#2563EB" style={styles.icon} />
                    <Text style={styles.title}>TrustPass Verify</Text>
                    <Text style={styles.subtitle}>Blockchain Business Licensing</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Mail color="#6B7280" size={20} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Lock color="#6B7280" size={20} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    {!isLogin && (
                        <View style={styles.roleContainer}>
                            <Text style={styles.label}>Select your role:</Text>
                            <View style={styles.roleButtons}>
                                {(["verifier", "business", "regulator"] as const).map(r => (
                                    <TouchableOpacity 
                                        key={r}
                                        style={[styles.roleButton, role === r && styles.roleButtonActive]}
                                        onPress={() => setRole(r)}
                                    >
                                        <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                                            {r.charAt(0).toUpperCase() + r.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {!isLogin && role === 'business' && (
                        <View style={styles.inputGroup}>
                            <Building color="#6B7280" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Business Name"
                                placeholderTextColor="#9CA3AF"
                                value={businessName}
                                onChangeText={setBusinessName}
                            />
                        </View>
                    )}

                    <TouchableOpacity 
                        style={styles.submitButton} 
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitText}>
                                {isLogin ? 'Sign In Securely' : 'Create Account'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
                        <Text style={styles.switchText}>
                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                        </Text>
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
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    icon: {
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
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
        fontSize: 16,
    },
    roleContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 8,
        fontWeight: '500',
    },
    roleButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    roleButton: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    roleButtonActive: {
        backgroundColor: '#EFF6FF',
        borderColor: '#3B82F6',
    },
    roleText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    roleTextActive: {
        color: '#2563EB',
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: '#2563EB',
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#2563EB',
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
    switchButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    switchText: {
        color: '#4B5563',
        fontSize: 14,
    }
});

export default LoginScreen;
