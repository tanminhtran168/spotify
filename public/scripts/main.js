const audio = document.getElementById("audio");
const playBtn = document.getElementById("play-pause");
const playIcon = document.getElementById("play-toggle");
const progress = document.getElementById("progress");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const randomBtn = document.getElementById("random");
const repeatBtn = document.getElementById("loop");
const volumeCtrl = document.getElementById("volume");
const volumeBtn = document.getElementById("volume-button");
const volumeIcon = document.getElementById("volume-toggle");
const albumImage = document.getElementById("song-album-cover");
const songName = document.getElementById("songname");
const artist = document.getElementById("artist");
const songTime = document.getElementById("song-time");
const playerCurrentTime = document.getElementById("current-time");
const getCookie = (cname) => {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  };
function convertIntToTimeString (x){
    if(Math.floor(x%60) < 10)
        return Math.floor(x/60) + ":0" + Math.floor(x%60);
    else
        return Math.floor(x/60) +":" + Math.floor(x%60);
}

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isMuted: false,
    config: {},
    currentVolume: 100,
    songs: [
        /*{
            name: "Damn",
            artist: "Raftaar x kr$na",
            path: "https://mp3.filmisongs.com/go.php?id=Damn%20Song%20Raftaar%20Ft%20KrSNa.mp3",
            image: "https://filmisongs.xyz/wp-content/uploads/2020/07/Damn-Song-Raftaar-KrNa.jpg"
        },
        {
            name: "Du mua thoi roi",
            artist: "kr$na",
            path: "https://tainhac123.com/listen/du-mua-thoi-roi-thuy-chi.j3awUEpymF4A.html",
            image: "https://hololive.hololivepro.com/wp-content/uploads/2021/09/%E6%98%9F%E8%A1%97%E3%81%99%E3%81%84%E3%81%9B%E3%81%84_Still-Still-Stellar_jk-1000x1000.png"
        },
        {
            name: "Du mua thoi roi",
            artist: "kr$na",
            path: "https://tainhac123.com/listen/du-mua-thoi-roi-thuy-chi.j3awUEpymF4A.html",
            image: "https://images.unsplash.com/photo-1587410131477-f01b22c59e1c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
        },*/
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
    },

    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            }
        });
    },
    handleEvents: function () {
        const _this = this;

        // Xử lý khi click play
        // Handle when click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
                playIcon.classList.remove("fa-pause-circle");
                playIcon.classList.add("fa-play-circle");

            } else {
                audio.play();
                playIcon.classList.remove("fa-play-circle");
                playIcon.classList.add("fa-pause-circle");
            }
        };

        // Khi song được play
        // When the song is played
        audio.onplay = function () {
            _this.isPlaying = true;
            playIcon.classList.remove("fa-play-circle");
            playIcon.classList.add("fa-pause-circle");
        };

        // Khi song bị pause
        // When the song is pause
        audio.onpause = function () {
            _this.isPlaying = false;
            playIcon.classList.remove("fa-pause-circle");
            playIcon.classList.add("fa-play-circle");
        };
        // Xử lý khi tua song
        // Handling when seek
        progress.onchange = function (e) {
            audio.currentTime = Math.floor(e.target.value);
            playBtn.focus();
        };

        progress.oninput = function (e) {
            if (audio.duration)
                progress.style.background = 'linear-gradient(to right, #4AB1BB 0%, #4AB1BB ' + Math.ceil(e.target.value/audio.duration*100) + '%, #244659 ' + Math.ceil(e.target.value/audio.duration*100) + '%, #244659 100%)';
            playerCurrentTime.innerHTML = convertIntToTimeString(e.target.value);
        };
        
        // Khi tiến độ bài hát thay đổi
        // When the song progress changes
        audio.ontimeupdate = function () {
            if (audio.duration) 
                progress.style.background = 'linear-gradient(to right, #4AB1BB 0%, #4AB1BB ' + Math.ceil(progress.value/audio.duration*100) + '%, #244659 ' + Math.ceil(progress.value/audio.duration*100) + '%, #244659 100%)';
            if(!(progress === document.activeElement))
            {
                progress.value = Math.floor(audio.currentTime);
                playerCurrentTime.innerHTML = convertIntToTimeString(audio.currentTime);
            }
            
        };

        // Khi next song
        // When next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
        };

        // Khi prev song
        // When prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
        };

        // Xử lý bật / tắt random song
        // Handling on / off random song
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom", _this.isRandom);
            randomBtn.classList.toggle("active", _this.isRandom);
            randomBtn.style.color = _this.isRandom ? "#4AB1BB" : "#FFFFFF";
        };

        // Xử lý lặp lại một song
        // Single-parallel repeat processing
        repeatBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig("isRepeat", _this.isRepeat);
            repeatBtn.classList.toggle("active", _this.isRepeat);
            repeatBtn.style.color = _this.isRepeat ? "#4AB1BB" : "#FFFFFF";
        };

        // Xử lý next song khi audio ended
        // Handle next song when audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        };

        // Update song duration when changed
        audio.ondurationchange = function () {
            songTime.innerHTML = convertIntToTimeString(audio.duration)
            playerCurrentTime.innerHTML = "0:00";
            progress.setAttribute("max",audio.duration);
        };

        volumeCtrl.oninput = function () {
            volumeCtrl.style.background = 'linear-gradient(to right, #4AB1BB 0%, #4AB1BB ' + (volumeCtrl.value) + '%, #244659 ' + (volumeCtrl.value) + '%, #244659 100%)';
            audio.volume = volumeCtrl.value / 100;
            _this.currentVolume = volumeCtrl.value;
            if(volumeCtrl.value == 0)
                volumeIcon.className="fas fa-volume-mute";
            else switch(Math.floor(volumeCtrl.value / 25)){
                case 0:
                    volumeIcon.className="fas fa-volume-off";
                    break;
                case 1:
                    volumeIcon.className="fas fa-volume-down";
                    break;
                case 2:
                    volumeIcon.className="fas fa-volume-down";
                    break;
                default:
                    volumeIcon.className="fas fa-volume-up";
            }
        };
        
        volumeBtn.onclick = function () {
            _this.isMuted = !_this.isMuted;
            volumeCtrl.value = _this.isMuted ? 0 : _this.currentVolume;
            audio.volume = _this.isMuted ? 0 : _this.currentVolume/100;
            volumeCtrl.style.background = 'linear-gradient(to right, #4AB1BB 0%, #4AB1BB ' + (volumeCtrl.value) + '%, #244659 ' + (volumeCtrl.value) + '%, #244659 100%)';
            if(_this.isMuted)
            {
                volumeIcon.className="fas fa-volume-mute";
            }
            else switch(Math.floor(volumeCtrl.value / 30)){
                case 0:
                    volumeIcon.className="fas fa-volume-off";
                    break;
                case 1:
                    volumeIcon.className="fas fa-volume-down";
                    break;
                default:
                    volumeIcon.className="fas fa-volume-up";
            }
            
        };

        document.getElementById("home").onclick = function () {
            navigateTo('/')
        }
        document.getElementById("queue-button").onclick = function () {
            if(window.location.pathname === '/queue')
            {
                document.getElementById("queue-button").classList.remove('active')
                window.history.back()
            }
            else
            {
                document.getElementById("queue-button").classList.add('active')
                navigateTo('/queue', ()=> {
                    /*for(var i=0; i<_this.songs.length; ++i)
                    {
                        var div = document.createElement("div");
                        div.className = "list-item-song"
                        //div.setAttribute("onclick", `goToSong(${parsedJSON[i].song_id})`)
                        //div.setAttribute("ondblclick", ``)
                        div.innerHTML = `
                        <img class="list-song-cover" src="${_this.songs[i].image}">
                        <div class="list-song-title">${_this.songs[i].name}</div>
                        <div class="list-song-artist">${_this.songs[i].artist}</div>
                        <div class="list-song-album">${_this.songs[i].album}</div>
                        <div class="list-song-duration">${convertIntToTimeString(_this.songs[i].duration)}</div>
                        <div class="list-song-options">
                            <i class="fas fa-ellipsis-v"></i>
                        </div>`;
                        document.getElementById("queue").appendChild(div);
                    }*/
                }, "POST", app.songs)
            }
        }
        document.getElementById("search-button").onclick = function(){
            navigateTo(`/search/${document.getElementById("search-box-input").value}`)
        }
    },

    
    loadCurrentSong: function () {
        audio.src = this.currentSong.path;
        songName.innerText=this.currentSong.name;
        artist.innerText=this.currentSong.artist;
        albumImage.src="../" + this.currentSong.image;
        progress.value=0;
    },
    loadConfig: function () {
        // console.log(audio.volume);
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    
    start: function () {
        // Gán cấu hình từ config vào ứng dụng
        // Assign configuration from config to application
        this.loadConfig();

        // Định nghĩa các thuộc tính cho object
        // Defines properties for the object
        this.defineProperties();

        // Lắng nghe / xử lý các sự kiện (DOM events)
        // Listening / handling events (DOM events)
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        // Load the first song information into the UI when running the app
        //this.loadCurrentSong();

        // Hiển thị trạng thái ban đầu của button repeat & random
        // Display the initial state of the repeat & random button
        
        if(getCookie("token"))
        {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if(this.readyState == 4)
                {
                    var res = this.responseText;
                    var Data = JSON.parse(res.substring(1,res.length - 1));
                    document.getElementById("account-header-box").innerHTML = 
                    `<button id="account-header" class="header-button">
                        <img src="../${Data.avatar}" alt="" id="header-avatar" class="avatar">
                        <div id="account-head-name">${Data.full_name}</div>
                    </button>
                    <button id="logout" class="header-button" onclick="logout()">LOGOUT</button>`;
                }
            }
            
            xhttp.open("GET", `/account/mine`, true);
            xhttp.send();
            
        }
           
        else
            document.getElementById("account-header-box").innerHTML = 
            `<button class="header-button" id="login" onclick="redirectTo('/login')">LOGIN</button>
            <button class="header-button" id="signup" onclick="redirectTo('/signup')">SIGN UP</button>`
            
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    }
};

app.start();


//handle routing
let root = document.getElementById('page-content');
window.onload = () => {   
    let path = window.location.pathname;
    history.pushState({ejs: root.innerHTML}, `${path}`, `${path}`)
    document.getElementById("queue-button").classList.remove('active')
}

function navigateTo(path, callback = null, reqType = "GET", details = null)
{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            root.innerHTML = this.responseText;
            history.pushState({ejs: root.innerHTML/*, randomData: window.Math.random()*/}, `${path}`, `${path}`)
            if(callback)
            {
                callback();
            }
            window.scrollTo(0,0);
        }
    }
    
    xhttp.open(reqType, `${path}`, true);
    xhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest")
    
    if(details)
    {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify(details));
    }   
    else
        xhttp.send();
    if(path!= "/queue")
        document.getElementById("queue-button").classList.remove('active')
}

function redirectTo(path){
    window.location = path;
}
function logout(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            location.reload()
        }
    }
    xhttp.open("POST", `/logout`, true);
    xhttp.send();
}
addEventListener('popstate', function (event) {
    //console.log(event.state.content); // this contains the state data from `pushState`. Use it to decide what to change the page back to.
    document.getElementById('page-content').innerHTML = event.state.ejs;
})

function openTab(evt, tabName) {
    var i, x, tablinks;
    x = document.getElementsByClassName("tab");
    for (i = 0; i < x.length; i++) {
      x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-bar-button");
    for (i = 0; i < x.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(`${tabName}-result`).style.display= "block";
    evt.currentTarget.className += " active";
  }

function goToSong(id){
    navigateTo('/song')
}


function playSong(id){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            var res = this.responseText;
            var parsedJSON = JSON.parse(res);   
            app.songs.push(
                {
                    songid: id,
                    name: parsedJSON.song_name,
                    artist: parsedJSON.artist_name,
                    path: parsedJSON.song_link,
                    image: parsedJSON.album_image,
                    album: parsedJSON.album_name,
                    duration: parsedJSON.duration
                },
            );
            app.currentIndex = app.songs.length - 1;
            app.loadCurrentSong();
            audio.play();
        }
    }
    xhttp.open("POST", `/song/get`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(`song_id=${id}`);
}

function addToQueue(id){
    var xhttp = new XMLHttpRequest();
    var not_empty = app.songs.length
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            var res = this.responseText;
            var parsedJSON = JSON.parse(res);
            app.songs.push(
                {
                    songid: id,
                    name: parsedJSON.song_name,
                    artist: parsedJSON.artist_name,
                    path: parsedJSON.song_link,
                    image: parsedJSON.album_image,
                    album: parsedJSON.album_name,
                    duration: parsedJSON.duration
                },
            );
            if(not_empty) return
            currentIndex = 0;
            app.loadCurrentSong();
        }
    }
    xhttp.open("POST", `/song/get`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(`song_id=${id}`);
}

function addSongToPlaylist(songId, playlistId)
{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            var Data = JSON.parse(this.responseText);
            alert(Data.message);
        }
    }
    var details = {
        'playlist_id': playlistId,
        'song_id': songId
    };
    
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    xhttp.open("POST", `/playlist/song/add`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(formBody)
}

function createPlaylist() 
{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            var Data = JSON.parse(this.responseText);
            alert(Data.message);
            navigateTo('/')
        }
    }
    var details = {
        'playlist_name': document.getElementById("playlist-name-input").value,
        'playlist_info': document.getElementById("playlist-info-input").value
    };
    
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    xhttp.open("POST", `/playlist/add`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(formBody)
}

function playPlaylist(playlist_id){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            app.currentIndex = app.songs.length;
            var res = this.responseText;
            var parsedJSONs = JSON.parse(res);  
            for(var i = 0; i<parsedJSONs.length; i++)
            {
                var parsedJSON = parsedJSONs[i] 
                app.songs.push(
                    {
                        songid: parsedJSON.song_id,
                        name: parsedJSON.song_name,
                        artist: parsedJSON.artist_name,
                        path: parsedJSON.song_link,
                        image: parsedJSON.song_image,
                        album: parsedJSON.album_name,
                        duration: parsedJSON.duration
                    },
                );
            }
            console.log(app.songs)
            app.loadCurrentSong();
            audio.play();
        }
    }
    xhttp.open("POST", `/playlist/song`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(`playlist_id=${playlist_id}`);
}

function addPlaylistToQueue(playlist_id){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            var res = this.responseText;
            var parsedJSONs = JSON.parse(res);  
            for(var i = 0; i<parsedJSONs.length; i++)
            {
                var parsedJSON = parsedJSONs[i] 
                app.songs.push(
                    {
                        songid: parsedJSON.song_id,
                        name: parsedJSON.song_name,
                        artist: parsedJSON.artist_name,
                        path: parsedJSON.song_link,
                        image: parsedJSON.song_image,
                        album: parsedJSON.album_name,
                        duration: parsedJSON.duration
                    },
                );
            }
        }
    }
    xhttp.open("POST", `/playlist/song`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(`playlist_id=${playlist_id}`);
}

function deletePlaylist(playlist_id){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            var Data = JSON.parse(this.responseText);
            alert(Data.message);
            navigateTo('/')
        }
    }
    xhttp.open("POST", `/playlist/delete`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(`playlist_id=${playlist_id}`);
}
function deleteFromPlaylist(playlist_id, song_id){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            var Data = JSON.parse(this.responseText);
            alert(Data.message);
            location.reload()
        }
    }
    xhttp.open("POST", `/playlist/song/delete`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(`playlist_id=${playlist_id}&song_id=${song_id}`);
}

function submitComment(song_id){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            var Data = JSON.parse(this.responseText);
            alert(Data.message);
            location.reload()
        }
    }
    xhttp.open("POST", `/comment/add`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(`comment_content=${document.getElementById("comment-input").value}&song_id=${song_id}`);
}

function playAlbum(album_id)
{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            var res = this.responseText;
            var parsedJSONArray = JSON.parse(res);  
            app.currentIndex = app.songs.length;
            parsedJSONArray.forEach(parsedJSON => {
                app.songs.push(
                    {
                        songid: parsedJSON.song_id,
                        name: parsedJSON.song_name,
                        artist: parsedJSON.artist_name,
                        path: parsedJSON.song_link,
                        image: parsedJSON.album_image,
                        album: parsedJSON.album_name,
                        duration: parsedJSON.duration
                    },
                );
            }); 
            app.loadCurrentSong();
            audio.play();
        }
    }
    xhttp.open("POST", `/album/get`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(`album_id=${album_id}`);
    
}
function addAlbumToQueue(album_id)
{
    var not_empty = app.songs.length
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            var res = this.responseText;
            var parsedJSONArray = JSON.parse(res);  
            parsedJSONArray.forEach(parsedJSON => {
                app.songs.push(
                    {
                        songid: parsedJSON.song_id,
                        name: parsedJSON.song_name,
                        artist: parsedJSON.artist_name,
                        path: parsedJSON.song_link,
                        image: parsedJSON.album_image,
                        album: parsedJSON.album_name,
                        duration: parsedJSON.duration
                    },
                );
            }); 
            if(not_empty) return
            app.currentIndex = 0;
            app.loadCurrentSong();
        }
    }
    xhttp.open("POST", `/album/get`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(`album_id=${album_id}`);
    
   
}
function updatePreview(){
    document.getElementById("album-cover").setAttribute("src", URL.createObjectURL(document.getElementById("upload-file-image").files[0]))
}