const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { Client } = require('pg');
const bodyParser = require('body-parser');
var app = express();

  app.use(express.static(path.join(__dirname, 'public')))
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'ejs')
  //app.get('/', (req, res) => res.render('pages/index'))
  app.get('/pages/ProfileDisplay', (req, res) => res.render('pages/ProfileDisplay'))
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())




  app.post('/retrieveProfile', (req,res) => {
  		var email = req.body.email;

		const client = new Client({
			  	connectionString: process.env.DATABASE_URL || 'postgres://wppudawzdnutie:d2091f922901f53d65c28037ae5f01702e0c0dc8fb957eb39b15467fa1923124@ec2-23-23-173-30.compute-1.amazonaws.com:5432/d7as6ofv8qna9c',
			  	ssl: true,
				});


		client.connect();
		client.query('SELECT Name, Title, MobilePhone, externalID__c  FROM salesforce.contact WHERE email = $1', [email], (error, results) => {
			if (error) throw error;
			//res.json(results)

			var name = results.rows[0].name;
			var title = results.rows[0].title;
			var mobilePhone = results.rows[0].mobilephone;
			var externalid = results.rows[0].externalid__c;

			 res.render('pages/ProfileDisplay',  {
			 	name : name,
			 	title: title,
			 	mobilePhone: mobilePhone,
			 	externalid: externalid

			 });

			client.end();
		});
	})

app.post('/saveProfile', (req, res) =>{
		var name = req.body.name;
		var title = req.body.title;
		var mobilePhone = req.body.mobilePhone;
		var externalid = req.body.externalid;

		const client = new Client({
			  	connectionString: process.env.DATABASE_URL || 'postgres://wppudawzdnutie:d2091f922901f53d65c28037ae5f01702e0c0dc8fb957eb39b15467fa1923124@ec2-23-23-173-30.compute-1.amazonaws.com:5432/d7as6ofv8qna9c',
			  	ssl: true,
				});

		client.connect();

		client.query("UPDATE salesforce.contact SET Name = $1, Title = $2, MobilePhone = $3 WHERE externalID__c = $4", 
			[name, title, mobilePhone, externalid],
			(error, results) =>{

				if (error) throw error;

				console.log("result: " + JSON.stringify(results));

				res.send("Member Profile Updated");

				client.end();
				})
		
		})



  app.get('/welcome',(req,res) => {
	
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
   app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

