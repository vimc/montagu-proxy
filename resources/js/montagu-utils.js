class MontaguUtils {
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
                urlParams[key] = decodeURI(value);
                return urlParams;
            }, {})[param];
    }
}

if (typeof module !== 'undefined') module.exports = MontaguUtils;