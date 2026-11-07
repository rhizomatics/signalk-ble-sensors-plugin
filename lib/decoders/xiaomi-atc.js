"use strict";

// Xiaomi LYWSD03MMC / similar running the pvvx or atc1441 custom firmware
// (https://github.com/pvvx/ATC_MiThermometer) advertises under its own name
// (ATC_XXXXXX, where XXXXXX is the last 3 MAC bytes) with a fixed-format
// 0x181A service-data payload - no encryption key or GATT connection needed,
// unlike stock Xiaomi firmware. Two layouts share that UUID, told apart by length:
//
// - pvvx "custom" (15 bytes, little-endian): mac[6] temp[i16, x0.01 degC]
//   humidity[u16, x0.01 %] voltage[u16, mV] battery[u8, %] counter[u8] flags[u8]
// - atc1441 (13 bytes, big-endian): mac[6] temp[i16, x0.1 degC] humidity[u8, %]
//   battery[u8, %] voltage[u16, mV] counter[u8]
//
// The firmware's BTHome option (UUID 0xFCD2) is a different, TLV-encoded format
// and isn't decoded here.

const NAME_PATTERN = /^ATC_[A-Fa-f0-9]{6}$/;
const SERVICE_DATA_UUID = "0000181a-0000-1000-8000-00805f9b34fb";
const PVVX_LENGTH = 15;
const ATC1441_LENGTH = 13;

function identify(adv) {
  if (!NAME_PATTERN.test(adv.name)) return false;
  const sd = adv.serviceData.get(SERVICE_DATA_UUID);
  return !!sd && (sd.length === ATC1441_LENGTH || sd.length >= PVVX_LENGTH);
}

function decodePvvx(sd) {
  return {
    temp: 273.15 + sd.readInt16LE(6) / 100,
    humidity: sd.readUInt16LE(8) / 10000,
    battVoltage: sd.readUInt16LE(10) / 1000,
    battStrength: sd.readUInt8(12) / 100,
  };
}

function decodeAtc1441(sd) {
  return {
    temp: 273.15 + sd.readInt16BE(6) / 10,
    humidity: sd.readUInt8(8) / 100,
    battStrength: sd.readUInt8(9) / 100,
    battVoltage: sd.readUInt16BE(10) / 1000,
  };
}

function decode(adv) {
  const sd = adv.serviceData.get(SERVICE_DATA_UUID);
  return sd.length >= PVVX_LENGTH ? decodePvvx(sd) : decodeAtc1441(sd);
}

module.exports = {
  id: "xiaomi-atc",
  name: "Xiaomi (ATC/pvvx custom firmware)",
  domain: "environmental",
  identify,
  decode,
};
