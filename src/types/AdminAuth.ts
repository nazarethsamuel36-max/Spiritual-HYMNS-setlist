export type DeviceIdentityStatus = {
  deviceId: string;
  createdAt: number;
};

export type AdminSessionStatus = {
  expiresAt: string;
  deviceId: string;
};
