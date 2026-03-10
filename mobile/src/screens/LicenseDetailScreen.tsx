import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { fetchLicenseSmart } from '../services/offline';
import { ShieldCheck, ShieldAlert, KeyRound, Building, Hash, Calendar, FileText, ChevronLeft, Link as LinkIcon } from 'lucide-react-native';

const LicenseDetailScreen = ({ route, navigation }: any) => {
    // We might pass licenseId directly, or pass preloaded licenseData from MyLicenses
    const { licenseId, licenseData } = route.params || {};

    const [license, setLicense] = useState<any>(licenseData || null);
    const [loading, setLoading] = useState(!licenseData);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!licenseData && licenseId) {
            loadLicense(licenseId);
        }
    }, [licenseId]);

    const loadLicense = async (id: string) => {
        try {
            setLoading(true);
            const data = await fetchLicenseSmart(id);
            if (!data) {
                setError("License could not be verified.");
            } else {
                setLicense(data);
            }
        } catch (e: any) {
            setError(e.message || "Failed to load license");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={styles.loadingText}>Verifying Blockchain Record...</Text>
            </View>
        );
    }

    if (error || !license) {
        return (
            <View style={styles.center}>
                <ShieldAlert size={64} color="#EF4444" />
                <Text style={styles.errorText}>{error || "License not found"}</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isActive = license.status === 0;
    const isSuspended = license.status === 1;
    const ValidationIcon = isActive ? ShieldCheck : ShieldAlert;
    const statusColor = isActive ? '#10B981' : (isSuspended ? '#F59E0B' : '#EF4444');

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backIconButton} onPress={() => navigation.goBack()}>
                    <ChevronLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>License Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.mainContent}>
                <View style={styles.statusBox}>
                    <ValidationIcon size={48} color={statusColor} />
                    <Text style={[styles.statusTitle, { color: statusColor }]}>
                        {license.statusString.toUpperCase()}
                    </Text>
                    {isActive ? (
                        <Text style={styles.statusSubtitle}>Verified on blockchain</Text>
                    ) : (
                        <Text style={[styles.statusSubtitle, { color: '#EF4444' }]}>Invalid or Revoked</Text>
                    )}
                </View>

                {/* QR Code Section */}
                <View style={styles.qrContainer}>
                    <Text style={styles.qrLabel}>Scan to Verify</Text>
                    <View style={styles.qrFrame}>
                        <QRCode
                            value={JSON.stringify({ licenseId: license.licenseId })}
                            size={160}
                            color="#111827"
                            backgroundColor="#FFFFFF"
                        />
                    </View>
                </View>

                {/* Details Section */}
                <View style={styles.detailsCard}>
                    <DetailRow icon={<Building />} label="Business Name" value={license.businessName} />
                    <DetailRow icon={<Hash />} label="License ID" value={license.licenseId} />
                    <DetailRow icon={<FileText />} label="Type" value={`${license.licenseType} License`} />
                    <DetailRow icon={<Calendar />} label="Issued On" value={new Date(license.issueDate).toLocaleDateString()} />
                    <DetailRow icon={<Calendar />} label="Expires On" value={new Date(license.expiryDate).toLocaleDateString()} />
                    <DetailRow icon={<KeyRound />} label="Issuer" value={`${license.issuerAddress.slice(0, 8)}...${license.issuerAddress.slice(-6)}`} />
                    
                    {/* Document Hash */}
                    <View style={styles.hashSection}>
                        <View style={styles.hashHeader}>
                            <LinkIcon size={16} color="#6B7280" />
                            <Text style={styles.hashLabel}>Document Hash (IPFS/SHA256)</Text>
                        </View>
                        <Text selectable style={styles.hashValue}>{license.documentHash}</Text>
                    </View>
                </View>
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const DetailRow = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
    <View style={styles.row}>
        <View style={styles.rowIconBox}>
            {React.cloneElement(icon, { size: 20, color: '#6B7280' })}
        </View>
        <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: 24,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#4B5563',
        fontWeight: '500',
    },
    errorText: {
        marginTop: 16,
        fontSize: 18,
        color: '#1F2937',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    backButton: {
        marginTop: 24,
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#374151',
        fontWeight: 'bold',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backIconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    mainContent: {
        padding: 20,
    },
    statusBox: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    statusTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 12,
        letterSpacing: 1,
    },
    statusSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    qrContainer: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    qrLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4B5563',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    qrFrame: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    detailsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    rowIconBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    rowContent: {
        flex: 1,
    },
    rowLabel: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 2,
    },
    rowValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    hashSection: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: 8,
    },
    hashHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    hashLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4B5563',
        marginLeft: 6,
    },
    hashValue: {
        fontSize: 13,
        color: '#374151',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    }
});

export default LicenseDetailScreen;
