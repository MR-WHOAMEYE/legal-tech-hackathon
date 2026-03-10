import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { fetchBusinessLicensesSmart } from '../services/offline';
import { FileBadge, ChevronRight, ChevronLeft } from 'lucide-react-native';

const MyLicensesScreen = ({ navigation }: any) => {
    const { user } = useContext(AuthContext);
    const [licenses, setLicenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadLicenses = async () => {
        if (!user || !user.walletAddress) return;
        try {
            const data = await fetchBusinessLicensesSmart(user.walletAddress);
            setLicenses(data || []);
        } catch (e) {
            console.error("Failed to load licenses", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { loadLicenses(); }, [user]);

    const onRefresh = () => { setRefreshing(true); loadLicenses(); };

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        const isActive = item.status === 0;
        const statusColor = isActive ? '#10B981' : '#EF4444';

        return (
            <TouchableOpacity 
                style={styles.card}
                onPress={() => navigation.navigate('LicenseDetail', { licenseData: item })}
                activeOpacity={0.85}
            >
                <View style={styles.cardInner}>
                    <View style={[styles.cardIconBox, { borderColor: statusColor + '30' }]}>
                        <FileBadge size={24} color={statusColor} />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{item.licenseType} License</Text>
                        <Text style={styles.cardSubtitle}>ID: {item.licenseId}</Text>
                        <Text style={styles.cardDate}>Expires: {new Date(item.expiryDate).toLocaleDateString()}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '15', borderColor: statusColor + '30' }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {item.statusString}
                        </Text>
                    </View>
                    <ChevronRight size={18} color="#475569" style={{ marginLeft: 6 }} />
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
                <ActivityIndicator size="large" color="#06B6D4" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
            
            {/* Header */}
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
                    keyExtractor={(item) => item.licenseId}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#06B6D4']} tintColor="#06B6D4" />
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
