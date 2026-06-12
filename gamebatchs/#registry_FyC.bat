@echo off
setlocal
chcp 65001 >nul

rem Get the current folder path
set "folder=%~dp0"
if "%folder:~-1%"=="\" set "folder=%folder:~0,-1%"

set "CompanyKey=HKCU\SOFTWARE\F&C\ADWin32\RAINBOW"

rem Add the "Directory" string value
reg add "%CompanyKey%" /v "Directory" /t REG_SZ /d "%folder%" /f

rem Add the "Execute" string value
reg add "%CompanyKey%" /v "Execute" /t REG_SZ /d "%folder%\ADVWIN32.EXE" /f

rem Add the "Install" DWORD value (1)
reg add "%CompanyKey%" /v "Install" /t REG_DWORD /d /d 1 /f

rem Add the "Uninstall" string value
reg add "%CompanyKey%" /v "Uninstall" /t REG_SZ /d "%folder%\UNINST.EXE" /f

rem Add the "UserCount" DWORD value (1)
reg add "%CompanyKey%" /v "UserCount" /t REG_DWORD /d 1 /f

endlocal