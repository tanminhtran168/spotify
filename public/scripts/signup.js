function redirectTo(path){
    window.location = path;
}

function submit_register(){
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
                document.location ='/login';
            }
            
        }
    }
    var details = {
        'user_name': document.getElementById("username-input").value,
        'email': document.getElementById("email-input").value,
        'current_password': document.getElementById("password-input").value,
        'confirm_password': document.getElementById("confirm-password-input").value,
        'full_name': document.getElementById("name-input").value,
        'phone_number': document.getElementById("phone-input").value,
        'birth_date': document.getElementById("birthdate-input").value,
        'avatar': document.getElementById("upload-file-image").files[0]
    };
    
    var formBody = new FormData();
    for (var property in details) {
        var encodedKey = property;
        var encodedValue = details[property];
        formBody.append(encodedKey, encodedValue);
    }
    xhttp.open("POST", `/signup`, true);
    xhttp.send(formBody)
}
function updatePreview(){
    document.getElementById("album-cover").setAttribute("src", URL.createObjectURL(document.getElementById("upload-file-image").files[0]))
}