@echo off
setlocal
chcp 65001 >nul

rem Get the current folder path
set "folder=%~dp0"
if "%folder:~-1%"=="\" set "folder=%folder:~0,-1%"

set "CompanyKey=HKCU\SOFTWARE\TinkerBell\okite"
@REM set "CompanyKey=HKCU\SOFTWARE\SPPED\MOTIF"

rem Add the "(Default)" string value
reg add %CompanyKey% /v "(Default)" /t REG_SZ /d "%folder%" /f

rem Add the "BGM" DWORD value (0)
reg add %CompanyKey% /v "BGM" /t REG_DWORD /d 0 /f

rem Add the "VOICE" DWORD value (0)
reg add %CompanyKey% /v "VOICE" /t REG_DWORD /d 0 /f

rem Add the "SE" DWORD value (0)
reg add %CompanyKey% /v "SE" /t REG_DWORD /d 0 /f

rem Add the "VOICE_SKIP" DWORD value (1)
reg add %CompanyKey% /v "VOICE_SKIP" /t REG_DWORD /d 1 /f

rem Add the "Fonnt" string value
reg add %CompanyKey% /v "Fonnt" /t REG_SZ /d "ＭＳ ゴシック" /f

rem Add the "ScreenMode" DWORD value (0)
reg add %CompanyKey% /v "ScreenMode" /t REG_DWORD /d 0 /f

rem Add the "TextSpeed" DWORD value (0)
reg add %CompanyKey% /v "TextSpeed" /t REG_DWORD /d 0 /f

rem Add the "SkipType" DWORD value (2)
reg add %CompanyKey% /v "SkipType" /t REG_DWORD /d 2 /f

rem Add the "RedrawType" DWORD value (0)
reg add %CompanyKey% /v "RedrawType" /t REG_DWORD /d 0 /f


endlocal