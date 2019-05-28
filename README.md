# Montagu reverse proxy
A reverse proxy for Montagu. This allows us to expose a single port (443) and 
map different paths to different apps (containers).

## SSL configuration files
`nginx.montagu.conf` contains references to an SSL certificate, an SSL private key, and a DHE parameter, which it 
expects at `/etc/montagu/proxy/certificate.pem`, `/etc/montagu/proxy/ssl_key.pem` and 
`/etc/montagu/proxy/dhparam.pem`, respectively. SSL public certificates are stored
in the [montagu repository](https://github.com/vimc/montagu/tree/master/certs), the SSL private key and DHE parameter
files are stored in the vault and all 3 are copied into the running proxy container during deployment.

Secrets are stored in the vault at:

```
vault list secret/ssl/v2/support/key
```
and

```
vault list secret/ssl/v2/support/dhparam
```

### Generating new DHE parameters
The DHE parameter files in the vault were generated by running `openssl dhparam -out workspace/dhparam.pem 4096`

## Build and run locally
Run `./scripts/dev.sh`. This runs up the proxy along with the apis and portals, in order to manually test links, logins etc. 
The test user with email `test.user@example.com` and password `password` is added by default.
Optionally include 'data' parameter (`./scripts/dev.sh data`) to include generating Montagu/Orderly test data.

## Testing
Run unit tests with `npm run test`. Jest will pick up test in files with the `.test.js` extension.

To run integration tests:
 
1. First install chromedriver `./scripts/install-chromedriver.sh`
1. Make sure you also have a compatible version of chrome (71-75)
1. Run the proxy and dependencies with `./scripts/dev.sh`
1. Then run tests with `npm run integration-test`

Jest will pick up tests in files with the `.itest.js` extension.

## Teamcity
1. `./scripts/make-build-env.sh`: makes a shared base image containing all npm dependencies, the main build env image
 which also runs the unit tests, and the integration tests image which contains all selenium test depenedencies
1. `./scripts/run-build.sh`: runs the build env image from the previous step which dockerises and pushes the app image 
to our registry
1. `./scripts/run-integration-tests.sh`: runs the app image created in the previous step along with all dependencies and 
then runs the integration tests image created in step 1.
1. `./dev/run-build-minimal.sh`: builds an image `montagu-reverse-proxy-minimal` that just provides login functionality.
 This is used for testing OrderlyWeb login integration without having to run an entire Montagu deployment.
