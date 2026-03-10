import React, { useContext, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, PlusCircle, LayoutList, Scan, FileSearch, LogOut, CheckCircle2, Fingerprint, Shield } from 'lucide-react-native';

const DashboardCard = ({ title, subtitle, icon, onPress, colors, delay = 0 }: {
    title: string, subtitle?: string, icon: any, onPress: () => void, colors: string[], delay?: number
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, delay, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View style={[styles.cardWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
                <LinearGradient
                    colors={colors as any}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.cardIconBox}>
                        {icon}
                    </View>
                    <Text style={styles.cardTitle}>{title}</Text>
                    {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const DashboardScreen = ({ navigation }: any) => {
    const { user, logout } = useContext(AuthContext);

    const renderRoleContent = () => {
        if (!user) return null;

        const commonCards = [];

        if (user.role === 'regulator') {
            commonCards.push(
                <DashboardCard 
                    key="register"
                    title="Register License" 
                    subtitle="Mint on-chain"
                    icon={<PlusCircle color="#FFFFFF" size={28} />} 
                    onPress={() => navigation.navigate('RegisterLicense')} 
                    colors={['#cc3200', '#ff4103']}
                    delay={100}
                />,
                <DashboardCard 
                    key="search"
                    title="Search Licenses" 
                    subtitle="Lookup by ID"
                    icon={<FileSearch color="#FFFFFF" size={28} />} 
                    onPress={() => navigation.navigate('SearchLicense')} 
                    colors={['#cc3200', '#ff4103']}
                    delay={200}
                />,
                <DashboardCard 
                    key="scan"
                    title="Scan QR" 
                    subtitle="Camera verify"
                    icon={<Scan color="#FFFFFF" size={28} />} 
                    onPress={() => navigation.navigate('Scan')} 
                    colors={['#0a3540', '#0c4651']}
                    delay={300}
                />,
                <DashboardCard 
                    key="zk"
                    title="ZK Verify" 
                    subtitle="Privacy proof"
                    icon={<Fingerprint color="#FFFFFF" size={28} />} 
                    onPress={() => navigation.navigate('ZKVerify')} 
                    colors={['#cc3200', '#ff4103']}
                    delay={400}
                />,
            );
        } else if (user.role === 'business') {
            commonCards.push(
                <DashboardCard 
                    key="licenses"
                    title="My Licenses" 
                    subtitle="View all"
                    icon={<LayoutList color="#FFFFFF" size={28} />} 
                    onPress={() => navigation.navigate('MyLicenses')} 
                    colors={['#cc3200', '#ff4103']}
                    delay={100}
                />,
                <DashboardCard 
                    key="share"
                    title="Share QR" 
                    subtitle="Quick share"
                    icon={<Scan color="#FFFFFF" size={28} />} 
                    onPress={() => navigation.navigate('MyLicenses')} 
                    colors={['#cc3200', '#ff4103']}
                    delay={200}
                />,
                <DashboardCard 
                    key="zk"
                    title="ZK Verify" 
                    subtitle="Privacy proof"
                    icon={<Fingerprint color="#FFFFFF" size={28} />} 
                    onPress={() => navigation.navigate('ZKVerify')} 
                    colors={['#cc3200', '#ff4103']}
                    delay={300}
                />,
            );
        } else if (user.role === 'verifier') {
            commonCards.push(
                <DashboardCard 
                    key="scan"
                    title="Scan QR" 
                    subtitle="Camera verify"
                    icon={<Scan color="#FFFFFF" size={28} />} 
                    onPress={() => navigation.navigate('Scan')} 
                    colors={['#0a3540', '#0c4651']}
                    delay={100}
                />,
                <DashboardCard 
                    key="search"
                    title="Search by ID" 
                    subtitle="Manual lookup"
                    icon={<FileSearch color="#FFFFFF" size={28} />} 
                    onPress={() => navigation.navigate('SearchLicense')} 
                    colors={['#cc3200', '#ff4103']}
                    delay={200}
                />,
                <DashboardCard 
                    key="zk"
                    title="ZK Verify" 
                    subtitle="Privacy proof"
                    icon={<Fingerprint color="#FFFFFF" size={28} />} 
                    onPress={() => navigation.navigate('ZKVerify')} 
                    colors={['#cc3200', '#ff4103']}
                    delay={300}
                />,
            );
        }

        return <View style={styles.grid}>{commonCards}</View>;
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#001621', '#011e2d']} style={StyleSheet.absoluteFill} />
            <ScrollView style={{ flex: 1 }}>
                {/* Header */}
                <LinearGradient 
                    colors={['#011e2d', '#001621']}
                    style={styles.headerArea}
                >
                    <View style={styles.headerTop}>
                        <View style={styles.logoRow}>
                            <LinearGradient 
                                colors={['#ff4103', '#0c4651']}
                                style={styles.miniLogo}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Shield size={20} color="#FFFFFF" />
                            </LinearGradient>
                            <Text style={styles.logoText}>TrustPass</Text>
                        </View>
                        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                            <LogOut size={16} color="#F87171" />
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.emailText}>{user?.email}</Text>
                    
                    <View style={styles.roleBadge}>
                        <LinearGradient 
                            colors={['#ff4103', '#0c4651']}
                            style={styles.roleBadgeGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <CheckCircle2 size={14} color="#FFFFFF" />
                            <Text style={styles.roleBadgeText}>
                                {(user?.role || "user").toUpperCase()}
                            </Text>
                        </LinearGradient>
                    </View>
                </LinearGradient>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    {renderRoleContent()}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerArea: {
        padding: 24, paddingTop: 60,
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    headerTop: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 24,
    },
    logoRow: { flexDirection: 'row', alignItems: 'center' },
    miniLogo: {
        width: 36, height: 36, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center', marginRight: 10,
    },
    logoText: { fontSize: 20, fontWeight: '800', color: '#F1F5F9', letterSpacing: -0.5 },
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(248,113,113,0.1)',
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1,
        borderColor: 'rgba(248,113,113,0.15)',
    },
    logoutText: { color: '#F87171', marginLeft: 6, fontWeight: '700', fontSize: 13 },
    greeting: { color: '#64748B', fontSize: 15 },
    emailText: {
        color: '#F1F5F9', fontSize: 22, fontWeight: '800',
        marginBottom: 14, letterSpacing: -0.3,
    },
    roleBadge: { alignSelf: 'flex-start' },
    roleBadgeGradient: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 7,
        borderRadius: 20, gap: 6,
    },
    roleBadgeText: {
        color: '#FFFFFF', fontWeight: '800',
        fontSize: 11, letterSpacing: 1.5,
    },
    content: { padding: 24 },
    sectionTitle: {
        fontSize: 17, fontWeight: '800', color: '#94A3B8',
        marginBottom: 18, letterSpacing: 0.3,
    },
    grid: {
        flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    cardWrapper: { width: '48%', marginBottom: 14 },
    card: {
        borderRadius: 18, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
    },
    cardGradient: {
        padding: 20, minHeight: 130,
        justifyContent: 'space-between',
    },
    cardIconBox: {
        width: 48, height: 48, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 15, fontWeight: '800', color: '#FFFFFF',
    },
    cardSubtitle: {
        fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginTop: 2,
    },
});

export default DashboardScreen;
