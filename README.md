# A Media Server for mangas and videos

# Features

### Complete open source

- Stream Image from zip file
- Stream mp4, mkv videos
- Save recent viewed file
- Continue read on
- Can use mariadb (mysql) or sqlite for database
- Allow save to favorite with multiple favorite for videos and mangas
- Content manager for admin
- manga downloader with puppeeter

# Server Configurations

### -> we need a .env file with the following Variables.

- NODE_ENV=production **#Tell Nodejs we are in production**
- HOST=localhost **#for IP Address for external access**
- PORT=8180 **# for express server when in production**
- SESSION_NAME=rcmediaserver **# name for express session**
- SESSION_SECRET=rcmediaserver **# Secret for express session**

### -> database configuration optional

- CONNECTOR=sqlite **# madiadb or sqlite**
- DB_NAME=mediaserverdb **# database name**
- DB_HOST=localhost **# ip of the mariadb server**
- DB_USER=root **# mariadb username**
- DB_PASSWORD=root **# mariadb password**

### -> For dev mode optional

- USE_DEV=false **# optional run in dev mode**
- VITE_PORT=8084 **# optional for vite server**
- VITE_HOST=localhost **# optional for vite server**
- DEV_HOST=localhost **# optional**
- DEV_PORT=8083 **# optional**
- DEV_DB_HOST=localhost **# mariadb server ip, use for dev mode**
