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
  total_duration INTEGER,
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
  song_image VARCHAR(100),
  song_info VARCHAR(1000),
  duration INTEGER,
  category VARCHAR(60),
  average_rate NUMERIC,
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
  last_updated_stamp TIMESTAMP NULL,
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
  last_updated_stamp TIMESTAMP NULL,
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
  last_updated_stamp TIMESTAMP NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_playlist PRIMARY KEY (playlist_id),
  CONSTRAINT client_created FOREIGN KEY (client_id) REFERENCES client (client_id)
);

CREATE table song_added_to_playlist (
  song_id int NOT NULL,
  playlist_id int NOT NULL,
  last_updated_stamp TIMESTAMP NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_song_playlist PRIMARY KEY (song_id, playlist_id),
  CONSTRAINT playlist_included FOREIGN KEY (playlist_id) REFERENCES playlist (playlist_id),
  CONSTRAINT song_added FOREIGN KEY (song_id) REFERENCES song (song_id)
);

INSERT INTO account(account_id, username, current_password, avatar, user_role, full_name, birth_date, email, phone_number, last_updated_stamp, created_stamp) 
            VALUES(default, 'minhtt', '161718', null, 'admin', 'Tan Minh Tran', null, 'tanminhtran168@gmail.com', '123456789', null, default);
INSERT INTO account(account_id, username, current_password, avatar, user_role, full_name, birth_date, email, phone_number, last_updated_stamp, created_stamp)
            VALUES(default, 'duongnn', '123456', null, 'client', 'Nam Duong Ngo', null, 'duongnamngohl@gmail.com', '0963648035', null, default);
select * from account 
select * from artist  
select * from song 

drop table account, client, artist, album, song, song_added_to_playlist, playlist, comment, rating , artist_favorite 

