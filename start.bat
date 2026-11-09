@echo off
title PennyWise - Student Allowance & Expense Management System
echo ======================================================================
echo   PennyWise — Student Allowance and Expense Management System
echo   Davao Oriental State University (DOrSU)
echo ======================================================================
echo.
echo Starting local web server...
echo Serving at: http://localhost:8000
echo.
echo Press Ctrl+C in this window when you want to stop the server.
echo.

start http://localhost:8000
python -m http.server 8000 2>nul || python3 -m http.server 8000 2>nul || py -m http.server 8000
pause
