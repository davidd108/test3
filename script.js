let timeout = null;

document.addEventListener('DOMContentLoaded', function() {
    //keys de supabase
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3enJjcGh2c214cndvYm9ic2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUyNTM2MjMsImV4cCI6MjAxMDgyOTYyM30.QSo442z0B7W6rD0xP-eHkQKIN4uVmbxxI2pnflfAxmo";

    const passwordForm = document.getElementById('passwordForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const buttonSubmit = document.getElementById('buttonSubmit');

    let url = "";
    let email = "";

    //Se obtienen los parámetros hash
    const result = {};
    if (window.location.hash.split("#").length > 1) {

        window.location.hash.split("#")[1].split('&').forEach(item => {
            result[item.split('=')[0]] = decodeURIComponent(item.split('=')[1]);
        });
        
    }
    const token = result.access_token;
    try {
        var decoded = jwt_decode(token);

        url = decoded.iss;
        email = decoded.email;
    } catch (error) {
        mostrarAlerta("There was an error with the password recovery access token.");
        buttonSubmit.setAttribute("disabled", "disabled");
        passwordInput.setAttribute("readonly", "true");
        confirmPasswordInput.setAttribute("readonly", "true");
    }

    passwordForm.addEventListener('submit', function(event) {
        event.preventDefault();


        //Deshabilitar el botón en lo que termina el envio del formulario
        buttonSubmit.setAttribute("disabled", "disabled");
        passwordInput.setAttribute("readonly", "true");
        confirmPasswordInput.setAttribute("readonly", "true");


        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password.length < 6) {
            mostrarAlerta("The password must contain at least 6 characters.");
            buttonSubmit.removeAttribute("disabled");
            passwordInput.removeAttribute("readonly");
            confirmPasswordInput.removeAttribute("readonly");
            return;
        }

        if (password === confirmPassword) {

            fetch(`${url}/user`, {
                method: 'PUT',
                body: JSON.stringify({ email, password }),
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization' : 'Bearer ' + token
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.msg && data.msg.includes("expired")) {
                    mostrarAlerta("The access token has expired.");
                } else if (data.msg && data.msg.includes("different")) {
                    mostrarAlerta("The new password must be different from the old one.");
                } else if (data && data.id) {
                    mostrarAlerta("The password has been updated.");
                    passwordInput.value = "";
                    confirmPasswordInput.value = "";
                } else {
                    mostrarAlerta("There was an error updating the password.");
                }
            })
            .catch(error => {
                console.log(error);
                mostrarAlerta("There was an error updating the password. Try again later.");
            }).finally(() => {
                buttonSubmit.removeAttribute("disabled");
                passwordInput.removeAttribute("readonly");
                confirmPasswordInput.removeAttribute("readonly");
            });
        } else {
            mostrarAlerta('Passwords do not match.');
            buttonSubmit.removeAttribute("disabled");
            passwordInput.removeAttribute("readonly");
            confirmPasswordInput.removeAttribute("readonly");
        }
    });
});

function mostrarAlerta(texto) {

    clearTimeout(timeout);
    cerrarAlerta();

    const body = document.getElementById("body");

    const div = document.createElement('div');
    div.classList.add("alerta");
    div.id = "alerta";
    div.textContent = texto;

    body.append(div);

    timeout = setTimeout(() => {
        cerrarAlerta();
    }, 5000);
}

function cerrarAlerta() {
    const body = document.getElementById("alerta");
    if (body) {
        body.remove();
    }
}