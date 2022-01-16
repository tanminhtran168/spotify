const setCookie = (cname, cvalue, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
document.getElementById("login-submit").onclick = function () {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            var Data = JSON.parse(this.responseText);
            if(this.status!=200)
            {
                alert(Data.message);
            }
            else
            {
                setCookie("token",Data.token, 2);
                document.location ='/';
            }
            
        }
    }
    xhttp.open("POST", `/user/login`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(`user_name=${document.getElementById("username-input").value}&password=${document.getElementById("password-input").value}`);
}