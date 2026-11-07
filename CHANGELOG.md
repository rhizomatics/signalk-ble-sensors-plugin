# [1.0.2]

- SwitchBot Meter Plus: temperature was wrong when the meter's display was set to Fahrenheit (e.g. 22.7°C published as -5.2°C). The broadcast value is always Celsius; the flag only says which unit the display shows
- Xiaomi ATC: sensors using the `atc1441` advertising format were decoded with the pvvx layout and published nonsense temperatures. Both formats are now decoded, and BTHome payloads (not supported yet) are no longer misread as either

# [Unreleased]

- **Path change:** humidity is now published to `environment.<zone>.relativeHumidity`, the SignalK spec path (`humidity` is deprecated in the spec). Update any dashboard or alarm that reads `environment.<zone>.humidity`
- Zone examples in the config screen and README now follow the spec's `inside.<zone>` / `outside` layout. Existing zones are unchanged

# [1.0.1]

No code change, re-release only for automated build.

# [1.0.0]

- Package moved to [Rhizomatics](https://www.rhizomatics.org.uk/sailing/)
- Choice of outdoor pressure sensors now limited to ones that have pressure (RuuviTags all have pressure in data structure, however the waterproof Pro tags send a placeholder only).

# [0.1.4]

Improved handling of Switchbot (Woan) thermometers with rolling codes in payload
Fix missing devices in registration dropdown

# [0.1.3]

Optionally re-publish a pressure value as `environment.outside.pressure` to cope with IP68 RuuviTag Pro that doesn't capture pressure, and re-use near enough value from an indoor standard RuuviTag.

# [0.1.2]

Improve RuuviTag support, adding motion sensor and removing humidity/pressure where not supported, e.g. the 3in1 or 2in1 RuuviTag Pro models
Fix for SwitchBot (Woan) thermometers that publish payloads with MAC address prefixes
The device RSSI is added to the drop-down list, to help work out which device is which ( e.g. saloon vs deck thermometers ) or even on another boat

# [0.1.1]

Simplify sensor names, and make sure values published with SignalK units.

# [0.1.0]

First alpha release
