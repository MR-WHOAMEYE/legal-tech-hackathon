import NetInfo from '@react-native-community/netinfo';
import { cacheLicense, getCachedLicense, getAllCachedLicenses } from '../database/db';
import { licenseApi } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const isOnline = async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    return !!state.isConnected && !!state.isInternetReachable;
};

// Listen for connection changes
export const startOfflineSyncListener = () => {
    return NetInfo.addEventListener(state => {
        if (state.isConnected && state.isInternetReachable) {
            console.log('Back online. You can sync here if needed.');
            // Example: syncPendingOperations();
        }
    });
};

// A smart fetch function that uses cache if offline, or fetches and caches if online
export const fetchLicenseSmart = async (licenseId: string) => {
    const online = await isOnline();
    console.log(`Network status: ${online ? 'Online' : 'Offline'}, License ID: ${licenseId}`);
    
    if (online) {
        try {
            console.log(`Fetching license ${licenseId} from blockchain...`);
            const res = await licenseApi.verify(licenseId);
            const data = res.data.license;
            console.log(`License found: ${data.businessName} (${data.licenseType})`);
            // cache it
            await cacheLicense(data);
            return data;
        } catch (e: any) {
            console.error(`Error fetching license ${licenseId}:`, e.message || e);
            if (e.response && e.response.status === 404) {
               throw new Error("License not found on blockchain");
            }
            if (e.response && e.response.status === 500) {
               throw new Error("Blockchain server error - check if Hardhat is running");
            }
            if (e.code === 'ECONNREFUSED' || e.code === 'ERR_NETWORK') {
               throw new Error("Cannot connect to backend server - check if server is running on port 3001");
            }
            console.error("Error fetching online, checking cache...", e);
        }
    }
    
    // Offline or failed to fetch
    console.log(`Checking cache for license ${licenseId}...`);
    const cached = await getCachedLicense(licenseId);
    if (cached) {
        console.log(`Found license ${licenseId} in cache`);
        return cached;
    }
    console.log(`License ${licenseId} not found in cache`);
    throw new Error(online ? "Network issue and not found in cache." : "Offline and license not cached.");
};

export const fetchBusinessLicensesSmart = async (address: string) => {
    const online = await isOnline();
    if (online) {
        try {
            const res = await licenseApi.getByHolder(address);
            const licenses = res.data.licenses;
            for (const lic of licenses) {
                await cacheLicense(lic);
            }
            return licenses;
        } catch (e) {
            console.error("Error fetching business licenses online", e);
        }
    }

    // Try reading all cached if offline
    console.warn("Offline - showing all cached licenses; might not be filtered by business if your DB doesn't support it strictly.");
    const all = await getAllCachedLicenses();
    // filter roughly by holderAddress if it matches (case insensitive check)
    return all.filter((l: any) => l.holderAddress.toLowerCase() === address.toLowerCase());
};
