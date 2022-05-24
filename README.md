# BIR EIS - Client to connect to BIR-EIS

A client to connect to BIR EIS API as [documented here](https://eis-cert.bir.gov.ph/#/downloads/17)

You can download the EXE file from this project or use this as a module. You can also build your own binaries, see [pkg](https://www.npmjs.com/package/pkg)

**NOTE: Use this at your own risk. See [LICENSE](LICENSE)**

### What it can do?
* authenticate
* send invoices (not yet implemented)
* inquire result (not yet implemented)

## CLI Usage
1. Create a file named `config.json` in the same directory as the binary. See template below
2. From a terminal, run `bir-eis-client action [parameters]`
  * [action] - can be `authorize`, `invoices`, `invoice-result`

## config.json
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

