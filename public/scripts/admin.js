function updateSong(song_id){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            var Data = JSON.parse(this.responseText);
            alert(Data.message);
            navigateTo(`/admin/song/${song_id}`)
        }
    }
    var details = {
        'song_id': song_id,
        'song_name': document.getElementById("song-title-edit").value,
        'artist_name': document.getElementById("song-artist-edit").value,
        'album_name': document.getElementById("song-album-edit").value,
        'song_image': '',
        'song_info': document.getElementById("song-info-edit").value,
        'song_link': '',
        'duration': '',
        'category': document.getElementById("song-category-edit").value

    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    xhttp.open("POST", `/song/update`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(formBody)
}
function addAlbum(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            var Data = JSON.parse(this.responseText);
            alert(Data.message);
        }
    }
    var details = {
        'album_name': document.getElementById("album-name-input").value,
        'artist_name': document.getElementById("album-artist-input").value,
        'album_info': document.getElementById("album-info-input").value,
        'album_image': document.getElementById("upload-file-image").files[0]
    };
    var formBody = new FormData();
    for (var property in details) {
      var encodedKey = property;
      var encodedValue = details[property];
      formBody.append(encodedKey, encodedValue);
    }
    xhttp.open("POST", `/album/add`, true);
    xhttp.send(formBody)
}

function addArtist(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            var Data = JSON.parse(this.responseText);
            alert(Data.message);
        }
    }
    var details = {
        'artist_name': document.getElementById("album-artist-input").value,
        'artist_info': document.getElementById("album-info-input").value,
        'artist_image': document.getElementById("upload-file-image").files[0]
    };
    var formBody = new FormData();
    for (var property in details) {
      var encodedKey = property;
      var encodedValue = details[property];
      formBody.append(encodedKey, encodedValue);
    }
    xhttp.open("POST", `/artist/add`, true);
    xhttp.send(formBody)
}

function addSong(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            var Data = JSON.parse(this.responseText);
            alert(Data.message);
            navigateTo(`/admin/song/${song_id}`)
        }
    }
    var details = {
        'song_id': song_id,
        'song_name': document.getElementById("song-title-edit").value,
        'artist_name': document.getElementById("song-artist-edit").value,
        'album_name': document.getElementById("song-album-edit").value,
        'song_image': '',
        'song_info': document.getElementById("song-info-edit").value,
        'song_link': '',
        'duration': '',
        'category': document.getElementById("song-category-edit").value,
        'song_file': document.getElementById("upload-file-song").files[0]

    };
    for (var property in details) {
        var encodedKey = property;
        var encodedValue = details[property];
        formBody.append(encodedKey, encodedValue);
      }
      xhttp.open("POST", `/song/add`, true);
      xhttp.send(formBody)
}