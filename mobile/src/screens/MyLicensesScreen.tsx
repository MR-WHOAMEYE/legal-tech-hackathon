import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { fetchBusinessLicensesSmart } from '../services/offline';
import { requestApi } from '../services/api';
import { FileBadge, ChevronRight, ChevronLeft, Clock, XCircle } from 'lucide-react-native';

const MyLicensesScreen = ({ navigation }: any) => {
    const { user } = useContext(AuthContext);
    const [licenses, setLicenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadLicenses = async () => {
        if (!user || !user.walletAddress) return;
        try {
            // Fetch minted licenses
            const mintedData = await fetchBusinessLicensesSmart(user.walletAddress);
            
            // Fetch pending/rejected requests
            let requestsData = [];
            try {
                const res = await requestApi.getMyRequests();
                requestsData = res.data.requests || [];
            } catch (err) {
                console.warn("Could not fetch pending requests", err);
            }

            // Combine and sort, removing duplicates (prefer minted over approved requests)
            const mintedIds = new Set(mintedData.map((m: any) => m.licenseId));
            const filteredRequests = requestsData.filter((req: any) => {
                if (req.status === 'approved' && mintedIds.has(req.licenseId)) {
                    return false; // hide approved request if we already fetched the minted version
                }
                return true;
            });

            const combined = [...mintedData, ...filteredRequests];
            
            // Sort by creation date or expiry (newest first)
            combined.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.issuedDate || Date.now()).getTime();
                const dateB = new Date(b.createdAt || b.issuedDate || Date.now()).getTime();
                return dateB - dateA;
            });

            setLicenses(combined);
        } catch (e) {
            console.error("Failed to load licenses", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { loadLicenses(); }, [user]);

    const onRefresh = () => { setRefreshing(true); loadLicenses(); };

    const renderItem = ({ item }: { item: any }) => {
        const isRequest = item.status === 'pending' || item.status === 'rejected';
        
        // Minted license logic
        let statusColor = '#ff4103'; // Active
        let statusText = 'ACTIVE';
        let icon = <FileBadge size={24} color={statusColor} />;

        if (item.status === 1) { // generic suspended
            statusColor = '#F59E0B'; statusText = 'SUSPENDED';
        } else if (item.status === 2) { // generic revoked
            statusColor = '#EF4444'; statusText = 'REVOKED';
        }

        // Request logic
        if (isRequest || item.status === 'approved') {
            if (item.status === 'pending') {
                statusColor = '#F59E0B'; statusText = 'PENDING';
                icon = <Clock size={24} color={statusColor} />;
            } else if (item.status === 'rejected') {
                statusColor = '#EF4444'; statusText = 'REJECTED';
                icon = <XCircle size={24} color={statusColor} />;
            } else if (item.status === 'approved') {
                statusColor = '#ff4103'; statusText = 'APPROVED';
                icon = <FileBadge size={24} color={statusColor} />;
            }
        } else if (item.statusString) { // fallback to string from blockchain
             statusText = item.statusString;
        }

        return (
            <TouchableOpacity 
                style={styles.card}
                onPress={() => {
                    if (isRequest && item.status !== 'approved') return;
                    
                    // If it's an approved request (not from blockchain), map it so Detail screen understands it
                    const dataToPass = item.status === 'approved' ? {
                        ...item,
                        status: 0,
                        statusString: 'Active',
                        issueDate: item.createdAt || Date.now(),
                        expiryDate: item.expiryDate || Date.now(),
                        issuerAddress: 'Pending On-Chain Sync'
                    } : item;

                    navigation.navigate('LicenseDetail', { licenseData: dataToPass, licenseId: item.licenseId });
                }}
                activeOpacity={(isRequest && item.status !== 'approved') ? 1 : 0.85}
            >
                <View style={styles.cardInner}>
                    <View style={[styles.cardIconBox, { borderColor: statusColor + '30' }]}>
                        {icon}
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{item.licenseType} {isRequest ? 'Request' : 'License'}</Text>
                        <Text style={styles.cardSubtitle}>
                            ID: {item.licenseId || (isRequest ? 'Pending generation' : 'N/A')}
                        </Text>
                        <Text style={styles.cardDate}>
                            {isRequest 
                                ? `Requested: ${new Date(item.createdAt).toLocaleDateString()}` 
                                : `Expires: ${
                                    item.expiryDate && !isNaN(new Date(item.expiryDate).getTime())
                                        ? new Date(item.expiryDate).toLocaleDateString()
                                        : 'No expiry date'
                                }`
                            }
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '15', borderColor: statusColor + '30' }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {statusText}
                        </Text>
                    </View>
                    {(!isRequest || item.status === 'approved') && <ChevronRight size={18} color="#475569" style={{ marginLeft: 6 }} />}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <LinearGradient colors={['#001621', '#011e2d']} style={StyleSheet.absoluteFill} />
                <ActivityIndicator size="large" color="#ff4103" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#001621', '#011e2d']} style={StyleSheet.absoluteFill} />
            
           {/* Header*/}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ChevronLeft size={24} color="#94A3B8" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Licenses</Text>
                <View style={{ width: 40 }} />
            </View>  
            {licenses.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <FileBadge size={64} color="#334155" />
                    <Text style={styles.emptyText}>No licenses found</Text>
                    <Text style={styles.emptySubtext}>When your business registers a license, it will appear here.</Text>
                </View>
            ) : (
                <FlatList
                    data={licenses}
                    keyExtractor={(item, index) => item.licenseId || item._id || index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ff4103']} tintColor="#ff4103" />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    },
    backButton: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#F1F5F9' },
    listContainer: { padding: 20 },
    card: {
        borderRadius: 18, marginBottom: 12, overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    cardInner: {
        flexDirection: 'row', alignItems: 'center', padding: 16,
    },
    cardIconBox: {
        width: 48, height: 48, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.04)',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 14, borderWidth: 1,
    },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: '#E2E8F0', marginBottom: 3 },
    cardSubtitle: { fontSize: 12, color: '#64748B', marginBottom: 2 },
    cardDate: { fontSize: 11, color: '#475569' },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 12, borderWidth: 1,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
    statusText: { fontSize: 11, fontWeight: '700' },
    emptyContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40,
    },
    emptyText: { fontSize: 20, fontWeight: '800', color: '#475569', marginTop: 16, marginBottom: 8 },
    emptySubtext: { fontSize: 14, color: '#334155', textAlign: 'center' },
});

export default MyLicensesScreen;
