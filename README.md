# AWS-s3-api
A Node REST api that provides basic access to AWS s3 storage.  It provides essential operations for uploading, retrieving, and deleting files.  Folders (AWS 'buckets') can also be created and destroyed.  

**The API is secured** with Passport and relies on a simple MySql database to store user information.  This can easily be swapped out with any preferred storage.

**AWS is configured** via a local .aws/credentials file.  See https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html for information and alternatives.

### Note:


The creation of new users is not provided for, (better to do this on the AWS console?).

See the documentation at http://www.passportjs.org/ before using Passport in production. 

