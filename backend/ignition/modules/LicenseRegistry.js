import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("LicenseRegistryModule", (m) => {
    const licenseRegistry = m.contract("LicenseRegistry");

    return { licenseRegistry };
});