const webDriver = require("selenium-webdriver");
const TestHelper = require('./test-helper.js');

const browser = TestHelper.getBrowser();

beforeEach(async () => {
    await TestHelper.ensureLoggedOut(browser);
});

test('is logged in if cookie is present', async () => {

    const emailField = await browser.findElement(webDriver.By.id("email-input"));
    const pwField = await browser.findElement(webDriver.By.id("password-input"));

    await emailField.sendKeys("test.user@example.com");
    await pwField.sendKeys("password");

    await browser.findElement(webDriver.By.id("login-button"))
        .click();

    let loggedInBox = browser.wait(webDriver.until.elementLocated(webDriver.By.id('login-status')));

    let username = await loggedInBox.getText();
    expect(username).toBe("Logged in as test.user | Log out");

    // navigate away
    browser.get("https://google.com");

    //navigate back
    browser.get("https://localhost");

    lloggedInBox = browser.wait(webDriver.until.elementLocated(webDriver.By.id('login-status')));

    username = await loggedInBox.getText();
    expect(username).toBe("Logged in as test.user | Log out");

});

test('is not logged in if cookie is not present', async () => {

    await TestHelper.ensureLoggedOut(browser);

    browser.get("https://localhost");

    const emailInput = browser.wait(webDriver.until.elementLocated(webDriver.By.id('email-input')));

    expect(await emailInput.isDisplayed()).toBe(true);

});

test('can get error message on failed login', async () => {

    browser.get("https://localhost");

    await browser.findElement(webDriver.By.id("login-button"))
        .click();

    const errorAlert = await browser.findElement(webDriver.By.id("login-error"));

    await browser.wait(() => {
        return errorAlert.getText().then((text) => {
            return text === "Your email address or password is incorrect.";
        });
    });

    const errorMessage = await errorAlert.getText();
    expect(errorMessage).toBe("Your email address or password is incorrect.");

});

test('can login without redirect', async () => {

    const emailField = await browser.findElement(webDriver.By.id("email-input"));
    const pwField = await browser.findElement(webDriver.By.id("password-input"));

    await emailField.sendKeys("test.user@example.com");
    await pwField.sendKeys("password");

    await browser.findElement(webDriver.By.id("login-button"))
        .click();

    const loggedInBox = browser.wait(webDriver.until.elementLocated(webDriver.By.id('login-status')));

    const username = await loggedInBox.getText();
    expect(username).toBe("Logged in as test.user | Log out");

});

test('can login with redirect', async () => {

    browser.get("https://localhost?redirectTo=http://nonsense");

    const emailField = await browser.findElement(webDriver.By.id("email-input"));
    const pwField = await browser.findElement(webDriver.By.id("password-input"));

    await emailField.sendKeys("test.user@example.com");
    await pwField.sendKeys("password");

    await browser.findElement(webDriver.By.id("login-button"))
        .click();

    const loggedInBox = browser.wait(webDriver.until.elementLocated(webDriver.By.id('login-status')));

    await browser.wait(() => {
        return browser.getCurrentUrl().then((url) => {
            return url === "http://nonsense/";
        });
    });

    expect(await browser.getCurrentUrl()).toBe("http://nonsense/");
});
