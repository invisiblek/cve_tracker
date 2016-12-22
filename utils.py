#!/usr/bin/python3

import app
import datetime
import sqlite3

from github import Github

def createDB():
  conn = sqlite3.connect(app.dbfile)
  c = conn.cursor()

  # Create tables
  c.execute('CREATE TABLE config (last_update DATETIME, db_version INTEGER);')
  c.execute('CREATE TABLE cve (id INTEGER PRIMARY KEY, cve TEXT);')
  c.execute('CREATE TABLE status (id INTEGER PRIMARY KEY, status TEXT);')
  c.execute('CREATE TABLE kernel (id INTEGER PRIMARY KEY, repo TEXT);')
  c.execute('CREATE TABLE patches (id INTEGER PRIMARY KEY, kernel_id INTEGER, cve_id INTEGER, status_id INTEGER);')
  conn.commit()

  # Insert initial data
  c.execute('INSERT INTO config (last_update, db_version) VALUES (?, ?)', (str(datetime.datetime.now()), 1))

  f = open('cves.txt')
  while True:
    x = f.readline().rstrip()
    if not x: break
    c.execute('INSERT INTO cve (id, cve) VALUES (NULL, "' + x + '");')

  f = open('statuses.txt')
  while True:
    x = f.readline().rstrip()
    if not x: break
    c.execute('INSERT INTO status (id, status) VALUES (?, ?)', (x.split('|')[0], x.split('|')[1]))

  conn.commit()
  conn.close()

  updateDB()

  return

def updateDB():
  version = getDBVersion()

  conn = sqlite3.connect(app.dbfile)
  c = conn.cursor()

  if version < 2:
    c.execute('ALTER TABLE kernel ADD last_github_update DATETIME')
    conn.commit()
  if version < 3:
    c.execute('ALTER TABLE kernel ADD vendor STRING')
    c.execute('ALTER TABLE kernel ADD name STRING')
    conn.commit()

    for row in c.execute('SELECT * FROM kernel'):
      v, n = getVendorNameFromRepo(row['repo'])
      if v is not "error" and n is not "error":
        c.execute('UPDATE kernel SET vendor = ?, name = ? WHERE id = ?', v, n, row['id'])

  c.execute('UPDATE config set db_version=?', str(app.db_version))
  conn.commit()

  conn.close()

  return

def getVendorNameFromRepo(repo):
  v = "error"
  n = "error"
  if len(repo.split('_')) < 2:
    # kernel-lge-mako
    v = repo.split('-')[0]
    n = repo.split('-')[2]
  elif len(repo.split('_')) == 4:
    # android_kernel_samsung_manta
    v = repo.split('_')[2]
    n = repo.split('_')[3]

  return v, n

def getStatusIDs():
  conn = sqlite3.connect(app.dbfile)
  c = conn.cursor()
  ids = {}

  i = 0
  for row in c.execute('SELECT * FROM status'):
    ids[i] = {"id": row[0], "status": row[1]};
    i += 1

  conn.close()
  return ids

def getCVEs():
  conn = sqlite3.connect(app.dbfile)
  c = conn.cursor()
  cves = {}

  i = 0
  for row in c.execute('SELECT * FROM cve ORDER BY cve'):
    cves[i] = {"id": row[0], "cve": row[1]}
    i += 1

  conn.close()
  return cves

def getKernelsFromDB():
  conn = sqlite3.connect(app.dbfile)
  c = conn.cursor()
  kernels = {}

  i = 0
  for row in c.execute('SELECT * FROM kernel ORDER BY vendor, name'):
    kernels[i] = {"id": row[0], "repo": row[1], "last_github_update": row[2], "vendor": row[3], "name": row[4]}
    i += 1

  conn.close()

  return kernels

def getDBVersion():
  conn = sqlite3.connect(app.dbfile)
  c = conn.cursor()

  c.execute('SELECT db_version FROM config')
  v = c.fetchone()[0]
  conn.close()

  return v

def getKernelTableFromGithub(config):
  print("Updating kernel list from github...this may take a long time...")
  dbKernels = getKernelsFromDB()

  u = config['githubusername']
  p = config['githubtoken']
  g = Github(u, p)

  org = g.get_organization('LineageOS')

  conn = sqlite3.connect(app.dbfile)
  c = conn.cursor()

  for repo in org.get_repos():
    if "android_kernel_" in repo.name or "-kernel-" in repo.name:
      if repo.name not in dbKernels.values():
        v, n = getVendorNameFromRepo(repo.name)
        if v is not "error" and n is not "error":
          c.execute('INSERT INTO kernel (repo, last_github_update, vendor, name) VALUES(?, ?, ?, ?)', (repo.name, repo.updated_at, v, n))
          conn.commit()
          initializeKernelPatches(repo.name, conn)

  conn.close()
  print("Done!")
  return

def initializeKernelPatches(repo, conn):
  k = getKernelByRepo(repo)
  allCVEs = getCVEs()
  for c in allCVEs:
    conn.execute('INSERT INTO patches (kernel_id, cve_id, status_id) VALUES (?, ?, 1)', (k['id'], allCVEs[c]['id']))
  conn.commit()

def getKernelByRepo(repo):
  conn = sqlite3.connect(app.dbfile)
  c = conn.cursor()

  c.execute('SELECT * FROM kernel WHERE repo = ?', (repo,))
  row = c.fetchone()
  kernel = {"id": row[0], "repo": row[1], "last_github_update": row[2], "vendor": row[3], "name": row[4]}
  conn.close()

  return kernel

def getNumberOfPatchedByRepo(repo):
  print(repo)
  k = getKernelByRepo(repo)
  return getNumberOfPatchedByRepoId(k['id'])

def getNumberOfPatchedByRepoId(id):
  conn = sqlite3.connect(app.dbfile)
  c = conn.cursor()

  c.execute('SELECT count(*) FROM patches WHERE kernel_id = ? AND status_id = ?', (id, 2))
  num = c.fetchone()[0]
  conn.close()

  return num

def getPatchesByRepo(repo):
  k = getKernelByRepo(repo)

  conn = sqlite3.connect(app.dbfile)
  c = conn.cursor()
  patches = {}

  i = 0
  for row in c.execute('SELECT * FROM patches WHERE kernel_id = ?', (k['id'],)):
    patches[i] = {"id": row[0], "kernel_id": row[1], "cve_id": row[2], "status_id": row[3]}
    i += 1

  conn.close()
  return patches

def updatePatchStatus(kernel_id, cve_id, status_id):
  conn = sqlite3.connect(app.dbfile)

  c = conn.cursor()
  conn.execute('UPDATE patches SET status_id = ? WHERE kernel_id = ? AND cve_id = ?', (status_id, kernel_id, cve_id))
  conn.commit()
  conn.close()
