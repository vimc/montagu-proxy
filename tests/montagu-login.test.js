const MontaguLogin = require("../resources/js/montagu-login.js");

const now = new Date();

function getEncodedToken(username, expiry) {
    const timestamp = Math.round(expiry.getTime() / 1000);
    const token = JSON.stringify({sub: username, exp: timestamp});
    return btoa(token);
}

test('can create MontaguLogin', () => {
    const sut = new MontaguLogin();
});

test('can write token to local storage', () => {
    const mockSetItem = jest.fn();
    const sut = new MontaguLogin(null, {setItem: mockSetItem});

    sut.writeTokenToLocalStorage("testtoken");

    expect(mockSetItem.mock.calls.length).toBe(1);
    expect(mockSetItem.mock.calls[0][0]).toBe("accessToken");
    expect(mockSetItem.mock.calls[0][1]).toBe("testtoken");
});

test('can decode jwt token', () => {
    const toDecode = "test_-";
    const mockInflate = jest.fn(x => x + "inflated");
    const mockDecode = jest.fn(x => x + "decoded");

    const sut = new MontaguLogin(null, null, mockDecode, {inflate: mockInflate});
    const result = sut.decodeToken(toDecode);

    const expected = atob("test/+") + "inflateddecoded";
    expect(result).toBe(expected);
});

test('can get user name from successful result', (done) => {
    const mockGetDetails = jest.fn(() => new Promise(resolve => resolve({
        data: {username: "test.user"},
        status: "success"
    })));

    const sut = new MontaguLogin({getUserDetails: mockGetDetails}, null, null, null);
    const result = sut.getUserName();

    sut.getUserName().then((result) => {
        expect(result).toBe('test.user');
        done();
    });
});

test('user name is empty from failed result', (done) => {
    const mockGetDetails = jest.fn(() => new Promise(resolve => resolve({
        data: null,
        status: "failure"
    })));

    const sut = new MontaguLogin({getUserDetails: mockGetDetails}, null, null, null);

    sut.getUserName().then((result) => {
        expect(result).toBe('');
        done();
    });

});

test('user name is empty if getUserDetails fails', (done) => {
    const mockGetDetails = jest.fn(() => new Promise((resolve, reject) => reject()));

    const sut = new MontaguLogin({getUserDetails: mockGetDetails}, null, null, null);
    const result = sut.getUserName();

    sut.getUserName().then((result) => {
        expect(result).toBe('');
        done();
    });
});

test('can login', (done) => {
    const encodedToken = getEncodedToken("test user name", new Date(now.getTime() + (60 * 60 * 1000)));

    const mockSetItem = jest.fn();
    const mockInflate = jest.fn(x => x);
    const mockDecode = jest.fn(x => JSON.parse(x));
    const mockLogin = jest.fn(x => new Promise((resolve, reject) => {
        resolve({"access_token": encodedToken});
    }));
    const mockSetCookies = jest.fn(x => new Promise((resolve, reject) => {
        resolve();
    }));

    const sut = new MontaguLogin({login: mockLogin, setCookies: mockSetCookies}, //mock auth
        {setItem: mockSetItem}, //mock local storage
        mockDecode, //mock jwt_decode
        {inflate: mockInflate} //mock pako
    );

    //This returns a promise - invoking the promise will call auth login methods via further promises, here mocked to
    //resolve immediately
    sut.login("test email", "test password").then(
        (result) => {
            expect(result).toBe("test user name");
            //Expected mocks were called
            expect(mockInflate.mock.calls.length).toBe(1);
            expect(mockDecode.mock.calls.length).toBe(1);

            expect(mockLogin.mock.calls.length).toBe(1);
            expect(mockSetCookies.mock.calls.length).toBe(1);

            expect(mockSetItem.mock.calls.length).toBe(1);
            expect(mockSetItem.mock.calls[0][0]).toBe("accessToken");
            expect(mockSetItem.mock.calls[0][1]).toBe(encodedToken);
            done();
        },
        (error) => {
            done.fail(`login failed: ${error}`);
        }
    );

});

test('returns error message when authentication fails', (done) => {

    const mockSetItem = jest.fn();
    const mockInflate = jest.fn();
    const mockDecode = jest.fn();
    const mockLogin = jest.fn(x => new Promise((resolve, reject) => {
        reject({status: 401})
    }));
    const mockSetCookies = jest.fn(x => new Promise((resolve, reject) => {
        resolve();
    }));

    const sut = new MontaguLogin({login: mockLogin, setCookies: mockSetCookies}, //mock auth
        {setItem: mockSetItem}, //mock local storage
        mockDecode, //mock jwt_decode
        {inflate: mockInflate} //mock pako
    );

    //This returns a promise - invoking the promise will call auth login methods via further promises, here mocked to
    //resolve immediately
    sut.login("test email", "test password").then(
        (result) => {
            done.fail(`login should have failed`);
        },
        (error) => {
            expect(error).toBe("Your email address or password is incorrect.");

            //Expected mocks were called or not called
            expect(mockInflate.mock.calls.length).toBe(0);
            expect(mockDecode.mock.calls.length).toBe(0);

            expect(mockLogin.mock.calls.length).toBe(1);
            expect(mockSetCookies.mock.calls.length).toBe(0);

            expect(mockSetItem.mock.calls.length).toBe(0);

            done();
        }
    );

});

test('returns error message when setCookies fails', (done) => {

    const encodedToken = getEncodedToken("test user name", new Date(now.getTime() + (60 * 60 * 1000)));

    const mockSetItem = jest.fn();
    const mockInflate = jest.fn(x => x);
    const mockDecode = jest.fn(x => JSON.parse(x));
    const mockLogin = jest.fn(x => new Promise((resolve, reject) => {
        resolve({"access_token": encodedToken});
    }));
    const mockSetCookies = jest.fn(x => new Promise((resolve, reject) => {
        reject({status: 502})
    }));

    const sut = new MontaguLogin({login: mockLogin, setCookies: mockSetCookies}, //mock auth
        {setItem: mockSetItem}, //mock local storage
        mockDecode, //mock jwt_decode
        {inflate: mockInflate} //mock pako
    );

    //This returns a promise - invoking the promise will call auth login methods via further promises, here mocked to
    //resolve immediately
    sut.login("test email", "test password").then(
        (result) => {
            done.fail(`login should have failed`);
        },
        (error) => {
            expect(error).toBe("An error occurred.");

            //Expected mocks were called or not called
            expect(mockInflate.mock.calls.length).toBe(0);
            expect(mockDecode.mock.calls.length).toBe(0);

            expect(mockLogin.mock.calls.length).toBe(1);
            expect(mockSetCookies.mock.calls.length).toBe(1);

            expect(mockSetItem.mock.calls.length).toBe(0);

            done();
        }
    );

});

test('can logout', (done) => {
    const mockSetItem = jest.fn();

    const mockLogout = jest.fn(x => new Promise((resolve, reject) => {
        resolve();
    }));

    const sut = new MontaguLogin({logout: mockLogout}, //mock auth
        {setItem: mockSetItem} //mock local storage
    );

    //This returns a promise - invoking the promise will call auth login methods via further promises, here mocked to
    //resolve immediately
    sut.logout().then(
        () => {
            //Expected mocks were called
            expect(mockLogout.mock.calls.length).toBe(1);

            //expect empty token written to local storage
            expect(mockSetItem.mock.calls.length).toBe(1);
            expect(mockSetItem.mock.calls[0][0]).toBe("accessToken");
            expect(mockSetItem.mock.calls[0][1]).toBe('');
            done();
        },
        (error) => {
            done.fail(`logout failed: ${error}`);
        }
    );

});
