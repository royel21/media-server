@echo off
setlocal
chcp 65001 >nul

rem Get the current folder path
set "folder=%~dp0"
if "%folder:~-1%"=="\" set "folder=%folder:~0,-1%"

set "CompanyKey=HKCU\SOFTWARE\HAOH.INI\TUUKIN2"

rem Add the "CDROM" string value
reg add "%CompanyKey%" /v "CDROM" /t REG_SZ /d "C:\\" /f

rem Add the "Installed" DWORD value (1)
reg add "%CompanyKey%" /v "Installed" /t REG_DWORD /d /d 1 /f

rem Add the "SaveDir" string value
reg add "%CompanyKey%" /v "SaveDir" /t REG_SZ /d "%folder%" /f

rem Add the "WinShow" string value
reg add "%CompanyKey%" /v "WinShow" /t REG_SZ /d "Zoomed" /f

rem Add the "InstModel" DWORD value (3)
reg add "%CompanyKey%" /v "InstModel" /t REG_DWORD /d 3 /f

endlocal