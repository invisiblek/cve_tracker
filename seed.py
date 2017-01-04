#!/usr/bin/python3

import json
import os

from classes import *
from mongoengine import *
from utils import *

configfile = 'options.json'

if not os.path.isfile(configfile):
  print('Could not find ' + configfile + ' aborting!')
  sys.exit()

with open(configfile) as config_file:
  config = json.load(config_file)

db = connect('cve_tracker', host=config['dbhost'])
db.drop_database('cve_tracker')

f = open('cves.txt')
while True:
  x = f.readline().rstrip()
  if not x: break
  CVE(cve_name=x).save()

f = open('statuses.txt')
while True:
  x = f.readline().rstrip()
  if not x: break
  Status(short_id=x.split('|')[0], text=x.split('|')[1]).save()

getKernelTableFromGithub()
