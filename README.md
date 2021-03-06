# BIR EIS - Client to connect to BIR-EIS

A client to connect to BIR EIS API as documented in the [API Development Guide v2.01](https://eis-cert.bir.gov.ph/#/downloads/17)

The objective of this project is to be able to transmit invoices via CSV files and produce a report via CSV.

You can download the binary files in the **Release section** or use this as a module. You can also build your binaries. See [pkg module](https://www.npmjs.com/package/pkg).

**NOTE: Use this at your own risk. See [LICENSE](LICENSE)**

## Features
  * authenticate
  * send invoices
  * inquire invoices (for development)

# Quick Guide
1. Check the Releases section, and download the latest Windows binary
2. Create a file named `config.json` in the same directory as the binary. See [template below](#configjson)
3. From a terminal, run `bir-eis-client <command> [options]`
    * `command` - can be `authorize`, `send-invoices`, `inquire-invoices`
    * `options` - use `--help` to get details

<a name="configjson"></a>
# Configuration
  - **config.json**
```json
{
  "eisEndpointBaseUrl": "https://eis-cert.bir.gov.ph",
  "eisPublicKey": "...",
  "accreditationId": "...",
  "applicationId": "...",
  "applicationKeyId": "...",
  "applicationSecretKey": "...",
  "userId": "...",
  "password": "...",
  "applicationPublicKey": "...",
  "applicationPrivateKey": "...",
  "log": "info"
}
```

# Templates
- [cas_template.csv](docs/templates/cas_template.csv) - CSV template to put all your invoices in
- [cas_mapping_template.json](docs/templates/cas_mapping_template.json) - JSON mapping for the CSV input

# Contribute

Any form of contribution is welcome like develop features, test, documentation, etc. Maraming salamat!
