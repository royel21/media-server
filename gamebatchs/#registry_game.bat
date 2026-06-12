@echo off
setlocal
chcp 65001 >nul

rem Get the current folder path
set "folder=%~dp0"
if "%folder:~-1%"=="\" set "folder=%folder:~0,-1%"

set "CompanyKey=HKCU\SOFTWARE\SPEED\MOTIF"
@REM set "CompanyKey=HKCU\SOFTWARE\SPPED\MOTIF"

rem Add the "InstMode" DWORD value (0)
reg add %CompanyKey% /v "InstMode" /t REG_DWORD /d 0 /f

rem Add the "InstPath" string value
reg add %CompanyKey% /v "InstPath" /t REG_SZ /d "%folder%" /f


endlocal