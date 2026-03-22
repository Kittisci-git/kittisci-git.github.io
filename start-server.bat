@echo off
cd /d "%~dp0"
python -m http.server 8080
start http://localhost:8080/content/
pause