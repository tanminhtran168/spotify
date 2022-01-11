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
const albumImage = document.getElementById("album-cover");
const songName = document.getElementById("songname");
const artist = document.getElementById("artist");
const songTime = document.getElementById("song-time");
const playerCurrentTime = document.getElementById("current-time");
const loginBtn = document.getElementById("login");
const homeBtn = document.getElementById("home");
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isMuted: false,
    config: {},
    currentVolume: 100,
    songs: [
        {
            name: "Damn",
            singer: "Raftaar x kr$na",
            path: "https://mp3.filmisongs.com/go.php?id=Damn%20Song%20Raftaar%20Ft%20KrSNa.mp3",
            image: "https://filmisongs.xyz/wp-content/uploads/2020/07/Damn-Song-Raftaar-KrNa.jpg"
        },
        {
            name: "Du mua thoi roi",
            singer: "kr$na",
            path: "https://tainhac123.com/listen/du-mua-thoi-roi-thuy-chi.j3awUEpymF4A.html",
            image: "https://hololive.hololivepro.com/wp-content/uploads/2021/09/%E6%98%9F%E8%A1%97%E3%81%99%E3%81%84%E3%81%9B%E3%81%84_Still-Still-Stellar_jk-1000x1000.png"
        },
        {
            name: "Du mua thoi roi",
            singer: "kr$na",
            path: "https://tainhac123.com/listen/du-mua-thoi-roi-thuy-chi.j3awUEpymF4A.html",
            image: "https://images.unsplash.com/photo-1587410131477-f01b22c59e1c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
        },
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
            if(Math.floor(e.target.value%60) < 10)
                playerCurrentTime.innerHTML = Math.floor(e.target.value/60) + ":0" + Math.floor(e.target.value%60);
            else
                playerCurrentTime.innerHTML = Math.floor(e.target.value/60) + ':' + Math.floor(e.target.value%60);
        };
        
        // Khi tiến độ bài hát thay đổi
        // When the song progress changes
        audio.ontimeupdate = function () {
            if (audio.duration) 
                progress.style.background = 'linear-gradient(to right, #4AB1BB 0%, #4AB1BB ' + Math.ceil(progress.value/audio.duration*100) + '%, #244659 ' + Math.ceil(progress.value/audio.duration*100) + '%, #244659 100%)';
            if(!(progress === document.activeElement))
            {
                progress.value = Math.floor(audio.currentTime);
                if(Math.floor(audio.currentTime%60) < 10)
                     playerCurrentTime.innerHTML = Math.floor(audio.currentTime/60) + ":0" + Math.floor(audio.currentTime%60);
                else
                    playerCurrentTime.innerHTML = Math.floor(audio.currentTime/60) + ':' + Math.floor(audio.currentTime%60);
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
            songTime.innerHTML = Math.floor(audio.duration/60) +":" + Math.floor(audio.duration%60); 
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
        loginBtn.onclick = function () {
            navigateTo('login')
            //history.pushState({}, 'login', 'login')
            //document.getElementById('page-content').innerHTML = 'Login'
        }

        homeBtn.onclick = function () {
            navigateTo('/')
            //history.pushState({}, 'Home', '/')
            //document.getElementById('page-content').innerHTML = 'You are at homepage'
        }
    },

    
    loadCurrentSong: function () {
        audio.src = this.currentSong.path;
        songName.innerText=this.currentSong.name;
        artist.innerText=this.currentSong.singer;
        albumImage.src=this.currentSong.image;
        progress.value=0;
        console.log(this.currentSong.name);
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
        this.loadCurrentSong();

        // Hiển thị trạng thái ban đầu của button repeat & random
        // Display the initial state of the repeat & random button
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    }
};

app.start();


//handle routing

window.onload = () => {
    //get root div for rendering
    let root = document.getElementById('page-content');

    let currentPath = window.location.pathname;

    fetch(currentPath).then(function (response) {
        // The API call was successful!
        return response.text();
    }).then(function (html) {
        // This is the HTML from our response as a text string
        //console.log(html);
    }).catch(function (err) {
        // There was an error
        console.warn('Something went wrong.', err);
    });
    if(currentPath === '/')
    document.getElementById('page-content').innerHTML = `You are on homepage`
    else
    document.getElementById('page-content').innerHTML = `You are on ${currentPath}`
}

function navigateTo(path)
{
    if(path === '/')
        document.getElementById('page-content').innerHTML = `You are on homepage`
    else
        document.getElementById('page-content').innerHTML = `You are on ${path}`
}

