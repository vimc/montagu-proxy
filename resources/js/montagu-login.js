//Logic class for logging in and out of Montagu
class MontaguLogin {

    constructor(montaguAuth, packitAuth, jwt_decode, pako) {
        this.montaguAuth = montaguAuth;
        this.packitAuth = packitAuth;
        this.jwt_decode = jwt_decode;
        this.pako = pako;
    }

    getUserName() {
        return this.montaguAuth.getUserDetails().then((result) => {
            if (result.status === "success") {
                return result.data.username
            }
            else {
                return ''
            }
        }).catch(() => {
            return ''
        })
    }

    tokenHasNotExpired(decodedToken) {
        const expiry = decodedToken.exp;
        const now = new Date().getTime() / 1000; //token exp doesn't include milliseconds
        return expiry > now
    }

    async login(email, password) {
        const result = await this.montaguAuth.login(email, password)
            .then((data) => this.montaguLoginSuccess(data))
            .catch((jqXHR) => {
                throw MontaguLogin.montaguApiError(jqXHR)
            });
        // Allow possibility for Montagu login to succeed but Packit login to fail - do
        // so silently for this POC, but print to console
        await this.packitAuth.login(email, password)
            .then((data) => this.packitAuth.saveUser(data))
            .catch((jqXHR) => {
                console.log(`Packit login error: ${JSON.stringify(jqXHR)}`);
            });

        return result;    
    }

    montaguLoginSuccess(data) {
        const token = data.access_token;

        return this.montaguAuth.setCookies(token).then(
            () => {
                const decodedToken = this.decodeToken(token);
                return decodedToken.sub;
            }
        );
    }

    logout() {

        return this.montaguAuth.logout()
            .catch((jqXHR) => {
                throw MontaguLogin.montaguApiError(jqXHR)
            })
    }

    decodeToken(token) {
        const decoded = atob(token.replace(/_/g, '/').replace(/-/g, '+'));
        const inflated = this.pako.inflate(decoded, {to: 'string'});

        return this.jwt_decode(inflated);
    }

    static montaguApiError(jqXHR) {
        let errorText;
        if (jqXHR && jqXHR.status === 401) {
            errorText = "Your email address or password is incorrect.";
        } else {
            errorText = "An error occurred.";
        }
        return errorText;
    }

}

if (typeof module !== 'undefined') module.exports = MontaguLogin;