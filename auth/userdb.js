//
//  Consumes user information from a mysql database to be
//  served for verification and user-db updates related
//  to authorization.
//
//  A configuration file for the database is required.
//
/////////////////////////////////////////////////////////

const mysqlConnection = require('./mysqlConfig');
const bycryp = require('bcrypt');


//  Verify user/password credentials
//
//  Params:
//    _user 
//    _password 
//
exports.passWordCorrect = (_user, _password) => {
  return new Promise(resolve => {
    //get get username from db
    let _query = `select passWord from users where userName=?`;

    mysqlConnection.con.query(_query, [_user], (err, result) => {
      resolve(result);
    })
  })
    .then(result => {
      //compare hash with pwd
      return bycryp.compare(_password, result[0].passWord);
    })
    .catch(err => console.log(err)) 
}


// Create a new user, insert into DB
//
//  Params:
//    _newUser
//    _newPassWord
//
exports.createNewUser = async (_newUser, _newPassWord) => {
  let hashedPwd = await bycryp.hash(_newPassWord, 10);

  return new Promise(resolve => {
    let _query = `insert into users(userName, passWord) values('${_newUser}', '${hashedPwd}')`;

    mysqlConnection.con.query(_query, (err, result) => {
      if (err) {
        console.error(err);
        resolve(false);
      } else {
        resolve(true);
      }
    })
  });
} 