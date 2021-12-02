CREATE TABLE account (
  account_id VARCHAR(60) NOT NULL,
  username VARCHAR(60),
  current_password VARCHAR(60),
  is_active BOOLEAN,
  user_role VARCHAR(60),
  full_name VARCHAR(60),
  birth_date DATE,
  email VARCHAR(60),
  phone_number VARCHAR(60),
  last_updated_stamp TIMESTAMP NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_account PRIMARY KEY (account_id)
);

CREATE TABLE admin (
  account_id VARCHAR(60) NOT NULL,
  admin_id VARCHAR(60),
  CONSTRAINT pk_admin PRIMARY KEY (admin_id),
  CONSTRAINT admin_account FOREIGN KEY (account_id) REFERENCES account (account_id)
);

CREATE TABLE client (
  account_id VARCHAR(60) NOT NULL,
  client_id VARCHAR(60),
  num_artist INTEGER,
  num_playlist INTEGER,
  CONSTRAINT pk_client PRIMARY KEY (client_id),
  CONSTRAINT client_account FOREIGN KEY (account_id) REFERENCES account (account_id)
);

CREATE TABLE artist (
  artist_id VARCHAR(60) NOT NULL,
  admin_id VARCHAR(60) NOT NULL,
  artist_name VARCHAR(60),
  artist_info VARCHAR(1000),
  birth_date DATE,
  num_of_songs INTEGER,
  last_updated_stamp TIMESTAMP NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_artist PRIMARY KEY (artist_id),
  CONSTRAINT admin_creating FOREIGN KEY (admin_id) REFERENCES admin (admin_id)
);

CREATE TABLE album (
  album_id VARCHAR(60) NOT NULL,
  admin_id VARCHAR(60) NOT NULL,
  artist_id VARCHAR(60) NOT NULL,
  album_name VARCHAR(60),
  num_of_songs INTEGER,
  total_duration INTEGER,
  last_updated_stamp TIMESTAMP NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_album PRIMARY KEY (album_id),
  CONSTRAINT admin_creating FOREIGN KEY (admin_id) REFERENCES admin (admin_id),
  CONSTRAINT artist_composing FOREIGN KEY (artist_id) REFERENCES artist (artist_id)
);

CREATE TABLE song (
  song_id VARCHAR(60) NOT NULL,
  admin_id VARCHAR(60) NOT NULL,
  album_id VARCHAR(60) NOT NULL,
  song_name VARCHAR(60),
  duration INTEGER,
  category VARCHAR(60),
  average_rate NUMERIC,
  last_updated_stamp TIMESTAMP NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_song PRIMARY KEY (song_id),
  CONSTRAINT admin_creating FOREIGN KEY (admin_id) REFERENCES admin (admin_id),
  CONSTRAINT album_including FOREIGN KEY (album_id) REFERENCES album (album_id)
);

CREATE TABLE rating (
  rating_id VARCHAR(60) NOT NULL,
  client_id VARCHAR(60) NOT NULL,
  song_id VARCHAR(60) NOT NULL,
  rating NUMERIC,
  last_updated_stamp TIMESTAMP NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_rating PRIMARY KEY (rating_id),
  CONSTRAINT client_creating FOREIGN KEY (client_id) REFERENCES client (client_id),
  CONSTRAINT song_rated FOREIGN KEY (song_id) REFERENCES song (song_id)
);

CREATE TABLE comment (
  comment_id VARCHAR(60) NOT NULL,
  client_id VARCHAR(60) NOT NULL,
  song_id VARCHAR(60) NOT NULL,
  content VARCHAR(1000),
  last_updated_stamp TIMESTAMP NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_comment PRIMARY KEY (comment_id),
  CONSTRAINT client_creating FOREIGN KEY (client_id) REFERENCES client (client_id),
  CONSTRAINT song_commented FOREIGN KEY (song_id) REFERENCES song (song_id)
);

CREATE TABLE artist_favored (
  client_id VARCHAR(60) NOT NULL,
  artist_id VARCHAR(60) NOT NULL,
  last_updated_stamp TIMESTAMP NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_client_artist PRIMARY KEY (client_id, artist_id),
  CONSTRAINT client_favoring FOREIGN KEY (client_id) REFERENCES client (client_id),
  CONSTRAINT artist_favored FOREIGN KEY (artist_id) REFERENCES artist (artist_id)
);

CREATE table playlist (
  playlist_id VARCHAR(60) NOT NULL,
  client_id VARCHAR(60) NOT NULL,
  last_updated_stamp TIMESTAMP NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_playlist PRIMARY KEY (playlist_id),
  CONSTRAINT client_created FOREIGN KEY (client_id) REFERENCES client (client_id)
);

CREATE table song_added_to_playlist (
  song_id VARCHAR(60) NOT NULL,
  playlist_id VARCHAR(60) NOT NULL,
  last_updated_stamp TIMESTAMP NULL,
  created_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_song_playlist PRIMARY KEY (song_id, playlist_id),
  CONSTRAINT playlist_included FOREIGN KEY (playlist_id) REFERENCES playlist (playlist_id),
  CONSTRAINT song_added FOREIGN KEY (song_id) REFERENCES song (song_id)
);








