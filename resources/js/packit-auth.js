class PackitAuth {
    constructor(packitRoot, jwt_decode) {
        this.packitRoot = packitRoot;
        this.jwt_decode = jwt_decode;
    }

    // TODO: We should be using Authorization header here instead, like Montagu does?
    login(email, password) {
        const loginUrl = this.packitRoot + "auth/login/basic";
        return $.ajax({
            type: "POST",
            url: loginUrl,
            data: {email, password},
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    saveUser(token) {
        const decoded = this.jwt_decode(token);
        const user = {
            token,
            exp: decoded.exp ?? 0,
            displayName: decoded.displayName ?? "",
            userName: decoded.userName ?? ""
        };
        localStorage.setItem("user", JSON.stringify(user));
    }
}