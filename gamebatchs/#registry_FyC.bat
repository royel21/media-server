@echo off
setlocal
chcp 65001 >nul

rem Get the current folder path
set "folder=%~dp0"
if "%folder:~-1%"=="\" set "folder=%folder:~0,-1%"

rem Add the "SetupFlag" DWORD value (1)
reg add "HKCU\SOFTWARE\F&C\ADWin32\RAINBOW" /v "SetupFlag" /t REG_DWORD /d 1 /f

rem Add the "Group1" string value
reg add "HKCU\SOFTWARE\F&C\ADWin32\RAINBOW" /v "Group1" /t REG_SZ /d "%folder%" /f

rem Add the "Group2" string value
reg add "HKCU\SOFTWARE\F&C\ADWin32\RAINBOW" /v "Group2" /t REG_SZ /d "%folder%" /f

rem Add the "Group3" string value
reg add "HKCU\SOFTWARE\F&C\ADWin32\RAINBOW" /v "Group3" /t REG_SZ /d "%folder%" /f

rem Add the "GroupPath" string value
reg add "HKCU\SOFTWARE\F&C\ADWin32\RAINBOW" /v "GroupPath" /t REG_SZ /d "%folder%" /f

endlocal