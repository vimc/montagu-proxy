import * as montaguAuth from "../../resources/js/montagu-auth";

const VueTestUtils = require("@vue/test-utils");
import * as passwordApi from "../../resources/js/montagu-password"
import * as utils from "../../resources/js/montagu-utils"

const MontaguResetPassword = require("../../resources/js/components/montagu-reset-password.vue.js");

let mockPasswordApi = jest.mock(passwordApi);
let mockUtils = jest.mock(utils);

afterEach(() => {
    mockPasswordApi.mockReset();
    mockUtils.mockReset();
});

test('renders correctly not showing acknowledgement', () => {

    const wrapper = VueTestUtils.shallowMount(MontaguResetPassword);

    expect(wrapper.find('#email-input').element.value).toBe('test@example.com');
    expect(wrapper.find('#request-button').text()).toBe('Request password reset email');
    expect(wrapper.find('#reset-password-error').text()).toBe('');

    expect(wrapper.find('#show-acknowledgement-text').exists()).toBe(false);
});

test('renders correctly showing acknowledgement', (done) => {
    const mockParamFromQueryString = jest.fn(() => "test@example.com");
    const mockRequestResetLink = jest.fn(x => new Promise(
        function (resolve, reject) {
            resolve();
        }
    ));

    mockPasswordApi = jest.mock(passwordApi, () => ({
        requestResetLink: mockRequestResetLink
    }));

    mockUtils = jest.mock(utils, () => ({
        paramFromQueryString: mockParamFromQueryString
    }));

    const wrapper = VueTestUtils.shallowMount(MontaguResetPassword);

    //Mock press submit button and success response
    wrapper.find("form").trigger("submit");

    //Expect request to have been called with email address
    expect(mockPasswordApi.requestResetLink.mock.calls.length).toBe(1);
    expect(mockPasswordApi.requestResetLink.mock.calls[0][0]).toBe("test@example.com");

    wrapper.vm.$nextTick(() => {

        expect(wrapper.find('#email-input').element.value).toBe('test@example.com');
        expect(wrapper.find('#request-button').text()).toBe('Request password reset email');
        expect(wrapper.find('#reset-password-error').text()).toBe('');

        expect(wrapper.find('#show-acknowledgement-text').exists()).toBe(true);
        expect(wrapper.find('#show-acknowledgement-text').text()).toBe("Thank you. If we have an account registered for this email address you will receive a reset password link.");

        done();
    });
});

test('renders correctly showing reset password error', (done) => {
    const mockParamFromQueryString = jest.fn(() => "test@example.com");
    const mockRequestResetLink = jest.fn(x => new Promise(
            function (resolve, reject) {
                reject();
            }
        ));
    mockPasswordApi = jest.mock(passwordApi, () => ({
        requestResetLink: mockRequestResetLink
    }));

    mockUtils = jest.mock(utils, () => ({
        paramFromQueryString: mockParamFromQueryString
    }));

    const wrapper = VueTestUtils.shallowMount(MontaguResetPassword);

    //Mock press submit button and success response
    wrapper.find("form").trigger("submit");

    wrapper.vm.$nextTick(() => {

        expect(wrapper.find('#email-input').element.value).toBe('test@example.com');
        expect(wrapper.find('#request-button').text()).toBe('Request password reset email');
        expect(wrapper.find('#reset-password-error').text()).toBe('An error occurred');

        expect(wrapper.find('#show-acknowledgement-text').exists()).toBe(false);
        done();
    });
});




