'use strict'

let express = require('express');
let bodyParser = require('body-parser');
let MongoClient = require('mongodb').MongoClient;
let ObjectId = require('mongodb').ObjectID;

const path = require('path');

let app = express();
let db;

let httpListenport = process.env.PORT || 3000;
let mongodbUrl = process.env.MONGO_URL || 'mongodb://localhost/juniordevjobsdb';

MongoClient.connect(mongodbUrl, function(err, dbConnection) {
  db = dbConnection;
  let server = app.listen(httpListenport, function() {
	  let port = server.address().port;
	  console.log("Started server on port", port);
  });
});

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/api/jobs', function(req, res) {
  console.log("Query string", req.query);
  let filter = {};

  if (req.query.priority)
    filter.priority = req.query.priority;
  if (req.query.status)
    filter.status = req.query.status;

  db.collection("juniordevjobs").find(filter).toArray(function(err, docs) {
    res.json(docs);
  });
});

app.post('/api/jobs/', function(req, res) {
  console.log("Req body:", req.body);
  let newJob = req.body;
  
  db.collection("juniordevjobs").insertOne(newJob, function(err, result) {
    if (err) console.log(err);
    let newId = result.insertedId;
    db.collection("juniordevjobs").find({_id: newId}).next(function(err, doc) {
      if (err) console.log(err);
      res.json(doc);
    });
  });
});

app.get('/api/jobs/:id', function(req, res) {
  db.collection("juniordevjobs").findOne({_id: ObjectId(req.params.id)}, function(err, job) {
    res.json(job);
  });
});

app.put('/api/jobs/:id', function(req, res) {
  console.log("Modifying job:", req.params.id, job);
  let job = req.body;
  let oid = ObjectId(req.params.id);
  
  // ensure we don't have the _id itself as a field, modifying the _id is not allowed
  delete (job._id);

  db.collection("juniordevjobs").updateOne({_id: oid}, job, function(err, result) {
    if (err) console.log(err);
    db.collection("juniordevjobs").find({_id: oid}).next(function(err, doc) {
      if (err) console.log(err);
      res.send(doc);
    });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// delete all
// app.delete('/api/jobs/:id', function(req, res) {
//   console.log('Deleting job:', req.params.id);
//   let oid = ObjectId(req.params.id);

//   db.collection("juniordevjobs").remove({}).then((err, doc) => {
//     res.send(doc);
//   });
// });
