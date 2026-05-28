// ΒΙΒΛΙΟΘΗΚΗ ΠΡΟΦΙΛ ΤΑΞΙΜΕΤΡΩΝ
export const taximeterProfiles = {
    generic: {
        serviceUUID: '0000180f-0000-1000-8000-00805f9b34fb', // Δοκιμαστικό Battery Service UUID
        charUUID: '00002a19-0000-1000-8000-00805f9b34fb',    // Δοκιμαστικό Level Char UUID
        parse: (dataView) => dataView.getUint8(0)             // Επιστρέφει ακέραιο
    },
    semitron: {
        serviceUUID: '0000fff0-0000-1000-8000-00805f9b34fb', // Placeholder (Αναμένεται από εταιρεία)
        charUUID: '0000fff1-0000-1000-8000-00805f9b34fb',    // Placeholder
        parse: (dataView) => {
            const decoder = new TextDecoder('utf-8');
            return parseFloat(decoder.decode(dataView)) || 0;
        }
    },
    ics: {
        serviceUUID: '0000ffe0-0000-1000-8000-00805f9b34fb', // Placeholder
        charUUID: '0000ffe1-0000-1000-8000-00805f9b34fb',    // Placeholder
        parse: (dataView) => (dataView.getInt32(0, true) / 100)
    },
    digitax: {
        serviceUUID: '0000f00d-0000-1000-8000-00805f9b34fb', // Placeholder
        charUUID: '0000f00e-0000-1000-8000-00805f9b34fb',    // Placeholder
        parse: (dataView) => parseFloat(new TextDecoder('utf-8').decode(dataView)) || 0
    }
};

// ΚΥΡΙΑ ΣΥΝΑΡΤΗΣΗ ΣΥΝΔΕΣΗΣ BLE
export async function connectAndReadTaximeter(brand) {
    const profile = taximeterProfiles[brand];
    
    if (!profile) {
        throw new Error("Μη έγκυρη μάρκα ταξίμετρου.");
    }

    if (!navigator.bluetooth) {
        throw new Error("Το Web Bluetooth δεν υποστηρίζεται σε αυτή τη συσκευή/browser. Απαιτείται Android + Google Chrome.");
    }

    // Αναζήτηση συσκευής
    const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [profile.serviceUUID] }]
    });

    // Σύνδεση στο GATT
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(profile.serviceUUID);
    const characteristic = await service.getCharacteristic(profile.charUUID);
    
    // Ανάγνωση δεδομένων
    const value = await characteristic.readValue();
    return profile.parse(value);
}