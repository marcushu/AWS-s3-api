//
//  AWS s3 access.  Provides limited access to s3 storage.
//
//////////////////////////////////////////////////////////


const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-west-2' });

s3 = new AWS.S3({ apiVersion: '2006-03-01' });


//  Send a new file to storage
//  
//  Params:
//      fileToUpload -  file data
//      fileName -      
//      bucket -       where to store     
//
uploadFile = (fileToUpload, fileName, bucket) => {
  return new Promise((resolve, reject) => {
    let uploadParams = { Bucket: bucket, Key: fileName, Body: fileToUpload };

    s3.upload(uploadParams, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          bucket: data.Bucket,
          key: data.Key
        });
      }
    })
  })
}



//  Delete a file
//
//  Params:
//      file
//      bucket
//
deleteFile = (file, bucket) => {
  let params = {
    Bucket: bucket,
    Key: file
  }

  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve("Deleted: " + file);
      }
    })
  })
}


//  Delete all files in the given bucket.  Called internally
//  before a bucket is deleted
//
//  Params
//      bucket - delete from here
//
deleteFiles = (bucket) => {
  return new Promise((resolve, reject) => {
    return s3.listObjects({ Bucket: bucket }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        // !empty?
        if (data.Contents.length) {
          let objectsToDelete = data.Contents.map(({ Key }) => ({ Key }));

          s3.deleteObjects({
            Bucket: bucket,
            Delete: { Objects: objectsToDelete }
          }, (err, data) => {
            if (err) reject(err)

            else resolve(data);
          })
        } else {
          resolve()
        }

      }
    })
  })
}


//  Returns an object from storage
//
//  Params
//      object - the (aws) 'Key' value of the object (it's name)
//      bucket
//
getFile = (name, bucket) => {
  const params = {
    Bucket: bucket,
    Key: name
  }

  return new Promise((resolve, reject) => {
    s3.getObject(params, (err, data) => {
      if (err) reject(err.message);

      else resolve(data.Body);

    })
  })
}



//  Create a new aws bucket
//
//  Params:
//      newBuckete - this value must be unique in aws.s3
//
newBucket = newBucketName => {
  let params = {
    Bucket: newBucketName,
    ACL: "private",
    CreateBucketConfiguration: {
      LocationConstraint: "us-west-2"
    }
  }

  return s3.createBucket(params).promise();
}


//  Delete a bucket.  If not empty, the contents will be deleted.
//
//  Params:
//      bucket 
//
deleteBucket = bucket => {
  return new Promise((resolve, reject) => {
    this.deleteFiles(bucket)
      .then(() => {
        s3.deleteBucket({ Bucket: bucket }, (err, data) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(data);
          }
        })
      }).catch(err => {
        console.log(err);
        reject(err);
      })
  })
}





//  Return an array of aws buckets.  Only the names will be returned.
//  An array with the error code is returned on failure.
//
allBuckets = () => {
  return new Promise((resolve, reject) => {
    s3.listBuckets((err, data) => {
      if (err) reject([err.code]);

      else resolve(data.Buckets.map(({ Name }) => Name));

    })
  })
}



//  Returns an array of file names of all of the files in the given
//  bucket.  NOTE, the file names are the 'Key' values of the objects
//  returned.
//  An array with the error code is returned on failure.
//
//  @params
//
allFiles = (bucket) => {
  return new Promise((resolve, reject) => {
    s3.listObjects({ Bucket: bucket }, (err, data) => {
      if (err) reject([err.code]);

      else resolve(data.Contents.map(({ Key }) => Key));

    })
  })
}

exports.uploadFile = uploadFile
exports.deleteFile = deleteFile
exports.getFile = getFile
exports.deleteFiles = deleteFiles
exports.newBucket = newBucket
exports.deleteBucket = deleteBucket
exports.allBuckets = allBuckets
exports.allFiles = allFiles
