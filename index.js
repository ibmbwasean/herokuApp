const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { Client } = require('pg');
const bodyParser = require('body-parser');

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .use(bodyParser.urlencoded({extended: false}))
  .use(bodyParser.json())



  .post('/ProfileDisplay', (req,res) => {
  		var email = request.body.email;

  		const client = new Client({
	  	connectionString: process.env.DATABASE_URL || 'postgres://wppudawzdnutie:d2091f922901f53d65c28037ae5f01702e0c0dc8fb957eb39b15467fa1923124@ec2-23-23-173-30.compute-1.amazonaws.com:5432/d7as6ofv8qna9c',
	  	ssl: true,
		});

		client.connect();

		client.query('SELECT * FROM Contact WHERE email = $1', [email], (error, results) => {
			if (err) throw err;
			res.render('pages/ProfileDisplay', {
				results : JSON.stringify(results.rows[0])
			});
			client.end();
		})


  })






  .get('/retrieveData',(req,res) => {
	
	var a = [];
	var b = ''
	const client = new Client({
	  connectionString: process.env.DATABASE_URL || 'postgres://wppudawzdnutie:d2091f922901f53d65c28037ae5f01702e0c0dc8fb957eb39b15467fa1923124@ec2-23-23-173-30.compute-1.amazonaws.com:5432/d7as6ofv8qna9c',
	  ssl: true,
	});


	client.connect();

	client.query('SELECT Id, FirstName FROM salesforce.contact;', (err, dbres) => {

	  if (err) throw err;
	  for (let row of dbres.rows) {
	    // console.log(JSON.stringify(row));
	    b = JSON.stringify(row);
	    a.push(b)
	  }

	res.render('pages/index', {
		results : a
	});

	  client.end();
	});


  })



   .listen(PORT, () => console.log(`Listening on ${ PORT }`))

