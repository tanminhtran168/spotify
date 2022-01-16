document.getElementById("login-submit").onclick = function () {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            //window.location = "/";
            alert(this.responseText);
        }
    }
    xhttp.open("POST", `/user/login`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(`user_name=${document.getElementById("username-input").value}&password=${document.getElementById("password-input").value}`);
    console.log(`username=${document.getElementById("username-input").value}&password=${document.getElementById("password-input").value}`);
}