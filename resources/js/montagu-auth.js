import {apiRoot} from "./montagu-utils.js";

export const makeLoginRequest = (email, password) => {
    const loginUrl = apiRoot + "authenticate/";
    return $.ajax({
        type: "POST",
        url: loginUrl,
        data: "grant_type=client_credentials",
        headers: {
            "Authorization": "Basic " + btoa(`${email}:${password}`),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
};

export const getUserDetails = () => {
    const userUrl = apiRoot + "user/";
    return $.ajax({
        type: "GET",
        url: userUrl,
        xhrFields: {
            withCredentials: true
        }
    })
};

export const setCookies = (token) => {
    //Call set-cookies to complete login
    const setCookiesUrl = apiRoot + "set-cookies/";
    return $.ajax({
        type: "GET",
        url: setCookiesUrl,
        headers: {
            "Authorization": "Bearer " + token
        }
    });
};

export const makeLogoutRequest = () => {
    const logoutUrl = apiRoot + "logout/";
    return $.ajax({
        type: "GET",
        url: logoutUrl
    });
};