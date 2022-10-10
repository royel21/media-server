@echo off
rmdir /s /q .\server\public\user
rmdir /s /q .\server\public\admin

move /y .\server\public\static/user  .\server\public\
move /y .\server\public\static/admin .\server\public\