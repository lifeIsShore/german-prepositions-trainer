"""
Wraps every <table class="example-table"> in a <div class="table-scroll">
across the specified HTML files.
"""
import sys
import os

files = [
    r"c:\Users\ahmty\Desktop\SW-PROJECTS\DE app\pages\grammar.html",
    r"c:\Users\ahmty\Desktop\SW-PROJECTS\DE app\pages\connectors.html",
]

OPEN_TABLE = '<table class="example-table">'
CLOSE_TABLE = '</table>'
OPEN_WRAP = '<div class="table-scroll">' + OPEN_TABLE
CLOSE_WRAP = CLOSE_TABLE + '</div>'

for path in files:
    if not os.path.exists(path):
        print(f"SKIP (not found): {path}")
        continue
    with open(path, encoding="utf-8") as f:
        content = f.read()
    # Avoid double-wrapping if already done
    if '<div class="table-scroll">' in content:
        print(f"ALREADY WRAPPED: {path}")
        continue
    count_tables = content.count(OPEN_TABLE)
    content = content.replace(OPEN_TABLE, OPEN_WRAP)
    content = content.replace(CLOSE_TABLE, CLOSE_WRAP)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"DONE: {path}  ({count_tables} table(s) wrapped)")
