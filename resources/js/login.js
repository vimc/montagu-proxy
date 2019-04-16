import {paramFromQueryString} from "./montagu-utils.js"
import {getUserName, login, logout} from "./montagu-login.js";
import MontaguLoginStatus from "./components/montagu-login-status.vue.js"
import MontaguLoginForm from "./components/montagu-login-form.vue.js"

const app = new Vue({
    el: "#app",
    data: {
        username: "",
        loginError: "",
        redirectMessage: ""
    },
    methods: {
        initialise: function() {
            const data = this;
            getUserName().then(
                (username) => {
                    data.username = username
                }
            )
        },
        logout: function() {
            const data = this;
            logout().then(
                () => {
                    data.username = '';
                    data.loginError = '';
                },
                (error) => { data.username = ''; data.loginError = error }
            );
        },
        login: function(email, password) {
            const data = this;
            login(email, password).then(
                (result) => {
                    data.username = result;
                    data.loginError = '';
                    const redirectLocation = paramFromQueryString(location.search, "redirectTo");
                    if (redirectLocation) {
                        data.redirectMessage = `Redirecting you back to ${redirectLocation}.
                            If you are not automatically redirected in a few seconds please click <a href="${redirectLocation}">here</a>`;
                        window.location.href=redirectLocation
                    }
                },
                (error) => { data.username = ''; data.loginError = error; }
            );
        }
    },
    components: {
        'montagu-login-status': MontaguLoginStatus,
        'montagu-login-form': MontaguLoginForm
    }
});

app.initialise();
