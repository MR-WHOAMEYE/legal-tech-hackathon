import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { X, ScanLine, ShieldCheck } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ScanScreen = ({ navigation }: any) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        getCameraPermissions();
    }, []);

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        setScanned(true);
        try {
            const parsed = JSON.parse(data);
            if (parsed.licenseId) {
                navigation.navigate('LicenseDetail', { licenseId: parsed.licenseId });
            } else {
                throw new Error();
            }
        } catch (e) {
            // Check if it's a ZK proof hash (starts with 0x)
            if (data.startsWith('0x') && data.length === 66) {
                navigation.navigate('ZKResult', { 
                    result: null,
                    proofHash: data 
                });
                // Fetch the ZK result
                import('../services/api').then(({ zkApi }) => {
                    zkApi.verifyProof(data).then(res => {
                        navigation.setParams({ result: res.data });
                        navigation.navigate('ZKResult', { result: res.data });
                    }).catch(() => {
                        navigation.navigate('ZKResult', { result: { verified: false, message: 'Proof verification failed.' } });
                    });
                });
            } else {
                navigation.navigate('LicenseDetail', { licenseId: data });
            }
        }
    };

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={['#001621', '#011e2d']} style={StyleSheet.absoluteFill} />
                <Text style={styles.permissionText}>Requesting camera permission...</Text>
            </View>
        );
    }
    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={['#001621', '#011e2d']} style={StyleSheet.absoluteFill} />
                <Text style={styles.permissionText}>No access to camera. Please enable in settings.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView 
                style={StyleSheet.absoluteFillObject}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />

            <View style={styles.overlay}>
                <View style={styles.overlayTop}>
                    <View style={styles.topBar}>
                        <View style={styles.brandRow}>
                            <ShieldCheck size={20} color="#ff4103" />
                            <Text style={styles.brandText}>TrustPass Scanner</Text>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                            <X color="#FFFFFF" size={20} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.instructions}>
                        Align QR code within the frame{'\n'}to verify license on blockchain
                    </Text>
                </View>
                
                <View style={styles.overlayMiddle}>
                    <View style={styles.overlaySide} />
                    <View style={styles.scanFrame}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                    <View style={styles.overlaySide} />
                </View>
                
                <View style={styles.overlayBottom}>
                    {scanned ? (
                        <TouchableOpacity onPress={() => setScanned(false)}>
                            <LinearGradient 
                                colors={['#ff4103', '#0c4651']}
                                style={styles.rescanButton}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.rescanText}>Tap to Scan Again</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.hintText}>Supports • License QR • ZK Proof QR</Text>
                    )}
                </View>
            </View>
        </View>
    );
};

const frameSize = width * 0.7;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    permissionText: { color: '#94A3B8', fontSize: 16, textAlign: 'center' },
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    overlayTop: {
        flex: 1, width: '100%',
        backgroundColor: 'rgba(15,23,42,0.8)',
        justifyContent: 'flex-end', paddingBottom: 30,
    },
    topBar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 60, marginBottom: 20,
    },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    brandText: { color: '#F1F5F9', fontSize: 16, fontWeight: '700' },
    closeButton: {
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center',
    },
    instructions: {
        color: '#94A3B8', fontSize: 15, textAlign: 'center',
        paddingHorizontal: 32, lineHeight: 22,
    },
    overlayMiddle: { flexDirection: 'row' },
    overlaySide: { flex: 1, backgroundColor: 'rgba(15,23,42,0.8)' },
    scanFrame: {
        width: frameSize, height: frameSize, backgroundColor: 'transparent',
    },
    corner: { position: 'absolute', width: 36, height: 36 },
    topLeft: {
        top: 0, left: 0,
        borderTopWidth: 3, borderLeftWidth: 3,
        borderColor: '#ff4103', borderTopLeftRadius: 8,
    },
    topRight: {
        top: 0, right: 0,
        borderTopWidth: 3, borderRightWidth: 3,
        borderColor: '#ff4103', borderTopRightRadius: 8,
    },
    bottomLeft: {
        bottom: 0, left: 0,
        borderBottomWidth: 3, borderLeftWidth: 3,
        borderColor: '#0c4651', borderBottomLeftRadius: 8,
    },
    bottomRight: {
        bottom: 0, right: 0,
        borderBottomWidth: 3, borderRightWidth: 3,
        borderColor: '#0c4651', borderBottomRightRadius: 8,
    },
    overlayBottom: {
        flex: 1.5, width: '100%',
        backgroundColor: 'rgba(15,23,42,0.8)',
        justifyContent: 'center', alignItems: 'center',
    },
    rescanButton: {
        paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14,
    },
    rescanText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    hintText: { color: '#475569', fontSize: 13, fontWeight: '500' },
});

export default ScanScreen;
