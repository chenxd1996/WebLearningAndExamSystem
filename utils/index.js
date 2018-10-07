exports.queryPromise = (con, queryString, params) => {
  return new Promise((resolve, reject) => {
    con.query(queryString, params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
