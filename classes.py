#!/usr/bin/python3

from mongoengine import *

class Config(Document):
  last_update = DateTimeField(required=True)

class CVE(Document):
  cve_name = StringField(required=True)

class Kernel(Document):
  repo_name = StringField(required=True)
  last_github_update = DateTimeField(required=True)
  vendor = StringField(required=True)
  device = StringField(required=True)

class Status(Document):
  short_id = IntField(required=True)
  text = StringField(required=True)

class Patches(Document):
  kernel = ObjectIdField()
  cve = ObjectIdField()
  status = ObjectIdField()

class Links(Document):
  cve_id = ObjectIdField()
  link = StringField(required=True)
