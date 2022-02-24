# Spotify

# Nhóm 9 : Xây dựng một website nghe nhạc trực tuyến
# Các thành viên : 
    Đặng Minh Đức 20183709
    Ngô Nam Dương 20180058
    Trần Bình Minh 20180138
    Trần Tấn Minh 20183802

# Phân công nhiệm vụ : 
    Đặng Minh Đức : Tạo database mẫu, kết nối database với backend, hỗ trợ xử lý backend, kiểm thử hệ thống.
    Ngô Nam Dương : Xử lý backend, tạo các hàm chức năng, kết nối backend với database và frontend.
    Trần Bình Minh : Thiết kế giao diện, xử lý logic frontend, kết nối với backend. 
    Trần Tấn Minh : Thiết kế database, hỗ trợ viết frontend.

# Chỉ dẫn cài đặt : 

- Yêu cầu : 
    - Cài đặt Dbeaver phiên bản 21.3.0 và PostgreSQL 14.  
    - Cài đặt môi trường Nodejs.
- Cài đặt : 
    - Admin : {user_name: minhtt ; password: 161718}
    - Client: {user_name: duongnn ; password: 123456}

    
  - Clone project từ github : git clone https://github.com/tanminhtran168/spotify.git

  - Sau khi clone project, mở PGAdmin4. Nhập master password để truy cập vào hệ thống.  
  - Chọn server là PostgreSQL, nhập server password để có thể truy cập vào trang quản lý database.  
  - Tại Database, chọn Create/Database… Đặt tên cho Database là spotify.  
  - Mở DBeaver, chọn Database/New Database Connection, chọn PostgreSQL. Trong hộp thoại, điền các thông tin Host (localhost), Port, Database (spotify), Username và Password.  
  - Chuột phải vào Database vừa tạo, chọn Tools/Restore. Chọn Format là Tar, tích chọn 2 tùy chọn “Clean (drop) database objects before recreating them” và “Discard objects owner”. Chọn file backup là file dump-spotify-202202242233.tar nằm trong file main đã clone về trước đó. Sau đó bấm Start để cấu hình database. 

  - Kết nối Database vừa tạo với Nodejs 
   - Tạo file config.js   
   - Sửa file config.js theo files config-example.js, chỉnh sửa tên tên user, tên database và password theo cấu hình của máy. 

  - Trong Terminal:   
      > npm i   
      > npm start  
  - Hệ thống sẽ chạy trên localhost:5000  
