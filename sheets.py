#!/usr/bin/python3

import os

import gspread
from oauth2client.client import GoogleCredentials

credentials = GoogleCredentials.get_application_default()
credentials = credentials.create_scoped(['https://spreadsheets.google.com/feeds'])

gc = gspread.authorize(credentials)

wks = gc.open_by_key(os.environ['LINEAGEOS_CVE_SHEET_ID']).sheet1

cves = []

values = wks.row_values(1)
for v in values:
  if v[:3] == "CVE":
    cves.append(v.replace('\n', '-').replace(' ', ''))
cves = sorted(cves)

cvefile = 'cves.txt'
try:
  os.unlink(cvefile)
except OSError:
  pass

f = open(cvefile, 'w')

for c in cves:
  f.write("%s\n" % c)
