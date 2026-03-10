import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, PlusCircle, LayoutList, Scan, FileSearch, LogOut, CheckCircle2 } from 'lucide-react-native';

const DashboardCard = ({ title, icon, onPress, color }: { title: string, icon: any, onPress: () => void, color: string }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={[styles.cardIconBox, { backgroundColor: color + '15' }]}>
            {icon}
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
);

const DashboardScreen = ({ navigation }: any) => {
    const { user, logout } = useContext(AuthContext);

    const renderRoleContent = () => {
        if (!user) return null;

        switch (user.role) {
            case 'regulator':
                return (
                    <View style={styles.grid}>
                        <DashboardCard 
                            title="Register License" 
                            icon={<PlusCircle color="#10B981" size={32} />} 
                            onPress={() => navigation.navigate('RegisterLicense')} 
                            color="#10B981"
                        />
                        <DashboardCard 
                            title="Search Licenses" 
                            icon={<FileSearch color="#3B82F6" size={32} />} 
                            onPress={() => navigation.navigate('SearchLicense')} 
                            color="#3B82F6"
                        />
                        <DashboardCard 
                            title="Scan QR" 
                            icon={<Scan color="#8B5CF6" size={32} />} 
                            onPress={() => navigation.navigate('Scan')} 
                            color="#8B5CF6"
                        />
                    </View>
                );
            case 'business':
                return (
                    <View style={styles.grid}>
                        <DashboardCard 
                            title="My Licenses" 
                            icon={<LayoutList color="#F59E0B" size={32} />} 
                            onPress={() => navigation.navigate('MyLicenses')} 
                            color="#F59E0B"
                        />
                        <DashboardCard 
                            title="Share QR" 
                            icon={<Scan color="#3B82F6" size={32} />} 
                            onPress={() => navigation.navigate('MyLicenses')} 
                            color="#3B82F6"
                        />
                    </View>
                );
            case 'verifier':
                return (
                    <View style={styles.grid}>
                        <DashboardCard 
                            title="Scan License QR" 
                            icon={<Scan color="#8B5CF6" size={32} />} 
                            onPress={() => navigation.navigate('Scan')} 
                            color="#8B5CF6"
                        />
                        <DashboardCard 
                            title="Search by ID" 
                            icon={<FileSearch color="#3B82F6" size={32} />} 
                            onPress={() => navigation.navigate('SearchLicense')} 
                            color="#3B82F6"
                        />
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerArea}>
                <View style={styles.headerTop}>
                    <ShieldCheck size={36} color="#10B981" />
                    <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                        <LogOut size={20} color="#EF4444" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.emailText}>{user?.email}</Text>
                
                <View style={styles.roleBadge}>
                    <CheckCircle2 size={16} color="#FFFFFF" style={styles.badgeIcon} />
                    <Text style={styles.roleBadgeText}>
                        {(user?.role || "user").toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                {renderRoleContent()}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    headerArea: {
        backgroundColor: '#001621',
        padding: 24,
        paddingTop: 60,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#374151',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    logoutText: {
        color: '#FCA5A5',
        marginLeft: 6,
        fontWeight: 'bold',
        fontSize: 14,
    },
    greeting: {
        color: '#9CA3AF',
        fontSize: 16,
    },
    emailText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#3B82F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeIcon: {
        marginRight: 6,
    },
    roleBadgeText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    },
    content: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardIconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
    }
});

export default DashboardScreen;
