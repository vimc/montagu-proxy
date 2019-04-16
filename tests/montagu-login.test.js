const now = new Date();

afterEach(() => {
    jest.resetModules();
});

function getEncodedToken(username, expiry) {
    const timestamp = Math.round(expiry.getTime() / 1000);
    const token = JSON.stringify({sub: username, exp: timestamp});
    return btoa(token);
}

test('can get username from user details', (done) => {

    jest.mock("../resources/js/montagu-auth", () => ({
        getUserDetails: () => new Promise((resolve) =>
            resolve({data: {username: "test.user"}, status: "success"}))
    }));

    const {getUserName} = require("../resources/js/montagu-login");

    getUserName().then((result) => {
        expect(result).toBe('test.user');
        done();
    });

});

test('returns empty username if user details are not returned', (done) => {

    jest.mock("../resources/js/montagu-auth", () => ({
        getUserDetails: () => new Promise((resolve) =>
            resolve({data: null, status: "failure"}))
    }));

    const {getUserName} = require("../resources/js/montagu-login");

    getUserName().then((result) => {
        expect(result).toBe('');
        done();
    });
});

test('returns empty username if user details return a 401', (done) => {

    jest.mock("../resources/js/montagu-auth", () => ({
        getUserDetails: () => new Promise((resolve, reject) =>
            reject())
    }));

    const {getUserName} = require("../resources/js/montagu-login");
    const result = getUserName();

    getUserName().then((result) => {
        expect(result).toBe('');
        done();
    });
});

test('can login', (done) => {
    const mockDecode = jest.fn(x => ({sub: "test user name"}));
    const mockLogin = jest.fn(x => new Promise((resolve) => {
        resolve({"access_token": "TOKEN"});
    }));
    const mockSetCookies = jest.fn(x => new Promise((resolve) => {
        resolve();
    }));

    jest.mock("../resources/js/montagu-auth", () => ({
        makeLoginRequest: mockLogin,
        setCookies: mockSetCookies
    }));

    jest.mock("../resources/js/montagu-utils", () => ({
        decodeToken: mockDecode
    }));

    const {login} = require("../resources/js/montagu-login");

    //This returns a promise - invoking the promise will call auth login methods via further promises, here mocked to
    //resolve immediately
    login("test email", "test password").then(
        (result) => {
            expect(result).toBe("test user name");
            expect(mockDecode.mock.calls.length).toBe(1);

            expect(mockLogin.mock.calls.length).toBe(1);
            expect(mockSetCookies.mock.calls.length).toBe(1);

            done();
        },
        (error) => {
            done.fail(`login failed: ${error}`);
        }
    );

});

test('returns error message when authentication fails', (done) => {

    const mockInflate = jest.fn();
    const mockDecode = jest.fn();
    const mockLogin = jest.fn(x => new Promise((resolve, reject) => {
        reject({status: 401})
    }));
    const mockSetCookies = jest.fn(x => new Promise((resolve, reject) => {
        resolve();
    }));

    jest.mock("../resources/js/montagu-auth", () => ({
        makeLoginRequest: mockLogin,
        setCookies: mockSetCookies
    }));

    jest.mock("../resources/js/montagu-utils", () => ({
        decodeToken: mockDecode
    }));

    const {login} = require("../resources/js/montagu-login");

    //This returns a promise - invoking the promise will call auth login methods via further promises, here mocked to
    //resolve immediately
    login("test email", "test password").then(
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

            done();
        }
    );

});

test('returns error message when setCookies fails', (done) => {

    const mockDecode = jest.fn(x => ({sub: "test user name"}));
    const mockLogin = jest.fn(x => new Promise((resolve, reject) => {
        resolve({"access_token": "TOKEN"});
    }));
    const mockSetCookies = jest.fn(x => new Promise((resolve, reject) => {
        reject({status: 502})
    }));

    jest.mock("../resources/js/montagu-auth", () => ({
        makeLoginRequest: mockLogin,
        setCookies: mockSetCookies
    }));

    jest.mock("../resources/js/montagu-utils", () => ({
        decodeToken: mockDecode
    }));

    const {login} = require("../resources/js/montagu-login");

    //This returns a promise - invoking the promise will call auth login methods via further promises, here mocked to
    //resolve immediately
    login("test email", "test password").then(
        (result) => {
            done.fail(`login should have failed`);
        },
        (error) => {
            expect(error).toBe("An error occurred.");

            //Expected mocks were called or not called
            expect(mockDecode.mock.calls.length).toBe(0);

            expect(mockLogin.mock.calls.length).toBe(1);
            expect(mockSetCookies.mock.calls.length).toBe(1);

            done();
        }
    );

});

test('can logout', (done) => {

    const mockLogout = jest.fn(x => new Promise((resolve, reject) => {
        resolve();
    }));

    jest.mock("../resources/js/montagu-auth", () => ({
        makeLogoutRequest: mockLogout
    }));

    const {logout} = require("../resources/js/montagu-login");

    //This returns a promise - invoking the promise will call auth login methods via further promises, here mocked to
    //resolve immediately
    logout().then(
        () => {
            //Expected mocks were called
            expect(mockLogout.mock.calls.length).toBe(1);

            //expect empty token written to local storage
            // expect(mockSetItem.mock.calls.length).toBe(1);
            // expect(mockSetItem.mock.calls[0][0]).toBe("accessToken");
            // expect(mockSetItem.mock.calls[0][1]).toBe('');
            done();
        },
        (error) => {
            done.fail(`logout failed: ${error}`);
        }
    );

});
