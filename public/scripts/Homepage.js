// Một số bài hát có thể bị lỗi do liên kết bị hỏng. Vui lòng thay thế liên kết khác để có thể phát
// Some songs may be faulty due to broken links. Please replace another link so that it can be played

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PlAYER_STORAGE_KEY = "F8_PLAYER";

const audio = document.getElementById("audio");
const playBtn = document.getElementById("play-pause");
const playIcon = document.getElementById("play-toggle");
const progress = document.getElementById("progress");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const randomBtn = document.getElementById("random");
const repeatBtn = document.getElementById("loop");
const volumeCtrl = document.getElementById("volume");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: {},
    songs: [
        {
            name: "Damn",
            singer: "Raftaar x kr$na",
            path: "https://mp3.filmisongs.com/go.php?id=Damn%20Song%20Raftaar%20Ft%20KrSNa.mp3",
            image: "https://filmisongs.xyz/wp-content/uploads/2020/07/Damn-Song-Raftaar-KrNa.jpg"
        },
        {
            name: "Du mua thoi roi",
            singer: "Raftaar x kr$na",
            path: "https://tainhac123.com/listen/du-mua-thoi-roi-thuy-chi.j3awUEpymF4A.html",
            image: "https://filmisongs.xyz/wp-content/uploads/2020/07/Damn-Song-Raftaar-KrNa.jpg"
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
                playIcon.classList.remove("fa-stop-circle");
                playIcon.classList.add("fa-play-circle");

            } else {
                audio.play();
                playIcon.classList.remove("fa-play-circle");
                playIcon.classList.add("fa-stop-circle");
            }
        };

        // Khi song được play
        // When the song is played
        audio.onplay = function () {
            _this.isPlaying = true;
        };

        // Khi song bị pause
        // When the song is pause
        audio.onpause = function () {
            _this.isPlaying = false;
        };

        // Khi tiến độ bài hát thay đổi
        // When the song progress changes
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(
                    (audio.currentTime / audio.duration) * 100
                );
                progress.value = progressPercent;
            }
        };

        // Xử lý khi tua song
        // Handling when seek
        progress.onchange = function (e) {
            const seekTime = (audio.duration / 100) * e.target.value;
            audio.currentTime = seekTime;
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
        };

        // Xử lý lặp lại một song
        // Single-parallel repeat processing
        repeatBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig("isRepeat", _this.isRepeat);
            repeatBtn.classList.toggle("active", _this.isRepeat);
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

        volumeCtrl.onchange = function () {
            audio.volume = volumeCtrl.value / 100;
        }
        
    },

    loadCurrentSong: function () {
        audio.src = this.currentSong.path;
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