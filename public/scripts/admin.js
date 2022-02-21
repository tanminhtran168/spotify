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
    xhttp.open("POST", `/song/update`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
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