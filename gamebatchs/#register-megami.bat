@echo off
setlocal

rem Get the current folder path
set "folder=%~dp0"
if "%folder:~-1%"=="\" set "folder=%folder:~0,-1%"

set "CompanyKey=HKCU\SOFTWARE\Megami\TimouYuugi"

rem Add the "Directory" string value
reg add "%CompanyKey%" /v "Directory" /t REG_SZ /d "%folder%" /f

rem Add the "FullSetup" DWORD value (0)
reg add "%CompanyKey%" /v "FullSetup" /t REG_DWORD /d /d 0 /f

rem add the "Install" string value
reg add "%CompanyKey%" /v "Install" /t REG_SZ /d "%folder%\\" /f

rem add the "BackGround" string value
reg add "%CompanyKey%" /v "BackGround" /t REG_SZ /d "%folder%\Data\\Graphic\\BackGround\\" /f

rem add the "Cg" string value
reg add "%CompanyKey%" /v "Cg" /t REG_SZ /d "%folder%\Data\\Graphic\\Cg\\" /f

rem add the "Charactor" string value
reg add "%CompanyKey%" /v "Charactor" /t REG_SZ /d "%folder%\Data\\Graphic\\Charactor\\" /f

rem add the "Item" string value
reg add "%CompanyKey%" /v "Item" /t REG_SZ /d "%folder%\Data\\Graphic\\Item\\" /f

rem add the "Sprite" string value
reg add "%CompanyKey%" /v "Sprite" /t REG_SZ /d "%folder%\Data\\Graphic\\Sprite\\" /f

rem add the "Thum" string value
reg add "%CompanyKey%" /v "Thum" /t REG_SZ /d "%folder%\Data\\Graphic\\Thum\\" /f

rem add the "Scenario" string value
reg add "%CompanyKey%" /v "Scenario" /t REG_SZ /d "%folder%\Data\\Scenario\\" /f

rem add the "Wave" string value
reg add "%CompanyKey%" /v "Wave" /t REG_SZ /d "%folder%\Data\\Wave\\" /f

rem add the "Midi" string value
reg add "%CompanyKey%" /v "Midi" /t REG_SZ /d "%folder%\Data\\Midi\\" /f

rem add the "Save" string value
reg add "%CompanyKey%" /v "Save" /t REG_SZ /d "%folder%\Data\\" /f

rem add the "Setup" string value
reg add "%CompanyKey%" /v "Setup" /t REG_SZ /d "C:" /f

rem Add the "Completed" DWORD value (1)
reg add "%CompanyKey%" /v "Completed" /t REG_DWORD /d /d 0 /f

endlocal