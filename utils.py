#!/usr/bin/python3

import app
import datetime

from classes import *
from github import Github
from mongoengine import *

connect(app.config['dbname'], host=app.config['dbhost'])

def getVendorNameFromRepo(repo):
  v = "error"
  n = "error"
  if len(repo.split('_')) < 2:
    # lge-kernel-mako
    v = repo.split('-')[0]
    n = repo.split('-')[2]
  elif len(repo.split('_')) == 4:
    # android_kernel_samsung_manta
    v = repo.split('_')[2]
    n = repo.split('_')[3]

  return v, n

def getKernelTableFromGithub():
  print("Updating kernel list from github...this may take a long time...")

  u = app.config['githubusername']
  p = app.config['githubtoken']
  g = Github(u, p)

  org = g.get_organization('LineageOS')

  for repo in org.get_repos():
    if "android_kernel_" in repo.name or "-kernel-" in repo.name:
      if repo.name not in Kernel.objects().order_by('repo_name'):
        v, n = getVendorNameFromRepo(repo.name)
        if v is not "error" and n is not "error":
          Kernel(repo_name=repo.name, last_github_update=repo.updated_at, vendor=v, device=n).save()
          for c in CVE.objects():
            Patches(cve=c.id, kernel=Kernel.objects.get(repo_name=repo.name).id, status=Status.objects.get(text='unpatched').id).save()

  print("Done!")
  return
