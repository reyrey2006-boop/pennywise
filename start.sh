#!/usr/bin/env bash
echo "======================================================================"
echo "  PennyWise — Student Allowance and Expense Management System"
echo "  Davao Oriental State University (DOrSU)"
echo "======================================================================"
echo ""
echo "Starting local web server..."
echo "Open your browser at: http://localhost:8000"
echo "Press Ctrl+C to stop the server."
echo ""

if which xdg-open > /dev/null; then
  xdg-open "http://localhost:8000" &
elif which open > /dev/null; then
  open "http://localhost:8000" &
fi

python3 -m http.server 8000 2>/dev/null || python -m http.server 8000
