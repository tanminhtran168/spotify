CREATE TABLE account (
  account_id SERIAL NOT NULL,
  username VARCHAR(60),
  current_password VARCHAR(60),
  avatar varchar(60),
  user_role VARCHAR(60),
  full_name VARCHAR(60),
  birth_date DATE,
  email VARCHAR(60),
  phone_number VARCHAR(60),
  last_updated_stamp TIMESTAMP NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_account PRIMARY KEY (account_id)
);

CREATE TABLE client (
  client_id serial not null,
  account_id int NOT NULL,
  num_artist_favorite INTEGER,
  num_playlist INTEGER,
  CONSTRAINT pk_client PRIMARY KEY (client_id),
  CONSTRAINT client_account FOREIGN KEY (account_id) REFERENCES account (account_id)
);

CREATE TABLE artist (
  artist_id serial NOT NULL,
  artist_name VARCHAR(60),
  artist_info VARCHAR(1000),
  artist_image VARCHAR(100),
  birth_date DATE,
  num_of_albums INTEGER,
  num_of_songs INTEGER,
  last_updated_stamp TIMESTAMP NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_artist PRIMARY KEY (artist_id)
);

CREATE TABLE album (
  album_id serial NOT NULL,
  artist_id int NOT NULL,
  album_name VARCHAR(60),
  album_image VARCHAR(100),
  album_info VARCHAR(1000),
  num_of_songs INTEGER,
  total_duration REAL,
  last_updated_stamp TIMESTAMP NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_album PRIMARY KEY (album_id),
  CONSTRAINT artist_composing FOREIGN KEY (artist_id) REFERENCES artist (artist_id)
);

CREATE TABLE song (
  song_id serial NOT NULL,
  artist_id int NOT NULL,
  album_id int ,
  song_name VARCHAR(60),
  song_info VARCHAR(1000),
  song_link VARCHAR(100),
  duration REAL,
  category VARCHAR(60),
  sum_rate int,
  num_of_ratings int,
  num_of_comments int,
  last_updated_stamp TIMESTAMP NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_song PRIMARY KEY (song_id),
  CONSTRAINT artist_creating FOREIGN KEY (artist_id) REFERENCES artist (artist_id),
  CONSTRAINT album_including FOREIGN KEY (album_id) REFERENCES album (album_id)
);

CREATE TABLE rating (
  rating_id serial NOT NULL,
  client_id int NOT NULL,
  song_id int NOT NULL,
  rating NUMERIC,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_rating PRIMARY KEY (rating_id),
  CONSTRAINT client_creating FOREIGN KEY (client_id) REFERENCES client (client_id),
  CONSTRAINT song_rated FOREIGN KEY (song_id) REFERENCES song (song_id)
);

CREATE TABLE comment (
  comment_id serial NOT NULL,
  client_id int NOT NULL,
  song_id int NOT NULL,
  comment_content VARCHAR(1000),
  last_updated_stamp TIMESTAMP NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_comment PRIMARY KEY (comment_id),
  CONSTRAINT client_creating FOREIGN KEY (client_id) REFERENCES client (client_id),
  CONSTRAINT song_commented FOREIGN KEY (song_id) REFERENCES song (song_id)
);

CREATE TABLE artist_favorite (
  client_id int NOT NULL,
  artist_id int NOT NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_client_artist PRIMARY KEY (client_id, artist_id),
  CONSTRAINT client_favoring FOREIGN KEY (client_id) REFERENCES client (client_id),
  CONSTRAINT artist_favored FOREIGN KEY (artist_id) REFERENCES artist (artist_id)
);

CREATE table playlist (
  playlist_id serial NOT NULL,
  client_id int NOT NULL,
  playlist_name VARCHAR(60),
  playlist_info VARCHAR(1000),
  num_of_songs int not null,
  total_duration REAL not null,
  last_updated_stamp TIMESTAMP NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_playlist PRIMARY KEY (playlist_id),
  CONSTRAINT client_created FOREIGN KEY (client_id) REFERENCES client (client_id)
);

CREATE table song_added_to_playlist (
  song_id int NOT NULL,
  playlist_id int NOT NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_song_playlist PRIMARY KEY (song_id, playlist_id),
  CONSTRAINT playlist_included FOREIGN KEY (playlist_id) REFERENCES playlist (playlist_id),
  CONSTRAINT song_added FOREIGN KEY (song_id) REFERENCES song (song_id)
);

CREATE table recently_listened (
  song_id int NOT NULL,
  client_id int NOT NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_song_client PRIMARY KEY (song_id, client_id),
  CONSTRAINT client_listened FOREIGN KEY (client_id) REFERENCES client (client_id),
  CONSTRAINT song_listened FOREIGN KEY (song_id) REFERENCES song (song_id)
);

INSERT INTO account(account_id, username, current_password, avatar, user_role, full_name, birth_date, email, phone_number, last_updated_stamp, created_stamp) 
            VALUES(default, 'minhtt', '161718', '/images/user.png', 'admin', 'Tan Minh Tran', date('2000-01-01'), 'tanminhtran168@gmail.com', '123456789', current_timestamp, default);
INSERT INTO account(account_id, username, current_password, avatar, user_role, full_name, birth_date, email, phone_number, last_updated_stamp, created_stamp)
            VALUES(default, 'duongnn', '123456', '/images/user.png', 'client', 'Nam Duong Ngo', date('2000-11-13'), 'duongnamngohl@gmail.com', '0963648035', current_timestamp, default);
INSERT INTO account(account_id, username, current_password, avatar, user_role, full_name, birth_date, email, phone_number, last_updated_stamp, created_stamp)
            VALUES(default, 'minhtb', '123456', '/images/user.png', 'client', 'Binh Minh Tran', date('2000-10-02'), 'minhtb@gmail.com', '012345678', current_timestamp, default);
INSERT INTO account(account_id, username, current_password, avatar, user_role, full_name, birth_date, email, phone_number, last_updated_stamp, created_stamp)
            VALUES(default, 'ducdm', '123456', '/images/user.png', 'client', 'Minh Duc Dang', date('2000-01-31'), 'ducdm@gmail.com', '012345679', current_timestamp, default);

INSERT INTO client(client_id, account_id, num_artist_favorite, num_playlist)
            VALUES(default, 2, 2, 2);
INSERT INTO client(client_id, account_id, num_artist_favorite, num_playlist)
            VALUES(default, 3, 2, 2);
INSERT INTO client(client_id, account_id, num_artist_favorite, num_playlist)
            VALUES(default, 4, 1, 1);
           
INSERT INTO playlist(playlist_id, client_id , playlist_name, playlist_info, num_of_songs, total_duration, last_updated_stamp, created_stamp) 
            VALUES(default, 1, 'Music', 'Trend', 1, 199, current_timestamp, default);
INSERT INTO playlist(playlist_id, client_id , playlist_name, playlist_info, num_of_songs, total_duration, last_updated_stamp, created_stamp) 
            VALUES(default, 1, 'Nhac nhe', 'Hobby', 2, 427, current_timestamp, default);
INSERT INTO playlist(playlist_id, client_id , playlist_name, playlist_info, num_of_songs, total_duration, last_updated_stamp, created_stamp) 
            VALUES(default, 2, 'Nhac EDM', 'Nhac Au My', 1, 228, current_timestamp, default);
INSERT INTO playlist(playlist_id, client_id , playlist_name, playlist_info, num_of_songs, total_duration, last_updated_stamp, created_stamp) 
            VALUES(default, 2, 'Nhac rock', 'Nhac viet', 2, 389, current_timestamp, default);
INSERT INTO playlist(playlist_id, client_id , playlist_name, playlist_info, num_of_songs, total_duration, last_updated_stamp, created_stamp) 
            VALUES(default, 3, 'Nhac san', 'Nhac vn', 1, 161, current_timestamp, default);
           
INSERT INTO artist(artist_id, artist_name, artist_info, artist_image, birth_date, num_of_albums, num_of_songs, last_updated_stamp, created_stamp) 
            VALUES(default, 'cur', 'Rapper so 1 HL', '/images/artistImages/cur.jpg', date('2000-01-22'), 1, 2, current_timestamp, default);
INSERT INTO artist(artist_id, artist_name, artist_info, artist_image, birth_date, num_of_albums, num_of_songs, last_updated_stamp, created_stamp) 
            values(default, 'hai', 'Singer so 1 QY', '/images/artist.png', date('2000-04-05'), 1, 1, current_timestamp, default);
           
INSERT INTO album(album_id, artist_id, album_name, album_image, album_info, num_of_songs, total_duration, last_updated_stamp, created_stamp) 
            VALUES(default, 1, 'Rap songs', '/images/albumImages/Rap songs.jpg', 'Nhac rap', 2, 427, current_timestamp, default);
INSERT INTO album(album_id, artist_id, album_name, album_image, album_info, num_of_songs, total_duration, last_updated_stamp, created_stamp) 
            VALUES(default, 2, 'Songs', '/images/album.png', 'Nhac nhe', 1, 161, current_timestamp, default);
           
INSERT INTO song(song_id, artist_id, album_id, song_name, song_info, song_link, category, duration, sum_rate, num_of_ratings, num_of_comments, last_updated_stamp, created_stamp) 
            VALUES(default, 1, 1, 'Toi yeu CHL', 'Nhac CHL', '/songs/Toi yeu CHL.mp3', 'Nhac viet', 199, 4, 1, 1, current_timestamp, default);
INSERT INTO song(song_id, artist_id, album_id, song_name, song_info, song_link, category, duration, sum_rate, num_of_ratings, num_of_comments, last_updated_stamp, created_stamp) 
            VALUES(default, 1, 1, 'Cur rap song', 'Nhac VN', '/songs/Cur rap song.mp3', 'Nhac My', 228, 8, 2, 1, current_timestamp, default);
INSERT INTO song(song_id, artist_id, album_id, song_name, song_info, song_link, category, duration, sum_rate, num_of_ratings, num_of_comments, last_updated_stamp, created_stamp) 
            VALUES(default, 2, 2, 'Nhac tiktok', 'Tiktok', '/songs/Nhac tiktok.mp3', 'Nhac viet', 161, 8, 2, 2, current_timestamp, default);
           
INSERT INTO song_added_to_playlist (song_id , playlist_id , created_stamp) 
            VALUES(1, 1, default);
INSERT INTO song_added_to_playlist (song_id , playlist_id , created_stamp) 
            VALUES(1, 2, default);
INSERT INTO song_added_to_playlist (song_id , playlist_id , created_stamp) 
            VALUES(2, 2, default);
INSERT INTO song_added_to_playlist (song_id , playlist_id , created_stamp) 
            VALUES(2, 3, default);
INSERT INTO song_added_to_playlist (song_id , playlist_id , created_stamp) 
            VALUES(2, 4, default);
INSERT INTO song_added_to_playlist (song_id , playlist_id , created_stamp) 
            VALUES(3, 4, default);
INSERT INTO song_added_to_playlist (song_id , playlist_id , created_stamp) 
            VALUES(3, 5, default);
           
INSERT INTO artist_favorite (client_id, artist_id, created_stamp) 
            VALUES(1, 1, default);
INSERT INTO artist_favorite (client_id, artist_id, created_stamp) 
            VALUES(1, 2, default);
INSERT INTO artist_favorite (client_id, artist_id, created_stamp) 
            VALUES(2, 1, default);
INSERT INTO artist_favorite (client_id, artist_id, created_stamp) 
            values(2, 2, default);
INSERT INTO artist_favorite (client_id, artist_id, created_stamp) 
            VALUES(3, 1, default);
           
INSERT INTO rating(rating_id, client_id, song_id, rating, created_stamp) 
            VALUES(default, 1, 2, 10, default);
INSERT INTO rating(rating_id, client_id, song_id, rating, created_stamp) 
            VALUES(default, 2, 1, 9, default);
INSERT INTO rating(rating_id, client_id, song_id, rating, created_stamp) 
            VALUES(default, 2, 3, 9, default);
INSERT INTO rating(rating_id, client_id, song_id, rating, created_stamp) 
            VALUES(default, 3, 2, 8, default);
INSERT INTO rating(rating_id, client_id, song_id, rating, created_stamp) 
            VALUES(default, 3, 3, 9, default);

INSERT INTO comment(comment_id, client_id, song_id, comment_content, last_updated_stamp, created_stamp) 
            VALUES(default, 1, 2, 'Hay', current_timestamp, default);
INSERT INTO comment(comment_id, client_id, song_id, comment_content, last_updated_stamp, created_stamp) 
            VALUES(default, 2, 3, 'ok', current_timestamp, default);
INSERT INTO comment(comment_id, client_id, song_id, comment_content, last_updated_stamp, created_stamp) 
            VALUES(default, 2, 1, 'Duoc', current_timestamp, default);
INSERT INTO comment(comment_id, client_id, song_id, comment_content, last_updated_stamp, created_stamp) 
            VALUES(default, 3, 1, 'binh thuong', current_timestamp, default);
           
insert into recently_listened (song_id, client_id, created_stamp)
			values(2, 1, default);
insert into recently_listened (song_id, client_id, created_stamp)
			values(3, 1, default);

select * from account ;
select * from client;
select * from playlist;
select * from artist  ;
select * from artist_favorite ;
select * from album ;
select * from song  ;
select * from song_added_to_playlist  ;
select * from rating ;
select * from comment;


drop table account, client, artist, album, song, song_added_to_playlist, playlist, comment, rating , artist_favorite, recently_listened 
SELECT song.*, (sum_rate/num_of_ratings) as rate FROM song, rating ORDER BY rating DESC LIMIT 5

SELECT * FROM recently_listened WHERE client_id = 1 ORDER BY created_stamp desc
SELECT COUNT(song_id) as num FROM recently_listened WHERE client_id = 1