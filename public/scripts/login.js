const setCookie = (cname, cvalue, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
function redirectTo(path){
    window.location = path;
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
                if(Data.isAdmin)
                    document.location ='/admin';
                else
                    document.location ='/';
            }
            
        }
    }
    var details = {
        'user_name': document.getElementById("username-input").value,
        'password': document.getElementById("password-input").value,
    };
    
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    xhttp.open("POST", `/login`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(formBody)
}