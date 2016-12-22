var forceDBUpdate = false;
var quickGithub = false;  // flag to only grab one page from github, for testing purposes only

var fs = require('fs');
var options = JSON.parse(fs.readFileSync('options.json', 'utf8'));
var database = "sqlite.db";
var newdb = !fs.existsSync(database);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(database);
var db_version = 3;

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var GitHubApi = require("github");
var github = new GitHubApi();

github.authenticate({
  type: "oauth",
  token: options.githubtoken,
});

var dbKernels = new Array();
var ghKernels = new Array();
var allCVEs = new Array();

function checkRefreshDB() {
  db.serialize(function() {
    db.all('SELECT last_update FROM config;', function(err, results) {
      next_update = new Date(results[0].last_update);
      next_update.setDate(next_update.getDate() + 1);
      if (next_update < new Date() || forceDBUpdate) {
        refreshDB();
        forceDBUpdate = false;
      }
    });
  });
}

function refreshDB() {
  untrackedKernels = [];

  for (var i = 0; i < ghKernels.length; i++) {
    if (dbKernels.findIndex((k) => k.repo === ghKernels[i].repo) < 0) {
      untrackedKernels.push(ghKernels[i]);
    }
  }

  if (untrackedKernels.length > 0) {
    db.serialize(function() {
      var stmt = db.prepare("INSERT INTO kernel (id, repo, last_github_update, vendor, name) VALUES (NULL, ?, ?, ?, ?)");
      for (var i = 0; i < untrackedKernels.length; i++) {
        stmt.run(untrackedKernels[i].repo, untrackedKernels[i].updated_at, untrackedKernels[i].vendor, untrackedKernels[i].name);
      }
      stmt.finalize();
    });

    getKernelsFromDB();
  }
}

function getKernelsFromDB() {
  dbKernels = [];
  now = new Date();
  cutoffDate = new Date(new Date(now).setMonth(now.getMonth() - 6));
  db.serialize(function() {
    db.all('SELECT * FROM kernel', function(err, results) {
      for (var i = 0; i < results.length; i++) {
        if (new Date(results[i].last_github_update) > cutoffDate) {
          dbKernels.push(results[i]);
        }
      }
      dbKernels.sort(function(a,b) {
        if (a.vendor == b.vendor) {
          return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
        }
        return (a.vendor > b.vendor) ? 1 : -1;
      });
      checkRefreshDB();
    });
  });
}

function getVendorNameFromRepo(repo) {
  var vendor, name;
  if (repo.indexOf("_") == -1) {
    // kernel-lge-mako
    vendor = repo.split("-")[0];
    name = repo.split("-")[2];
  } else {
    // android_kernel_samsung_manta
    vendor = repo.split("_")[2];
    name = repo.split("_")[3];
  }
  return {vendor: vendor, name: name};
}

function getKernelsFromGithub() {
  ghKernels = [];
  process.stdout.write("Retrieving kernel repos from github (this may take a little bit)...");
  req = github.repos.getForOrg({ org: "LineageOS", per_page: 100 }, getRepos);

  function getRepos(err, ret) {
    if (err) {
      console.log("Failed to grab page from Github! ", err);
      console.log(ghKernels);
      return;
    }
    for (var i = 0; i < ret.length; i++) {
      repo = ret[i];
      if (repo.name.indexOf("android_kernel_") == 0 || repo.name.split('-')[1] == "kernel") {
        var data = getVendorNameFromRepo(repo.name);
        ghKernels.push({repo: repo.name, updated_at: repo.updated_at,
          vendor: data.vendor, name: data.name});
      }
    }

    if (github.hasNextPage(ret) && !quickGithub) {
      github.getNextPage(ret, getRepos);
    } else {
      process.stdout.write("Done!\n");
      getStatusIDs();
      getCVEs();
      getKernelsFromDB();
    }
  }
}

function getStatusIDs() {
  statusIDs = [];
  db.serialize(function() {
    db.all('SELECT * FROM status;', function(err, results) {
      statusIDs = results;
      statusIDs.sort(function(a,b) {return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);});
    });
  });
}

function getCVEs() {
  allCVEs = [];
  db.serialize(function() {
    db.all('SELECT * FROM cve;', function(err, results) {
      allCVEs = results;
      allCVEs.sort(function(a,b) {return (a.cve > b.cve) ? 1 : ((b.cve > a.cve) ? -1 : 0);});
    });
  });
}

function getStatuesForKernel(res, kernel) {
  var patched = 0;
  statuses = new Array();
  db.serialize(function() {
    db.all('SELECT count(*) as c FROM patches WHERE kernel_id = "' + kernel.id + '" AND status_id = ' + 2, function(err, results) {
      patched = parseInt(results[0].c);
    });
    db.all('SELECT * FROM patches WHERE kernel_id = "' + kernel.id + '"', function(err, results) {
      statuses = results;
      res.render("kernel", { kernel: kernel, cves: allCVEs, statuses: statuses, statusIDs: statusIDs, patched: patched });
    });
  });
}

app.post('/update', function(req, res) {
  k = parseInt(req.body.kernel);
  s = parseInt(req.body.newStatus);
  c = parseInt(req.body.cve);

  if (req.body.kernel && req.body.newStatus && req.body.cve) {
    if (s > 0 && s < 6) {
      db.all('SELECT * FROM patches WHERE kernel_id = ' + k + ' AND cve_id = ' + c, function(err, results) {
        if (!err) {
          if (results.length == 0) {
            // TODO: add a check to make sure the kernel_id and cve_id exist before just shoving a new record in
            db.run('INSERT into patches (id, kernel_id, cve_id, status_id) VALUES (NULL, ' + k + ', ' + c + ', ' + s + ')')
          } else if (results.length == 1) {
            db.run('UPDATE patches SET status_id = ' + s + ' WHERE kernel_id = ' + k + ' AND cve_id = ' + c)
          } else {
            // Somehow if it got more than one record, clean this shit up. Probably can't happen but let's be sure
            db.run('DELETE from patches WHERE kernel_id = "' + k + '" AND cve_id = "' + c + '"')
            db.run('INSERT into patches (id, kernel_id, cve_id, status_id) VALUES (NULL, ' + k + ', ' + c + ', ' + s + ')')
          }
          var patched = 0;
          db.all('SELECT count(*) as c FROM patches WHERE kernel_id = ' + k + ' AND status_id = ' + 2, function(err, results) {
            patched = parseInt(results[0].c);
          });
          db.all('SELECT * FROM status WHERE id=' + s, function(err, results) {
            var status = results[0].status;
            res.type('json');
            res.json({ kernel_id: k, cve_id: c, status_id: s, status: status, patched: patched});
          })
        } else {
          res.send({ error: "Failed" });
        }
      });
    }
  }
})

function createDB() {
  process.stdout.write("Creating new database...")

  db.serialize(function() {
    // Create tables
    db.run("CREATE TABLE config (last_update DATETIME, db_version INTEGER);");
    db.run("CREATE TABLE cve (id INTEGER PRIMARY KEY, cve TEXT);");
    db.run("CREATE TABLE status (id INTEGER PRIMARY KEY, status TEXT);");
    db.run("CREATE TABLE kernel (id INTEGER PRIMARY KEY, repo TEXT);");
    db.run("CREATE TABLE patches (id INTEGER PRIMARY KEY, kernel_id INTEGER, cve_id INTEGER, status_id INTEGER);");

    // Insert data
    db.run("INSERT INTO config (last_update, db_version) VALUES ('" + new Date() + "', 1)");
    require('readline').createInterface({ input: require('fs').createReadStream('cves.txt') })
        .on('line', function (line) { db.run("INSERT INTO cve (id, cve) VALUES (NULL, '" + line + "')"); });
    require('readline').createInterface({ input: require('fs').createReadStream('statuses.txt') })
        .on('line', function (line) { db.run("INSERT INTO status (id, status) VALUES (" + line.split('|')[0] + ",'" + line.split('|')[1] + "')"); });
    updateDB();
    getKernelsFromGithub();
  });

  process.stdout.write("Done!\n")
}

function updateDB() {
  db.serialize(function() {
    db.all('SELECT db_version FROM config;', function(err, results) {
      version = results[0].db_version;

      if (version < db_version) {
        switch(version) {
          case 1:
            db.run("ALTER TABLE kernel ADD last_github_update DATETIME");
            db.run("UPDATE config set db_version=" + db_version);
          case 2:
            db.serialize(function() {
              db.run("ALTER TABLE kernel ADD vendor STRING");
              db.run("ALTER TABLE kernel ADD name STRING");
              db.all('SELECT * FROM KERNEL', function(err, results) {
                var stmt = db.prepare("UPDATE kernel SET vendor=? , name=? WHERE id=?");
                for (var i = 0; i < results.length; i++) {
                  var data = getVendorNameFromRepo(results[i].repo);
                  stmt.run(data.vendor, data.name, results[i].id);
                }
              });
              db.run("UPDATE config set db_version=" + db_version);
            });
        }
      }
    });
  });
}

app.get('/', function(req, res) {
  if (req.query.k) {
    if (dbKernels.findIndex((k) => k.repo === req.query.k) > -1) {
      kernel = dbKernels[dbKernels.findIndex((k) => k.repo === req.query.k)];
      getStatuesForKernel(res, kernel);
      return;
    } else {
      console.log("Invalid kernel specified. Sending to index...");
    }
  }
  res.render("index", { kernels: dbKernels, cves: allCVEs });
})

app.listen(3000, function () {
  if (newdb) {
    forceDBUpdate = true;
    createDB();
  } else {
    updateDB();
    getStatusIDs();
    getCVEs();
    getKernelsFromDB();
  }

  setInterval(function(){ getKernelsFromGithub() }, 14400000); // Check github for new repos every 4 hours
})
