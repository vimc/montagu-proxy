const MontaguUtils = require("../resources/js/montagu-utils.js")

test('can retrieve query parameter', () => {

    let paramName = "redirectTo";
    let result = MontaguUtils.paramFromQueryString("?redirectTo=somewhere", paramName);
    expect(result).toBe("somewhere");

    result = MontaguUtils.paramFromQueryString("?q1=whatever&redirectTo=somewhere", paramName);
    expect(result).toBe("somewhere");

    result = MontaguUtils.paramFromQueryString("?redirectTo=somewhere&q2=5678", paramName);
    expect(result).toBe("somewhere");

    result = MontaguUtils.paramFromQueryString("redirectTo=somewhere", paramName);
    expect(result).toBe("somewhere");

    result = MontaguUtils.paramFromQueryString("?random=somewhere", paramName);
    expect(!result).toBe(true);

    result = MontaguUtils.paramFromQueryString("?", paramName);
    expect(!result).toBe(true);

    result = MontaguUtils.paramFromQueryString("", paramName);
    expect(!result).toBe(true);

    result = MontaguUtils.paramFromQueryString(null, paramName);
    expect(!result).toBe(true);

    result = MontaguUtils.paramFromQueryString("redirectTo=someone@somewhere.com", paramName);
    expect(result).toBe("someone@somewhere.com");

    //test can uri decode
    result = MontaguUtils.paramFromQueryString("redirectTo=h%40llo%26goodbye%2F", paramName);
    expect(result).toBe("h@llo&goodbye/");

});