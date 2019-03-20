function updateLoginView(loggedIn=false){
    $(".login").html(`
    <h3>Login</h3>
    <div>
    <input id="email-input" name="email" placeholder="Email address" type="text" value=""/>
        </div>
        <div>
        <input id="password-input" name="password" placeholder="Password" type="password" value="">
        </div>
        <button id="login-button">Log in</button>
        `
    );

    $("#login-button").click(login);
}

function login(){
    const email = $("#email-input").val();
    const password = $("#password-input").val()
    $.ajax( {
        type: "POST",
        url: "/api/v1/authenticate/",
        data: "grant_type=client_credentials",
        headers: {
            "Authorization": "Basic " + btoa(`${email}:${password}`),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        error: loginError,
        success: loginSuccess
    });
}

function loginError() {
    alert("login error");
}

function loginSuccess() {
    alert("login success");
}

$( document ).ready(function() {
    updateLoginView();
});

