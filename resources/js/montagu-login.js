import {getUserDetails, makeLoginRequest, makeLogoutRequest, setCookies} from "./montagu-auth.js";
import {decodeToken} from "./montagu-utils";

const TOKEN_KEY = "accessToken";

export const getUserName = () => {
    return getUserDetails().then((result) => {
        if (result.status === "success") {
            return result.data.username
        }
        else {
            return ''
        }
    }).catch(() => {
        // we're not logged in
        return ''
    });
};

export const login = (email, password) => {
    return makeLoginRequest(email, password)
        .then((data) => montaguLoginSuccess(data))
        .catch((jqXHR) => {
            throw montaguApiError(jqXHR)
        })
};

const montaguLoginSuccess = (data) => {
    const token = data.access_token;
    return setCookies(token).then(() => {
        const decodedToken = decodeToken(token);
        return decodedToken.sub;
    })
};

export const logout = () => {
    // TODO remove once local storage usage in webapps is deprecated
    // https://vimc.myjetbrains.com/youtrack/issue/VIMC-2865
    window.localStorage.setItem(TOKEN_KEY, '');
    return makeLogoutRequest()
        .catch((jqXHR) => {
            throw montaguApiError(jqXHR)
        })
};

const montaguApiError = (jqXHR) => {
    let errorText;
    if (jqXHR && jqXHR.status === 401) {
        errorText = "Your email address or password is incorrect.";
    } else {
        errorText = "An error occurred.";
    }
    return errorText;
};
