import '@walletconnect/react-native-compat';
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { WalletConnectModal } from '@walletconnect/modal-react-native';

// WalletConnect Configuration
const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || '9d1aa65ee79697a2f04506a01a0e911e';
const providerMetadata = {
  name: 'BizBlock (Local)',
  description: 'Local development environment for BizBlock',
  url: 'http://localhost:8081',
  icons: ['https://walletconnect.org/walletconnect-logo.png'],
  redirect: {
    native: 'trustpass://',
    universal: 'http://localhost:8081'
  }
};

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MyLicensesScreen from './src/screens/MyLicensesScreen';
import RegisterLicenseScreen from './src/screens/RegisterLicenseScreen';
import ScanScreen from './src/screens/ScanScreen';
import LicenseDetailScreen from './src/screens/LicenseDetailScreen';
import SearchLicenseScreen from './src/screens/SearchLicenseScreen';
import ZKVerifyScreen from './src/screens/ZKVerifyScreen';
import ZKResultScreen from './src/screens/ZKResultScreen';
import RequestLicenseScreen from './src/screens/RequestLicenseScreen';
import PendingApprovalsScreen from './src/screens/PendingApprovalsScreen';

import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { token, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
                <ActivityIndicator size="large" color="#06B6D4" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!token ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    <>
                        <Stack.Screen name="Dashboard" component={DashboardScreen} />
                        <Stack.Screen name="MyLicenses" component={MyLicensesScreen} options={{ headerShown: false, title: 'My Licenses' }} />
                        <Stack.Screen name="RegisterLicense" component={RegisterLicenseScreen} options={{ headerShown: false, title: 'Issue License' }} />
                        <Stack.Screen name="RequestLicense" component={RequestLicenseScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="PendingApprovals" component={PendingApprovalsScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Scan" component={ScanScreen} />
                        <Stack.Screen name="SearchLicense" component={SearchLicenseScreen} />
                        <Stack.Screen name="LicenseDetail" component={LicenseDetailScreen} />
                        <Stack.Screen name="ZKVerify" component={ZKVerifyScreen} />
                        <Stack.Screen name="ZKResult" component={ZKResultScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <AppNavigator />
            <WalletConnectModal
              projectId={projectId}
              providerMetadata={providerMetadata}
            />
        </AuthProvider>
    );
}
