@echo off
setlocal
chcp 65001 >nul

rem Get the current folder path
set "folder=%~dp0"
if "%folder:~-1%"=="\" set "folder=%folder:~0,-1%"

set "CompanyKey=HKCU\SOFTWARE\SPEED\MOTIF"
@REM set "CompanyKey=HKCU\SOFTWARE\SPPED\MOTIF"

rem Add the "Root" DWORD value (0)
reg add %CompanyKey% /v "Root" /t REG_SZ /d "%folder%\\" /f


rem Add the "CDDrive" string value
reg add %CompanyKey% /v "CDDrive" /t REG_SZ /d "D:\\" /f


rem Add the "Mode" string value
reg add %CompanyKey% /v "CDDrive" /t REG_SZ /d "MAXIMUM" /f

rem Add the "Program" string value
reg add %CompanyKey% /v "Program" /t REG_SZ /d "%folder%\\" /f

rem Add the "Save" string value
reg add %CompanyKey% /v "Save" /t REG_SZ /d "%folder%\Save\\" /f

rem Add the "Parts" string value
reg add %CompanyKey% /v "Parts" /t REG_SZ /d "%folder%\parts\\" /f

rem Add the "Picture" string value
reg add %CompanyKey% /v "Picture" /t REG_SZ /d "%folder%\pic\\" /f

rem Add the "Sby" string value
reg add %CompanyKey% /v "Sby" /t REG_SZ /d "%folder%\sby\\" /f

rem Add the "Sound" string value
reg add %CompanyKey% /v "Sound" /t REG_SZ /d "%folder%\sound\\" /f

rem Add the "Effect" string value
reg add %CompanyKey% /v "Effect" /t REG_SZ /d "%folder%\effect\\" /f

rem Add the "Pcm" string value
reg add %CompanyKey% /v "Pcm" /t REG_SZ /d "%folder%\umpro" /f

rem Add the "Voi" string value
reg add %CompanyKey% /v "Voi" /t REG_SZ /d "%folder%\voice\\" /f


endlocal