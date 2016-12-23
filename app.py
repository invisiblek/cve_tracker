#!/usr/bin/python3

import json
import os
import sys

import utils

from flask import Flask, abort, jsonify, render_template, request

configfile = "options.json"
devicefile = "kernels.json"
dbfile = "sqlite.db"

db_version = 3
forceDBUpdate = False

status_ids = {}
allCVEs = {}
kernels = {}

app = Flask(__name__)

if not os.path.isfile(configfile):
  print("Could not find " + configfile + " aborting!")
  sys.exit()

with open(configfile) as config_file:
  config = json.load(config_file)

with open(devicefile) as device_file:
  devices = json.load(device_file)

@app.route("/")
def index():
    return render_template('index.html', kernels = kernels)

@app.route("/<string:k>")
def kernel(k):
    kernel = utils.getKernelByRepo(k)
    if kernel is None:
      abort(404)
    patches = utils.getPatchesByRepo(k)
    patched = utils.getNumberOfPatchedByRepoId(k)
    if k in devices:
      devs = devices[k]
    else:
      devs = ['No officially supported devices!']
    return render_template('kernel.html', kernel = kernel, patched = patched, cves = allCVEs, status_ids = status_ids, patches = patches, devices = devs)

@app.route("/update", methods=['POST'])
def update():
  r = request.get_json()
  k = r['kernel_id'];
  c = r['cve_id'];
  s = r['status_id'];
  utils.updatePatchStatus(k, c, s)
  patched = utils.getNumberOfPatchedByRepoId(k)
  return jsonify({'error': 'success', 'patched': patched})

if __name__ == "__main__":
  if not os.path.isfile(dbfile):
    print("No database found. Creating one...")
    utils.createDB()

  if utils.getDBVersion() < db_version:
    print("Database version out of date, updating...")
    utils.updateDB()
    utils.getKernelTableFromGithub()

  if "port" in config:
    port=config['port']
  else:
    port=5000

  status_ids = utils.getStatusIDs()
  allCVEs = utils.getCVEs()
  kernels = utils.getKernelsFromDB()

  # TODO: add something to check github every day for new kernel repos and call getKernelTableFromGithub()
  app.run(host="0.0.0.0", debug=True, port=port)
