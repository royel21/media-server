@echo off
setlocal
chcp 65001 >nul

rem Get the current folder path
set "folder=%~dp0"
if "%folder:~-1%"=="\" set "folder=%folder:~0,-1%"

rem Add the "InstMode" DWORD value (0)
reg add "HKCU\SOFTWARE\ボンボンカンパニー\貧は僕らの福の神" /v "InstMode" /t REG_DWORD /d 0 /f

rem Add the "InstPath" string value
reg add "HKCU\SOFTWARE\ボンボンカンパニー\貧は僕らの福の神" /v "InstPath" /t REG_SZ /d "%folder%" /f


endlocal