# Spotify

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
    Admin : {user_name: minhtt ; password: 161718}
    Client: {user_name: duongnn ; password: 123456}

    git clone https://github.com/tanminhtran168/spotify.git

    Cài đặt Dbeaver phiên bản 21.3.0 và PostgreSQL 14.
    Sau khi cài đặt PostgreSQL, mở PGAdmin4. Nhập master password để truy cập vào hệ thống.
    Chọn server là PostgreSQL, nhập server password để có thể truy cập vào trang quản lý database.
    Tại Database, chọn Create/Database… Đặt tên cho Database là spotify, sau đó bấm Save.
    Tại DBeaver, chọn Database/New Database Connection, sau đó chọn hệ quản trị PostgreSQL. Khi đó Dbeaver sẽ mở ra hộp thoại nhập các thông tin về server cần kết nối. Điền đầy đủ các thông tin về Host (localhost), Port, Database (spotify), Username và Password.
    Chuột phải vào Database vừa tạo, chọn Tools/Restore. Chọn Format là Tar, tích chọn 2 tùy chọn “Clean (drop) database objects before recreating  them” và “Discard objects owner”. Chọn file backup là file dump-spotify-202202242233.tar nằm trong file main đã clone về trước đó. Sau đó bấm Start để máy tự cấu hình database. Sau khi cấu hình xong máy có thể sẽ xuất hiện cảnh báo. Ta có thể bỏ qua cảnh báo đó.

    Cài đặt nodejs 
    Trong Terminal của IDE: 
        npm i 
        npm start
    Hệ thống sẽ chạy trên localhost:5000