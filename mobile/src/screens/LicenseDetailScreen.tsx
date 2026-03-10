import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { fetchLicenseSmart } from '../services/offline';
import { zkApi } from '../services/api';
import { ShieldCheck, ShieldAlert, KeyRound, Building, Hash, Calendar, FileText, ChevronLeft, Link as LinkIcon, Fingerprint } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';

const LicenseDetailScreen = ({ route, navigation }: any) => {
    const { user } = useContext(AuthContext);
    const { licenseId, licenseData } = route.params || {};
    const [license, setLicense] = useState<any>(licenseData || null);
    const [loading, setLoading] = useState(!licenseData);
    const [error, setError] = useState('');
    const [zkLoading, setZkLoading] = useState(false);
    const [zkProof, setZkProof] = useState<string | null>(null);

    useEffect(() => {
        if (!licenseData && licenseId) {
            loadLicense(licenseId);
        }
    }, [licenseId]);

    const loadLicense = async (id: string) => {
        try {
            setLoading(true);
            const data = await fetchLicenseSmart(id);
            if (!data) setError("License could not be verified.");
            else setLicense(data);
        } catch (e: any) {
            setError(e.message || "Failed to load license");
        } finally {
            setLoading(false);
        }
    };

    const generateZKProof = async () => {
        if (!license?.licenseId) return;
        setZkLoading(true);
        try {
            const res = await zkApi.createProof(license.licenseId);
            setZkProof(res.data.proofHash);
            Alert.alert("Privacy Proof Created", "A zero-knowledge proof has been minted on-chain. Share the QR below — the verifier will only see validity + license type.");
        } catch (e: any) {
            Alert.alert("Error", e.response?.data?.error || e.message || "Failed to create ZK proof");
        } finally {
            setZkLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <LinearGradient colors={['#001621', '#011e2d']} style={StyleSheet.absoluteFill} />
                <ActivityIndicator size="large" color="#ff4103" />
                <Text style={styles.loadingText}>Verifying Blockchain Record...</Text>
            </View>
        );
    }

    if (error || !license) {
        return (
            <View style={styles.center}>
                <LinearGradient colors={['#001621', '#011e2d']} style={StyleSheet.absoluteFill} />
                <ShieldAlert size={64} color="#EF4444" />
                <Text style={styles.errorText}>{error || "License not found"}</Text>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isActive = license.status === 0;
    const isSuspended = license.status === 1;
    const StatusIcon = isActive ? ShieldCheck : ShieldAlert;
    const statusGradient: [string, string] = isActive ? ['#cc3200', '#ff4103'] : (isSuspended ? ['#cc3200', '#ff4103'] : ['#DC2626', '#EF4444']);
    
    // Check if current user is the license owner (business)
    const isLicenseOwner = user?.role === 'business' && user?.walletAddress?.toLowerCase() === license.holderAddress?.toLowerCase();
    const showZKButton = isLicenseOwner;
    
    console.log('User role:', user?.role);
    console.log('User wallet:', user?.walletAddress);
    console.log('License holder:', license.holderAddress);
    console.log('Is license owner:', isLicenseOwner);
    console.log('Show ZK button:', showZKButton);

    return (
        <View style={{ flex: 1 }}>
            <LinearGradient colors={['#001621', '#011e2d', '#001621']} style={StyleSheet.absoluteFill} />
            <ScrollView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backIconBtn} onPress={() => navigation.goBack()}>
                        <ChevronLeft size={24} color="#94A3B8" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>License Details</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.mainContent}>
                    {/* Status Badge */}
                    <View style={styles.statusCard}>
                        <LinearGradient colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']} style={styles.statusGradient}>
                            <LinearGradient colors={statusGradient} style={styles.statusIconCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <StatusIcon size={36} color="#FFFFFF" />
                            </LinearGradient>
                            <Text style={[styles.statusTitle, { color: statusGradient[1] }]}>
                                {license.statusString?.toUpperCase()}
                            </Text>
                            <Text style={styles.statusSubtitle}>
                                {isActive ? 'Verified on blockchain' : 'License is not active'}
                            </Text>
                        </LinearGradient>
                    </View>

                    {/* QR Code */}
                    <View style={styles.qrCard}>
                        <LinearGradient colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']} style={styles.qrGradient}>
                            <Text style={styles.qrLabel}>SCAN TO VERIFY</Text>
                            <View style={styles.qrFrame}>
                                <QRCode
                                    value={JSON.stringify({ licenseId: license.licenseId })}
                                    size={150}
                                    color="#001621"
                                    backgroundColor="#FFFFFF"
                                />
                            </View>
                        </LinearGradient>
                    </View>

                    {/* ZK Privacy Proof - Only show for license owner (business) */}
                    {showZKButton && (
                        <TouchableOpacity onPress={generateZKProof} disabled={zkLoading}>
                            <LinearGradient 
                                colors={['#cc3200', '#0c4651']}
                                style={styles.zkButton}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            >
                                {zkLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Fingerprint size={20} color="#FFFFFF" />
                                        <Text style={styles.zkButtonText}>Generate Privacy Proof (ZKP)</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    {/* ZK Proof QR - Only show for license owner (business) */}
                    {showZKButton && zkProof && (
                        <View style={styles.zkQrCard}>
                            <LinearGradient colors={['rgba(12,70,81,0.12)', 'rgba(255,65,3,0.05)']} style={styles.zkQrGradient}>
                                <Text style={styles.zkQrLabel}>🔐 ZERO-KNOWLEDGE PROOF QR</Text>
                                <Text style={styles.zkQrDesc}>Share this QR — verifier sees ONLY validity + type</Text>
                                <View style={styles.qrFrame}>
                                    <QRCode
                                        value={zkProof}
                                        size={150}
                                        color="#0a3540"
                                        backgroundColor="#FFFFFF"
                                    />
                                </View>
                                <Text style={styles.zkHashText} selectable>{zkProof}</Text>
                            </LinearGradient>
                        </View>
                    )}

                    {/* Details */}
                    <View style={styles.detailsCard}>
                        <LinearGradient colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']} style={styles.detailsGradient}>
                            <DetailRow icon={<Building />} label="Business Name" value={license.businessName} />
                            <DetailRow icon={<Hash />} label="License ID" value={license.licenseId} />
                            <DetailRow icon={<FileText />} label="Type" value={`${license.licenseType} License`} />
                            <DetailRow icon={<Calendar />} label="Issued On" value={new Date(license.issueDate).toLocaleDateString()} />
                            <DetailRow icon={<Calendar />} label="Expires On" value={new Date(license.expiryDate).toLocaleDateString()} />
                            <DetailRow icon={<KeyRound />} label="Issuer" value={`${license.issuerAddress.slice(0, 8)}...${license.issuerAddress.slice(-6)}`} />

                            <View style={styles.hashSection}>
                                <View style={styles.hashHeader}>
                                    <LinkIcon size={14} color="#64748B" />
                                    <Text style={styles.hashLabel}>Document Hash (IPFS/SHA256)</Text>
                                </View>
                                <Text selectable style={styles.hashValue}>{license.documentHash}</Text>
                            </View>
                        </LinearGradient>
                    </View>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const DetailRow = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
    <View style={styles.row}>
        <View style={styles.rowIconBox}>
            {React.cloneElement(icon, { size: 18, color: '#64748B' })}
        </View>
        <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: {
        flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24,
    },
    loadingText: { marginTop: 16, fontSize: 15, color: '#94A3B8', fontWeight: '500' },
    errorText: { marginTop: 16, fontSize: 18, color: '#F1F5F9', fontWeight: 'bold', textAlign: 'center' },
    backBtn: { marginTop: 24, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
    backBtnText: { color: '#94A3B8', fontWeight: 'bold', fontSize: 15 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 20, paddingTop: 60
    },
    backIconBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#F1F5F9' },
    mainContent: { padding: 20 },
    statusCard: {
        borderRadius: 20, overflow: 'hidden', marginBottom: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    statusGradient: { padding: 24, alignItems: 'center' },
    statusIconCircle: {
        width: 72, height: 72, borderRadius: 36,
        justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    },
    statusTitle: { fontSize: 22, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
    statusSubtitle: { fontSize: 13, color: '#64748B' },
    qrCard: {
        borderRadius: 20, overflow: 'hidden', marginBottom: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    qrGradient: { padding: 24, alignItems: 'center' },
    qrLabel: {
        fontSize: 11, fontWeight: '800', color: '#94A3B8',
        letterSpacing: 1.5, marginBottom: 16,
    },
    qrFrame: {
        padding: 14, backgroundColor: '#FFFFFF', borderRadius: 14,
    },
    zkButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        borderRadius: 14, paddingVertical: 16, marginBottom: 16, gap: 10,
    },
    zkButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    zkQrCard: {
        borderRadius: 20, overflow: 'hidden', marginBottom: 16,
        borderWidth: 1, borderColor: 'rgba(12,70,81,0.2)',
    },
    zkQrGradient: { padding: 24, alignItems: 'center' },
    zkQrLabel: {
        fontSize: 12, fontWeight: '800', color: '#ffaa88',
        letterSpacing: 1, marginBottom: 6,
    },
    zkQrDesc: { fontSize: 12, color: '#64748B', marginBottom: 16, textAlign: 'center' },
    zkHashText: {
        fontSize: 10, color: '#475569', marginTop: 12,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textAlign: 'center',
    },
    detailsCard: {
        borderRadius: 20, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    detailsGradient: { padding: 20 },
    row: {
        flexDirection: 'row', alignItems: 'center',
        marginBottom: 14, paddingBottom: 14,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    rowIconBox: {
        width: 38, height: 38, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    rowContent: { flex: 1 },
    rowLabel: { fontSize: 12, color: '#64748B', marginBottom: 2 },
    rowValue: { fontSize: 14, fontWeight: '700', color: '#E2E8F0' },
    hashSection: {
        backgroundColor: 'rgba(0,0,0,0.2)', padding: 16,
        borderRadius: 12, borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)', marginTop: 4,
    },
    hashHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    hashLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', marginLeft: 6, letterSpacing: 0.5 },
    hashValue: {
        fontSize: 12, color: '#94A3B8',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
});

export default LicenseDetailScreen;
