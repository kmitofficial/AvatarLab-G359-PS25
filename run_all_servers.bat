@echo off
wt -w 0 ^
  nt -p "Windows PowerShell" -d ".\AVATAR\XTTS\TTS" powershell -NoExit "uvicorn main:app --host 0.0.0.0 --port 8001" ; ^
  nt -p "Windows PowerShell" -d ".\AVATAR\sad" powershell -NoExit "uvicorn talk:app --host 0.0.0.0 --port 8002" ; ^
  nt -p "Windows PowerShell" -d ".\AVATAR" powershell -NoExit "uvicorn back:app --host 0.0.0.0 --port 8003" ; ^
  nt -p "Windows PowerShell" -d ".\frontend" powershell -NoExit "npm start" ; ^
  nt -p "Windows PowerShell" -d ".\backend\src" powershell -NoExit "node server.js"
