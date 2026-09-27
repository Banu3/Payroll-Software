/**
 * attendanceDeviceProvider.js
 * Biometric integration architecture foundation.
 * Abstract interface with implementation adapters for biometric vendors (e.g. ZKTeco, Matrix, Essl, HID).
 */

export class AttendanceDeviceProvider {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.vendor = config.vendor;
    this.ipAddress = config.ip_address;
    this.port = config.port || 4370;
    this.status = config.status || 'OFFLINE';
    this.isConnected = false;
  }

  async connect() {
    // Abstract connection handling
    this.isConnected = true;
    this.status = 'ONLINE';
    return { success: true, message: `Connected to ${this.name} (${this.vendor})` };
  }

  async syncEmployees(employees = []) {
    if (!this.isConnected) {
      await this.connect();
    }
    // Abstract device user sync logic
    return {
      success: true,
      syncedCount: employees.length,
      timestamp: new Date().toISOString(),
    };
  }

  async fetchPunches(lastSyncTime) {
    if (!this.isConnected) {
      await this.connect();
    }
    // Abstract punch log fetching logic from hardware buffer
    return {
      success: true,
      punches: [],
      lastSync: new Date().toISOString(),
    };
  }

  async syncAttendance() {
    const rawData = await this.fetchPunches();
    // Process punches into database
    return {
      success: true,
      processedRecords: rawData.punches.length,
    };
  }

  async disconnect() {
    this.isConnected = false;
    this.status = 'OFFLINE';
    return { success: true, message: `Disconnected from ${this.name}` };
  }
}
