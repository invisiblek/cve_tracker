var forceDBUpdate = false;

var fs = require('fs');
var options = JSON.parse(fs.readFileSync('options.json', 'utf8'));
var database = "sqlite.db";
var newdb = !fs.existsSync(database);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(database);

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

function checkUpdateDB() {
  db.serialize(function() {
    db.all('SELECT last_update FROM config;', function(err, results) {
      next_update = new Date(results[0].last_update);
      next_update.setDate(next_update.getDate() + 1);
      if (next_update < new Date() || forceDBUpdate) {
        updateDB();
        forceDBUpdate = false;
      }
    });
  });
}

function updateDB() {
  untrackedKernels = [];

  for (var i = 0; i < ghKernels.length; i++) {
    if (dbKernels.findIndex((k) => k.repo === ghKernels[i]) < 0) {
      untrackedKernels.push([ghKernels[i]]);
    }
  }

  if (untrackedKernels.length > 0) {
    db.serialize(function() {
      var stmt = db.prepare("INSERT INTO kernel (id, repo) VALUES (NULL, ?)");
      for (var i = 0; i < untrackedKernels.length; i++) {
        stmt.run(untrackedKernels[i]);
      }
      stmt.finalize();
    });

    getKernelsFromDB();
  }
}

function getKernelsFromDB() {
  dbKernels = [];
  db.serialize(function() {
    db.all('SELECT * FROM kernel', function(err, results) {
      dbKernels = results;
      dbKernels.sort(function(a,b) {return (a.repo > b.repo) ? 1 : ((b.repo > a.repo) ? -1 : 0);});
      checkUpdateDB();
    });
  });
}

function getKernelsFromGithub() {
  ghKernels = [];
  process.stdout.write("Retrieving kernel repos from github (this may take a little bit)...");
  req = github.repos.getForOrg({ org: "LineageOS", per_page: 100 }, getRepos);

  function getRepos(err, ret) {
    for (var i = 0; i < ret.length; i++) {
      repo = ret[i];
      if (repo.name.indexOf("android_kernel_") == 0) {
        ghKernels.push(repo.name);
      }
    }

    if (github.hasNextPage(ret)) {
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
  statuses = new Array();
  db.serialize(function() {
    db.all('SELECT * FROM patches WHERE kernel_id = "' + kernel.id + '"', function(err, results) {
      statuses = results;
      res.render("kernel", { kernel: kernel, cves: allCVEs, statuses: statuses, statusIDs: statusIDs });
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
            db.run('INSERT into patches (id, kernel_id, cve_id, status_id) VALUES (NULL, ' + k + ', ' + c + ', ' + s + ')', function(err, results) {})
          } else if (results.length == 1) {
            db.run('UPDATE patches SET status_id = ' + s + ' WHERE kernel_id = ' + k + ' AND cve_id = ' + c, function(err, results){})
          } else {
            // Somehow if it got more than one record, clean this shit up. Probably can't happen but let's be sure
            db.run('DELETE from patches WHERE kernel_id = "' + k + '" AND cve_id = "' + c + '"', function(err, results) {})
            db.run('INSERT into patches (id, kernel_id, cve_id, status_id) VALUES (NULL, ' + k + ', ' + c + ', ' + s + ')', function(err, results) {})
          }
          db.all('SELECT * from status WHERE id=' + s, function(err, results) {
            var status = results[0].status;
            res.type('json');
            res.json({ kernel_id: k, cve_id: c, status_id: s, status: status });
          })
        } else {
          res.send({ error: "Failed" });
        }
      });
    }
  }
})

app.get('/', function(req, res) {
  if (req.query.k) {
    if (dbKernels.findIndex((k) => k.repo === req.query.k) > -1) {
      kernel = dbKernels[dbKernels.findIndex((k) => k.repo === req.query.k)];
      getStatuesForKernel(res, kernel);
    } else {
      console.log("Invalid kernel specified. Sending to index...");
      res.render("index", { kernels: dbKernels, cves: allCVEs });
    }
  } else {
    res.render("index", { kernels: dbKernels, cves: allCVEs });
  }
})

app.listen(3000, function () {
  if (newdb) {
    process.stdout.write("Creating new database...")
    // Create tables
    db.serialize(function() {
      db.run("CREATE TABLE config (last_update DATETIME);");
      db.run("CREATE TABLE cve (id INTEGER PRIMARY KEY, cve TEXT);");
      db.run("CREATE TABLE status (id INTEGER PRIMARY KEY, status TEXT);");
      db.run("CREATE TABLE kernel (id INTEGER PRIMARY KEY, repo TEXT);");
      db.run("CREATE TABLE patches (id INTEGER PRIMARY KEY, kernel_id INTEGER, cve_id INTEGER, status_id INTEGER);");
    });

    // Insert data
    db.serialize(function() {
      db.run("INSERT INTO config (last_update) VALUES ('" + new Date() + "')");

      require('readline').createInterface({ input: require('fs').createReadStream('cves.txt') })
          .on('line', function (line) { db.run("INSERT INTO cve (id, cve) VALUES (NULL, '" + line + "')"); });

      require('readline').createInterface({ input: require('fs').createReadStream('statuses.txt') })
          .on('line', function (line) { db.run("INSERT INTO status (id, status) VALUES (" + line.split('|')[0] + ",'" + line.split('|')[1] + "')"); });
    });

    process.stdout.write("Done!\n")
    forceDBUpdate = true;
  }

  getKernelsFromGithub();
  getStatusIDs();
  getCVEs();
  setInterval(function(){ getKernelsFromGithub() }, 14400000); // Check github for new repos every 4 hours
})
