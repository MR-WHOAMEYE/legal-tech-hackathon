import type * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Platform check: use expo-sqlite for mobile, web storage for web
let db: any = null;
let webStorage: { [key: string]: any } = {};

const isWeb = Platform.OS === 'web';

export const setWebItem = (key: string, value: any) => {
    if (isWeb) {
        webStorage[key] = value;
        window.localStorage.setItem(key, JSON.stringify(value));
    }
};

export const getWebItem = (key: string) => {
    if (isWeb) {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }
    return null;
};

export const initDb = async () => {
    if (isWeb) {
        // Use localStorage for web platform
        console.log("Using localStorage for web platform");
        return true;
    }

    if (db) return db;
    try {
        const SQLite = require('expo-sqlite');
        db = await SQLite.openDatabaseAsync('licenses.db');
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS licenses (
                licenseId TEXT PRIMARY KEY,
                licenseType TEXT,
                businessName TEXT,
                holderAddress TEXT,
                issuerAddress TEXT,
                issueDate TEXT,
                expiryDate TEXT,
                status INTEGER,
                statusString TEXT,
                documentHash TEXT,
                isValid INTEGER,
                lastSynced INTEGER
            );
        `);
        console.log("Database initialized");
        return db;
    } catch (e) {
        console.error("Failed to initialize database", e);
        throw e;
    }
};

export const cacheLicense = async (license: any) => {
    if (isWeb) {
        // Use localStorage for web
        try {
            webStorage[license.licenseId] = {
                ...license,
                isValid: license.isValid ? 1 : 0,
                lastSynced: Date.now()
            };
            localStorage.setItem('licenses', JSON.stringify(webStorage));
        } catch (e) {
            console.error("Failed to cache license in localStorage", e);
        }
        return;
    }

    const database = await initDb();
    try {
        await database.runAsync(
            `INSERT OR REPLACE INTO licenses 
             (licenseId, licenseType, businessName, holderAddress, issuerAddress, issueDate, expiryDate, status, statusString, documentHash, isValid, lastSynced) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                license.licenseId,
                license.licenseType,
                license.businessName,
                license.holderAddress,
                license.issuerAddress,
                license.issueDate,
                license.expiryDate,
                license.status,
                license.statusString,
                license.documentHash,
                license.isValid ? 1 : 0,
                Date.now()
            ]
        );
    } catch (e) {
        console.error("Failed to cache license", e);
    }
};

export const getCachedLicense = async (licenseId: string) => {
    if (isWeb) {
        // Use localStorage for web
        try {
            const stored = localStorage.getItem('licenses');
            if (stored) {
                webStorage = JSON.parse(stored);
                const license = webStorage[licenseId];
                if (license) {
                    return {
                        ...license,
                        isValid: license.isValid === 1
                    };
                }
            }
        } catch (e) {
            console.error("Failed to get cached license from localStorage", e);
        }
        return null;
    }

    const database = await initDb();
    try {
        const result = await database.getFirstAsync(`SELECT * FROM licenses WHERE licenseId = ?`, [licenseId]);
        if (result) {
            return {
                ...result,
                isValid: (result as any).isValid === 1
            };
        }
        return null;
    } catch (e) {
        console.error("Failed to get cached license", e);
        return null;
    }
};

export const getAllCachedLicenses = async () => {
    if (isWeb) {
        // Use localStorage for web
        try {
            const stored = localStorage.getItem('licenses');
            if (stored) {
                webStorage = JSON.parse(stored);
                const licenses = Object.values(webStorage);
                return licenses.map((r: any) => ({ ...r, isValid: r.isValid === 1 }))
                    .sort((a: any, b: any) => b.lastSynced - a.lastSynced);
            }
        } catch (e) {
            console.error("Failed to get all cached licenses from localStorage", e);
        }
        return [];
    }

    const database = await initDb();
    try {
        const results = await database.getAllAsync(`SELECT * FROM licenses ORDER BY lastSynced DESC`);
        return results.map((r: any) => ({ ...r, isValid: r.isValid === 1 }));
    } catch (e) {
        console.error("Failed to get all cached licenses", e);
        return [];
    }
};

export const clearCachedLicenses = async () => {
    if (isWeb) {
        webStorage = {};
        localStorage.removeItem('licenses');
        return;
    }

    const database = await initDb();
    try {
        await database.runAsync(`DELETE FROM licenses`);
    } catch (e) {
        console.error("Failed to clear cached licenses", e);
    }
};