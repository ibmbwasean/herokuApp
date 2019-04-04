const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://wppudawzdnutie:d2091f922901f53d65c28037ae5f01702e0c0dc8fb957eb39b15467fa1923124@ec2-23-23-173-30.compute-1.amazonaws.com:5432/d7as6ofv8qna9c',
  ssl: true,
});

client.connect();

client.query('SELECT Id, FirstName, LastName FROM salesforce.contact;', (err, res) => {

  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});
