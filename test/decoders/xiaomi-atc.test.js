"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const xiaomiAtc = require("../../lib/decoders/xiaomi-atc");

const SERVICE_UUID = "0000181a-0000-1000-8000-00805f9b34fb";
const BTHOME_UUID = "0000fcd2-0000-1000-8000-00805f9b34fb";

// pvvx "custom" format: 15 bytes, little-endian.
function buildPvvx({ tempRaw = 0, humidityRaw = 0, voltageRaw = 0, battery = 0 } = {}) {
  const sd = Buffer.alloc(15);
  sd.writeInt16LE(tempRaw, 6);
  sd.writeUInt16LE(humidityRaw, 8);
  sd.writeUInt16LE(voltageRaw, 10);
  sd[12] = battery;
  return sd;
}

// atc1441 format: 13 bytes, big-endian, temperature in tenths and humidity in whole percent.
function buildAtc1441({ tempTenths = 0, humidity = 0, battery = 0, voltageRaw = 0 } = {}) {
  const sd = Buffer.alloc(13);
  sd.writeInt16BE(tempTenths, 6);
  sd[8] = humidity;
  sd[9] = battery;
  sd.writeUInt16BE(voltageRaw, 10);
  return sd;
}

function adv({ name = "ATC_1A2B3C", sd, uuid = SERVICE_UUID } = {}) {
  return { name, manufacturerData: new Map(), serviceData: new Map([[uuid, sd ?? buildPvvx()]]) };
}

test("xiaomi-atc identify", async (t) => {
  await t.test("true for an ATC_XXXXXX name with pvvx service data", () => {
    assert.equal(xiaomiAtc.identify(adv()), true);
  });

  await t.test("true for an ATC_XXXXXX name with atc1441 service data", () => {
    assert.equal(xiaomiAtc.identify(adv({ sd: buildAtc1441() })), true);
  });

  await t.test("false for a name that doesn't match the ATC_ pattern", () => {
    assert.equal(xiaomiAtc.identify(adv({ name: "LYWSD03MMC" })), false);
  });

  await t.test("false when the service data is too short", () => {
    assert.equal(xiaomiAtc.identify({ name: "ATC_1A2B3C", serviceData: new Map([[SERVICE_UUID, Buffer.alloc(5)]]) }), false);
  });

  await t.test("false for a 14-byte payload, which matches neither layout", () => {
    assert.equal(xiaomiAtc.identify(adv({ sd: Buffer.alloc(14) })), false);
  });

  await t.test("false for BTHome service data, which uses a different encoding", () => {
    assert.equal(xiaomiAtc.identify(adv({ uuid: BTHOME_UUID, sd: Buffer.alloc(15) })), false);
  });
});

test("xiaomi-atc decode (pvvx)", async (t) => {
  await t.test("decodes temperature, humidity, battery voltage and strength", () => {
    const values = xiaomiAtc.decode(adv({ sd: buildPvvx({ tempRaw: 2345, humidityRaw: 4567, voltageRaw: 2980, battery: 77 }) }));
    assert.equal(Math.round(values.temp * 100) / 100, 296.6); // 273.15 + 23.45
    assert.equal(values.humidity, 0.4567);
    assert.equal(values.battVoltage, 2.98);
    assert.equal(values.battStrength, 0.77);
  });

  await t.test("decodes a negative temperature", () => {
    const values = xiaomiAtc.decode(adv({ sd: buildPvvx({ tempRaw: -150 }) }));
    assert.equal(values.temp, 271.65); // 273.15 - 1.5
  });
});

test("xiaomi-atc decode (atc1441)", async (t) => {
  await t.test("decodes the big-endian layout rather than reading it as pvvx", () => {
    const values = xiaomiAtc.decode(adv({ sd: buildAtc1441({ tempTenths: 234, humidity: 45, battery: 88, voltageRaw: 2950 }) }));
    assert.equal(Math.round(values.temp * 100) / 100, 296.55); // 273.15 + 23.4
    assert.equal(values.humidity, 0.45);
    assert.equal(values.battStrength, 0.88);
    assert.equal(values.battVoltage, 2.95);
  });

  await t.test("decodes a negative temperature", () => {
    const values = xiaomiAtc.decode(adv({ sd: buildAtc1441({ tempTenths: -15 }) }));
    assert.equal(Math.round(values.temp * 100) / 100, 271.65); // 273.15 - 1.5
  });
});
