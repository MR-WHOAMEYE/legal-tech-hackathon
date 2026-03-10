import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck, ShieldAlert, ChevronLeft, Lock, Eye, EyeOff } from 'lucide-react-native';

const ZKResultScreen = ({ route, navigation }: any) => {
    const { result } = route.params;
    const isValid = result?.verified === true;

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        // Fade in
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1, duration: 600, useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0, duration: 600, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true,
            }),
        ]).start();

        // Pulse loop for valid badge
        if (isValid) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, []);

    const StatusIcon = isValid ? ShieldCheck : ShieldAlert;

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#001621', '#011e2d', '#001621']} style={StyleSheet.absoluteFill} />

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <ChevronLeft size={24} color="#94A3B8" />
            </TouchableOpacity>

            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                {/* Status Badge */}
                <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
                    <LinearGradient
                        colors={isValid ? ['#cc3200', '#ff4103'] : ['#DC2626', '#EF4444']}
                        style={styles.iconGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <StatusIcon size={56} color="#FFFFFF" />
                    </LinearGradient>
                </Animated.View>

                {/* Status Text */}
                <Text style={[styles.statusTitle, { color: isValid ? '#ff4103' : '#EF4444' }]}>
                    {isValid ? 'VERIFIED' : 'NOT VERIFIED'}
                </Text>
                <Text style={styles.statusSubtitle}>
                    {result?.message || (isValid ? 'License is authentic and active' : 'Proof is invalid or expired')}
                </Text>

                {/* Privacy Shield */}
                <View style={styles.privacyBadge}>
                    <Lock size={14} color="#0c4651" />
                    <Text style={styles.privacyText}>Zero-Knowledge Proof — No data was revealed</Text>
                </View>

                {/* Info Cards */}
                {isValid && result?.licenseType && (
                    <View style={styles.infoCard}>
                        <LinearGradient
                            colors={['rgba(16,185,129,0.1)', 'rgba(16,185,129,0.03)']}
                            style={styles.infoGradient}
                        >
                            <Text style={styles.infoLabel}>LICENSE TYPE</Text>
                            <Text style={styles.infoValue}>{result.licenseType}</Text>
                        </LinearGradient>
                    </View>
                )}

                {/* What was NOT revealed */}
                <View style={styles.hiddenCard}>
                    <LinearGradient
                        colors={['rgba(12,70,81,0.1)', 'rgba(12,70,81,0.03)']}
                        style={styles.hiddenGradient}
                    >
                        <View style={styles.hiddenHeader}>
                            <EyeOff size={16} color="#0c4651" />
                            <Text style={styles.hiddenTitle}>Data Protected by ZKP</Text>
                        </View>
                        <View style={styles.hiddenList}>
                            {['Business Name', 'License ID', 'Holder Address', 'Issue Date', 'Expiry Date', 'Document Hash'].map((item, i) => (
                                <View key={i} style={styles.hiddenItem}>
                                    <View style={styles.redactedDot} />
                                    <Text style={styles.hiddenItemText}>{item}</Text>
                                    <Text style={styles.redactedTag}>REDACTED</Text>
                                </View>
                            ))}
                        </View>
                    </LinearGradient>
                </View>

                {result?.proofExpiry && (
                    <Text style={styles.expiryText}>
                        Proof valid until: {new Date(result.proofExpiry).toLocaleString()}
                    </Text>
                )}

                <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
                    <LinearGradient
                        colors={isValid ? ['#cc3200', '#ff4103'] : ['#4B5563', '#6B7280']}
                        style={styles.doneButton}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.doneText}>Back to Dashboard</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    backButton: {
        position: 'absolute', top: 60, left: 20, zIndex: 10,
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center', alignItems: 'center',
    },
    content: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        padding: 24, paddingTop: 80,
    },
    iconContainer: {
        width: 120, height: 120, borderRadius: 60,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#ff4103', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4, shadowRadius: 20,
    },
    iconGradient: {
        width: 110, height: 110, borderRadius: 55,
        justifyContent: 'center', alignItems: 'center',
    },
    statusTitle: {
        fontSize: 32, fontWeight: '900', letterSpacing: 3, marginBottom: 8,
    },
    statusSubtitle: {
        fontSize: 14, color: '#94A3B8', textAlign: 'center',
        paddingHorizontal: 20, lineHeight: 20, marginBottom: 16,
    },
    privacyBadge: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(12,70,81,0.1)',
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 20, marginBottom: 24,
        borderWidth: 1, borderColor: 'rgba(12,70,81,0.2)',
    },
    privacyText: { color: '#ff7744', fontSize: 12, fontWeight: '600', marginLeft: 6 },
    infoCard: {
        width: '100%', borderRadius: 16, overflow: 'hidden',
        marginBottom: 16, borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)',
    },
    infoGradient: { padding: 20, alignItems: 'center' },
    infoLabel: { fontSize: 11, color: '#6B7280', fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
    infoValue: { fontSize: 22, color: '#ff4103', fontWeight: '800', letterSpacing: 1 },
    hiddenCard: {
        width: '100%', borderRadius: 16, overflow: 'hidden',
        marginBottom: 16, borderWidth: 1, borderColor: 'rgba(12,70,81,0.15)',
    },
    hiddenGradient: { padding: 20 },
    hiddenHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    hiddenTitle: { fontSize: 14, color: '#ffaa88', fontWeight: '700', marginLeft: 8 },
    hiddenList: {},
    hiddenItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 6,
    },
    redactedDot: {
        width: 6, height: 6, borderRadius: 3,
        backgroundColor: '#0a3540', marginRight: 10,
    },
    hiddenItemText: { flex: 1, fontSize: 13, color: '#64748B' },
    redactedTag: {
        fontSize: 10, color: '#0c4651', fontWeight: '800',
        backgroundColor: 'rgba(12,70,81,0.1)',
        paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4,
        letterSpacing: 1,
    },
    expiryText: { fontSize: 12, color: '#475569', marginBottom: 20 },
    doneButton: {
        paddingHorizontal: 40, paddingVertical: 16,
        borderRadius: 14,
    },
    doneText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default ZKResultScreen;
