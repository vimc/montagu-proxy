class MontaguUtils {

    static getApiRoot() {
        return "/api/v1/";
    }

    static getPackitApiRoot() {
        return "/packit/api/";
    }

    static isPackitUrl(url) {
        const fullUrl = new URL(url, window.location.origin);
        return fullUrl.pathname.toLowerCase().startsWith("/packit");
    }

    static paramFromQueryString(queryString, param) {

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
    }
}

if (typeof module !== 'undefined') module.exports = MontaguUtils;