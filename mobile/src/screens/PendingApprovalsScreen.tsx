import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Platform, KeyboardAvoidingView, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { requestApi } from '../services/api';
import { ShieldCheck, ChevronLeft, Building2, UserCircle, Hash, Calendar, FileSignature, FileCheck } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const PendingApprovalsScreen = ({ navigation }: any) => {
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Approval Modal State
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [expiryDate, setExpiryDate] = useState('');
    const [licenseId, setLicenseId] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const res = await requestApi.getPending();
            setRequests(res.data.requests || []);
        } catch (e: any) {
            console.error(e);
            Alert.alert("Error", "Could not fetch pending requests.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async (id: string) => {
        Alert.alert(
            "Reject Request",
            "Are you sure you want to reject this license request?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reject",
                    style: "destructive",
                    onPress: async () => {
                        setProcessingId(id);
                        try {
                            await requestApi.reject(id);
                            fetchRequests();
                        } catch (e: any) {
                            Alert.alert("Error", "Failed to reject request.");
                        } finally {
                            setProcessingId(null);
                        }
                    }
                }
            ]
        );
    };

    const handleOpenApproveModal = (req: any) => {
        setSelectedRequest(req);
        setLicenseId(req.licenseId || ''); // If business provided one, prefill it. Else empty and Regulator must fill.
        
        // Default expiry to 1 year from today
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        setExpiryDate(nextYear.toISOString().split('T')[0]);
    };

    const submitApproval = async () => {
        if (!expiryDate || !licenseId) {
            Alert.alert("Error", "Expiry Date and License ID must be provided to approve this license.");
            return;
        }

        setProcessingId(selectedRequest._id);
        setSelectedRequest(null);
        
        try {
            const expDate = new Date(expiryDate);
            if (isNaN(expDate.getTime())) throw new Error("Invalid date");

            await requestApi.approve(selectedRequest._id, {
                expiryDate: expDate.toISOString(),
                licenseId
            });

            Alert.alert("Success", "License has been officially minted to the blockchain!");
            fetchRequests();
        } catch (e: any) {
            console.error(e);
            Alert.alert("Approval Error", e.response?.data?.error || e.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <LinearGradient colors={['#001621', '#011e2d', '#001621']} style={StyleSheet.absoluteFill} />
                <ActivityIndicator size="large" color="#0c4651" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#001621', '#011e2d', '#001621']} style={StyleSheet.absoluteFill} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ChevronLeft size={24} color="#94A3B8" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.iconCircle}>
                        <ShieldCheck size={32} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={styles.title}>Pending Approvals</Text>
                    <Text style={styles.subtitle}>Review & Mint Business Licenses</Text>
                </View>

                {requests.length === 0 ? (
                    <View style={styles.emptyState}>
                        <FileCheck size={48} color="rgba(255,255,255,0.1)" />
                        <Text style={styles.emptyText}>No pending requests right now.</Text>
                    </View>
                ) : (
                    requests.map(req => (
                        <View key={req._id} style={styles.requestCard}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.businessName}>{req.businessName}</Text>
                                    <View style={styles.typeBadge}>
                                        <Text style={styles.typeText}>{req.licenseType}</Text>
                                    </View>
                                </View>
                                <Text style={styles.dateText}>
                                    {new Date(req.createdAt).toLocaleDateString()}
                                </Text>
                            </View>

                            <View style={styles.detailsBox}>
                                <View style={styles.detailRow}>
                                    <UserCircle size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                                    <Text style={styles.detailLabel}>Wallet:</Text>
                                    <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">
                                        {req.walletAddress}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Hash size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                                    <Text style={styles.detailLabel}>Req ID:</Text>
                                    <Text style={styles.detailValue}>
                                        {req.licenseId ? req.licenseId : 'Not Provided'}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <FileCheck size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                                    <Text style={styles.detailLabel}>Doc Hash:</Text>
                                    <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">
                                        {req.documentHash}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.actionRow}>
                                <TouchableOpacity 
                                    style={[styles.btnAction, { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }]}
                                    onPress={() => handleReject(req._id)}
                                    disabled={processingId !== null}
                                >
                                    <Text style={[styles.btnText, { color: '#EF4444' }]}>Reject</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.btnAction, { backgroundColor: '#A855F7', borderColor: '#A855F7' }]}
                                    onPress={() => handleOpenApproveModal(req)}
                                    disabled={processingId !== null}
                                >
                                    {processingId === req._id ? (
                                        <ActivityIndicator color="#FFFFFF" size="small" />
                                    ) : (
                                        <Text style={[styles.btnText, { color: '#FFFFFF' }]}>Review & Approve</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Approve Modal */}
            <Modal visible={selectedRequest !== null} transparent={true} animationType="fade">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
                    {selectedRequest && (
                        <View style={styles.modalCard}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Approve & Mint License</Text>
                                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedRequest(null)}>
                                    <Text style={styles.modalCloseText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <Text style={styles.modalContextText}>
                                Approving <Text style={{ color: '#fff', fontWeight: 'bold' }}>{selectedRequest.businessName}</Text>'s request. This will permanently mint the license to the blockchain.
                            </Text>

                            <View style={styles.inputGroup}>
                                <View style={styles.inputIconBox}><Hash color="#0c4651" size={18} /></View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Assign License ID (e.g. GST-12345)"
                                    placeholderTextColor="#475569"
                                    value={licenseId}
                                    onChangeText={setLicenseId}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <View style={styles.inputIconBox}><Calendar color="#0c4651" size={18} /></View>
                                <TouchableOpacity style={{ flex: 1, justifyContent: 'center' }} onPress={() => setShowDatePicker(true)}>
                                    <Text style={[styles.input, { textAlignVertical: 'center', paddingTop: 14, color: '#E2E8F0' }]}>
                                        Expiry: {expiryDate}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={new Date(expiryDate) || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(event, date) => {
                                        setShowDatePicker(false);
                                        if (date) setExpiryDate(date.toISOString().split('T')[0]);
                                    }}
                                />
                            )}

                            <TouchableOpacity style={styles.modalConfirmBtn} onPress={submitApproval}>
                                <LinearGradient colors={['#cc3200', '#ff4103']} style={StyleSheet.absoluteFillObject} borderRadius={12} />
                                <Text style={styles.modalConfirmText}>Confirm & Mint to Blockchain</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 24, paddingTop: 60, flexGrow: 1 },
    backButton: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    header: { marginBottom: 24 },
    iconCircle: {
        width: 64, height: 64, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    title: { fontSize: 26, fontWeight: '800', color: '#F1F5F9' },
    subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
    
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
    emptyText: { color: '#64748B', fontSize: 16, marginTop: 16 },

    requestCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16, padding: 20, marginBottom: 16,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    businessName: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', marginBottom: 6 },
    typeBadge: { backgroundColor: 'rgba(168,85,247,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
    typeText: { color: '#A855F7', fontSize: 12, fontWeight: '600' },
    dateText: { color: '#64748B', fontSize: 12 },

    detailsBox: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 12, borderRadius: 12, marginBottom: 16,
    },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    detailLabel: { color: '#94A3B8', fontSize: 13, width: 70 },
    detailValue: { color: '#CBD5E1', fontSize: 13, flex: 1, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

    actionRow: { flexDirection: 'row', gap: 12 },
    btnAction: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    btnText: { fontSize: 14, fontWeight: '600' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
    modalCard: {
        backgroundColor: '#011e2d', borderRadius: 20, padding: 24,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    modalTitle: { color: '#F1F5F9', fontSize: 20, fontWeight: '700' },
    modalCloseBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    modalCloseText: { color: '#94A3B8', fontSize: 14, fontWeight: 'bold' },
    modalContextText: { color: '#94A3B8', fontSize: 14, marginBottom: 20, lineHeight: 20 },

    inputGroup: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)',
        borderWidth: 1, borderColor: 'rgba(12,70,81,0.12)',
        borderRadius: 12, marginBottom: 16, paddingHorizontal: 12, height: 52,
    },
    inputIconBox: { marginRight: 10 },
    input: { flex: 1, height: '100%', color: '#E2E8F0', fontSize: 14 },

    modalConfirmBtn: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
    modalConfirmText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default PendingApprovalsScreen;
