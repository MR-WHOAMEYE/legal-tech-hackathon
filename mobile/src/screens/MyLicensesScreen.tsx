import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { fetchBusinessLicensesSmart } from '../services/offline';
import { FileBadge, ChevronRight } from 'lucide-react-native';

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

    useEffect(() => {
        loadLicenses();
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        loadLicenses();
    };

    const renderItem = ({ item }: { item: any }) => {
        const isActive = item.status === 0;

        return (
            <TouchableOpacity 
                style={styles.card}
                onPress={() => navigation.navigate('LicenseDetail', { licenseData: item })}
            >
                <View style={styles.cardIcon}>
                    <FileBadge size={28} color={isActive ? '#10B981' : '#EF4444'} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.licenseType} License</Text>
                    <Text style={styles.cardSubtitle}>ID: {item.licenseId}</Text>
                    <Text style={styles.cardDate}>Expires: {new Date(item.expiryDate).toLocaleDateString()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: isActive ? '#D1FAE5' : '#FEE2E2' }]}>
                    <Text style={[styles.statusText, { color: isActive ? '#10B981' : '#EF4444' }]}>
                        {item.statusString}
                    </Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {licenses.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <FileBadge size={64} color="#D1D5DB" />
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
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    cardIcon: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 2,
    },
    cardDate: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    }
});

export default MyLicensesScreen;
