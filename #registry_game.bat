@echo off
setlocal
chcp 65001 >nul

rem Get the current folder path
set "folder=%~dp0"
if "%folder:~-1%"=="\" set "folder=%folder:~0,-1%"

rem Add the "DataDir" string value
reg add "HKCU\SOFTWARE\CIRCUS\CDCD2" /v "DataDir" /t REG_SZ /d "%folder%" /f

rem Add the "SaveDir" string value
reg add "HKCU\SOFTWARE\CIRCUS\CDCD2" /v "SaveDir" /t REG_SZ /d "%folder%\savedata" /f

rem Add the "InstallKey" string value
reg add "HKCU\SOFTWARE\CIRCUS\CDCD2" /v "SaveDir" /t REG_SZ /d "CF73QX7IIMW" /f

rem Add the "ActMail" string value
reg add "HKCU\SOFTWARE\CIRCUS\CDCD2" /v "ActMail" /t REG_SZ /d "always@smi.le" /f

rem Add the "ActKey" string value
reg add "HKCU\SOFTWARE\CIRCUS\CDCD2" /v "ActKey" /t REG_SZ /d "CF73QX7IIMW" /f

endlocal