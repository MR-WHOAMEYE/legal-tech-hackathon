import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { X, ScanLine } from 'lucide-react-native';

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
        // Assuming the QR code contains just the licenseId, or JSON payload like { "licenseId": "GST-123" }
        try {
            const parsed = JSON.parse(data);
            if (parsed.licenseId) {
                navigation.navigate('LicenseDetail', { licenseId: parsed.licenseId });
            } else {
                throw new Error();
            }
        } catch (e) {
            // fallback if it's just raw string ID
            navigation.navigate('LicenseDetail', { licenseId: data });
        }
    };

    if (hasPermission === null) {
        return <View style={styles.container}><Text>Requesting for camera permission...</Text></View>;
    }
    if (hasPermission === false) {
        return <View style={styles.container}><Text>No access to camera. Please enable in settings.</Text></View>;
    }

    return (
        <View style={styles.container}>
            <CameraView 
                style={StyleSheet.absoluteFillObject}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />

            <View style={styles.overlay}>
                <View style={styles.overlayTop}>
                    <Text style={styles.instructions}>Align QR code within the frame to verify license</Text>
                </View>
                
                <View style={styles.overlayMiddle}>
                    <View style={styles.overlaySide} />
                    <View style={styles.scanFrame}>
                        <ScanLine size={64} color="#10B981" style={styles.scanIcon} />
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                    <View style={styles.overlaySide} />
                </View>
                
                <View style={styles.overlayBottom}>
                    {scanned && (
                        <TouchableOpacity 
                            style={styles.rescanButton} 
                            onPress={() => setScanned(false)}
                        >
                            <Text style={styles.rescanText}>Tap to Scan Again</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => navigation.goBack()}
            >
                <X color="#FFFFFF" size={24} />
            </TouchableOpacity>
        </View>
    );
};

const frameSize = width * 0.7;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayTop: {
        flex: 1,
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 40,
    },
    instructions: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    overlayMiddle: {
        flexDirection: 'row',
    },
    overlaySide: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    scanFrame: {
        width: frameSize,
        height: frameSize,
        backgroundColor: 'transparent',
    },
    scanIcon: {
        position: 'absolute',
        top: frameSize / 2 - 32,
        left: frameSize / 2 - 32,
        opacity: 0.5,
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#10B981',
    },
    topLeft: {
        top: 0, left: 0,
        borderTopWidth: 4, borderLeftWidth: 4,
    },
    topRight: {
        top: 0, right: 0,
        borderTopWidth: 4, borderRightWidth: 4,
    },
    bottomLeft: {
        bottom: 0, left: 0,
        borderBottomWidth: 4, borderLeftWidth: 4,
    },
    bottomRight: {
        bottom: 0, right: 0,
        borderBottomWidth: 4, borderRightWidth: 4,
    },
    overlayBottom: {
        flex: 1.5,
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rescanButton: {
        backgroundColor: '#10B981',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    rescanText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default ScanScreen;
