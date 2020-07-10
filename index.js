const express = require('express');
const awsS3 = require('./aws_s3');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const port = 3000;
const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(fileUpload()); // file access via files.<...>

app.use(session({
  secret: 'mooney',
  resave: false,
  saveUninitialized: true
}));

//  Set up passport authorization

app.use(passport.initialize());
require('./auth')(passport);
app.use(passport.session());



//  Add a new file to the bucket.  Set up to handle multi part
//  form data from a client.
//  express-fileupload is used to handle the incomming file as 'files'.
//
//  Params:
//      -- a file object from an html form
//
app.post('/file', passport.loggedIn(), (req, res) => {
  awsS3.uploadFile(req.files.fileData.data, req.files.fileData.name, req.body.bucketName)
    .then(result => { res.send(result); })
    .catch(error => {
      console.log(error)
      res.send(error);
    })

})


//  Delete a file
//
//  Params:
//      filename
//      folder -    The aws 'bucket'
//      
app.delete('/file/:filename/:folder', passport.loggedIn(), (req, res) => {
  awsS3.deleteFile(req.params.filename, req.params.folder)
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      console.error(err);
      res.send("error deleting");
    })
})


//  Delete all files from the given bucket.
//
//  Params:
//      bucket
//
app.post('/deleteFiles', passport.loggedIn(), (req, res) => {
  awsS3.deleteFiles(req.body.bucket)
    .then(result => {
      res.send(result);
    })


})


//  Responds with a single file
//
//  Params:
//      file - the name of the file to retreive (aws 'Key')
//      folder - the aws bucket in which the file is located
//
app.get('/file/:filename/:folder', passport.loggedIn(), (req, res) => {
  const _fileName = req.params.filename;
  const fileExtension = _fileName.substr(_fileName.lastIndexOf('.') + 1);

  const mime = require('mime');

  awsS3.getFile(_fileName, req.params.folder)
    .then(result => {
      if (fileExtension)
        res.set('Content-Type', mime.getType(fileExtension));

      res.send(result);
    })
    .catch(error => {
      res.send(error);
    })
})


//  Responds with an array of files contained in the given
//  bucket (think folder).
//
//  Params:
//      bucketName
//
app.post('/files', passport.loggedIn(), (req, res) => {
  awsS3.allFiles(req.body.bucketName)
    .then(result => { res.send(result); })
    .catch(error => {
      res.send(error);
    })
})


//  Create a new bucket
//
//  Params:
//      newBucket: - a UNIQUE bucket name
//
app.post('/bucket', passport.loggedIn(), (req, res) => {
  awsS3.newBucket(req.body.newBucket)
    .then(result => { res.send(result); })
    .catch(error => {
      console.log(error);
      // a failure will usually be an invalid bucket name
      res.send(error.code);
    })

})


//  Delete a bucket.
//
//  Params:
//      bucketName
//
app.delete('/bucket/:bucketName', passport.loggedIn(), (req, res) => {
  awsS3.deleteBucket(req.params.bucketName)
    .then(result => {
      res.send(result) // {}
    })
    .catch(error => {
      console.log(error);
      res.send(error.code);
    })
})


//  Responds with an array of buckets
//
app.get('/buckets', passport.loggedIn(), (req, res) => {
  awsS3.allBuckets()
    .then(result => { res.send(result); })
    .catch(error => {
      res.send(error);
    })
})


//  Log in
//
app.post('/login', passport.authenticate('login-local', {
  successRedirect: '/buckets',
  falureRedirect: '/unauthorized'
}))


//  log out
//
app.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/unauthorized');
})


//  Unautorized
//
app.get('/unauthorized', (req, res) => {
  res.send('Unathorized');
})


//  Listen
//
app.listen(port, () => {
  console.log('listening...' + port);
})