import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MyLicensesScreen from './src/screens/MyLicensesScreen';
import RegisterLicenseScreen from './src/screens/RegisterLicenseScreen';
import ScanScreen from './src/screens/ScanScreen';
import LicenseDetailScreen from './src/screens/LicenseDetailScreen';
import SearchLicenseScreen from './src/screens/SearchLicenseScreen';

import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { token, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!token ? (
                    // Auth Stack
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    // App Stack
                    <>
                        <Stack.Screen name="Dashboard" component={DashboardScreen} />
                        <Stack.Screen name="MyLicenses" component={MyLicensesScreen} options={{ headerShown: true, title: 'My Licenses' }} />
                        <Stack.Screen name="RegisterLicense" component={RegisterLicenseScreen} options={{ headerShown: true, title: 'Register License' }} />
                        <Stack.Screen name="Scan" component={ScanScreen} />
                        <Stack.Screen name="SearchLicense" component={SearchLicenseScreen} />
                        <Stack.Screen name="LicenseDetail" component={LicenseDetailScreen} />
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
        </AuthProvider>
    );
}
