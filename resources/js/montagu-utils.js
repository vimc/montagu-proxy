export const paramFromQueryString = (queryString, param) => {

    if (!queryString) return null;

    if (queryString[0] === "?") queryString = queryString.substring(1);

    if (!queryString) return null;

    return queryString
        .split('&')
        .map(function (keyValueString) {
            return keyValueString.split('=')
        })
        .reduce(function (urlParams, [key, value]) {
            urlParams[key] = decodeURIComponent(value);
            return urlParams;
        }, {})[param];
};

export const tokenHasNotExpired = (decodedToken) => {
    const expiry = decodedToken.exp;
    const now = new Date().getTime() / 1000; //token exp doesn't include milliseconds
    return expiry > now
};

export const decodeToken = (token) => {
    const decoded = atob(token.replace(/_/g, '/').replace(/-/g, '+'));
    const inflated = pako.inflate(decoded, {to: 'string'});

    return this.jwt_decode(inflated);
};

export const apiRoot = "/api/v1/";
