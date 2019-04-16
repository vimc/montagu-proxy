import {apiRoot} from "./montagu-utils.js";

export const requestResetLink = (email) => {
    const url = apiRoot + "password/request-link/?email=" + encodeURI(email);
    return $.ajax({
        type: "POST",
        url: url
    });
};

export const setPassword = (password, access_token) => {
    const url = apiRoot + "password/set/?access_token=" + encodeURI(access_token);
    const data = {password: password};
    return $.ajax({
        type: "POST",
        url: url,
        contentType: "application/json",
        data: JSON.stringify(data)
    });
};
