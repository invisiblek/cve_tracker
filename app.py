#!/usr/bin/python3

import json
import os
import sys

import utils

from classes import *
from flask import Flask, abort, jsonify, render_template, request

configfile = "options.json"
devicefile = "kernels.json"
forceDBUpdate = False

app = Flask(__name__)

if not os.path.isfile(configfile):
  print("Could not find " + configfile + " aborting!")
  sys.exit()

with open(configfile) as config_file:
  config = json.load(config_file)

with open(devicefile) as device_file:
  devices = json.load(device_file)

connect('cve_tracker', host=config['dbhost'])

@app.route("/")
def index():
    return render_template('index.html', kernels=Kernel.objects().order_by('vendor', 'device'))

@app.route("/<string:k>")
def kernel(k):
    try:
        kernel = Kernel.objects.get(repo_name=k)
    except:
        abort(404)
    patches = Patches.objects(kernel=Kernel.objects.get(repo_name=k).id)
    patched = len(Patches.objects(kernel=Kernel.objects.get(repo_name=k).id, status=Status.objects.get(text='patched').id))
    if k in devices:
      devs = devices[k]
    else:
      devs = ['No officially supported devices!']
    return render_template('kernel.html',
                           kernel = kernel,
                           patched = patched,
                           cves = CVE.objects().order_by('cve_name'),
                           status_ids = Status.objects(),
                           patches = patches,
                           devices = devs)

@app.route("/update", methods=['POST'])
def update():
  r = request.get_json()
  k = r['kernel_id'];
  c = r['cve_id'];
  s = r['status_id'];

  Patches.objects(kernel=k, cve=c).update(status=Status.objects.get(short_id=s).id)
  patched = len(Patches.objects(kernel=k, status=Status.objects.get(text='patched').id))
  return jsonify({'error': 'success', 'patched': patched})

if __name__ == "__main__":
  if "port" in config:
    port=config['port']
  else:
    port=5000

  # TODO: add something to check github every day for new kernel repos and call getKernelTableFromGithub()
  app.run(host="0.0.0.0", debug=True, port=port)
