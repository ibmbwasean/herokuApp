//express set up
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { Client } = require('pg');
const bodyParser = require('body-parser');
var app = express();

//watson service assistant and SF set up
var watson = require('./watsonservices');
var sf = require('node-salesforce');

//create global variables (to be directly accessed across the application)
 global.user;
 global.cases=[];

//other set ups
  app.use(express.static(path.join(__dirname, 'public')))
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'ejs')
  app.get('/', (req, res) => res.render('pages/login'))
  app.get('/index', (req, res) => res.render('pages/index'))
  app.get('/pages/ProfileDisplay', (req, res) => res.render('pages/ProfileDisplay'))
  app.use(express.static(path.join(__dirname, '/public')));
  //set up to read the content being passed from the ejs files (front pages)
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())

//Perform log in check, and then base on email, retrieve user profile to display. Also retrieve list of cases of that user (Using POST API)
  app.post('/login', (req, res) =>{
  	var username = req.body.username;
  	var password = req.body.password;
  	var name, title, mobilePhone, externalid, profilePic;

  	//Identify DB connection parameters
	const client = new Client({
	connectionString: process.env.DATABASE_URL || 'postgres://wppudawzdnutie:d2091f922901f53d65c28037ae5f01702e0c0dc8fb957eb39b15467fa1923124@ec2-23-23-173-30.compute-1.amazonaws.com:5432/d7as6ofv8qna9c',
		ssl: true
		});

	//start the connecttion with DB
	client.connect();  

	//query to retrieve User data
	client.query('SELECT sfid, email, Name, Title, MobilePhone, externalID__c, profileUrl__c FROM salesforce.contact WHERE email = $1 AND password__c = $2', [username, password], 
			(error, results) => {
			
			if (error) throw error;

			user = results.rows[0];

			//query to retrieve cases of the users
			client.query("SELECT * FROM salesforce.case WHERE contactId = $1;", [user.sfid], (error, response) =>{

				if (error) throw error;

				//the response from client.query is an array, hence need to loop through to extract data needed
				for (let row of response.rows) {
					cases.push(row);
				}

				//render to the main page and passing the data to be displayed there
				res.render('pages/index', {
						user: user,
						cases: cases
			 			
				})
				//It's best practice to close the connection and avoid resources taken, which will slow down the application
				client.end();
			
			})

			
		})


  })

  // retrieve details of a specific case for viewing (Using GET API)
  app.get('/retrieveCaseDetails', (req, res) =>{
  	var casenumber = req.query.id;

  	//Set up connection parameters
  	const client = new Client({
		connectionString: process.env.DATABASE_URL || 'postgres://wppudawzdnutie:d2091f922901f53d65c28037ae5f01702e0c0dc8fb957eb39b15467fa1923124@ec2-23-23-173-30.compute-1.amazonaws.com:5432/d7as6ofv8qna9c',
		ssl: true
		});

  	//Start connection
	client.connect(); 

	//Build query to retrieve data. $1 is a representative of the data to be passed in, which links to the [casenumber]
	client.query('SELECT * FROM salesforce.case WHERE CaseNumber = $1', [casenumber], (error, response) =>{
		if (error) throw error;

		//render to the UI page and carry data retrieved for display
		res.render('pages/CaseDetails',{
			item: response.rows[0]
		})
		client.end();
	})	

  })

   // On the case creation form, there are a few drop down list (for now are Types and Reasons). Instead of hardcoding the list and make changes when a new value is added to SF, this method retrieve the list directly from SF
   // and display instead of hardcode
  app.get ('/retrieveCaseForm', (req, res) =>{
  		const client = new Client({
		connectionString: process.env.DATABASE_URL || 'postgres://wppudawzdnutie:d2091f922901f53d65c28037ae5f01702e0c0dc8fb957eb39b15467fa1923124@ec2-23-23-173-30.compute-1.amazonaws.com:5432/d7as6ofv8qna9c',
		ssl: true
		});

		client.connect(); 

		//Create variable as array to return
		caseTypes=[];
 		caseReasons=[];

		client.query("SELECT DISTINCT Type FROM salesforce.case;", (error, response1) =>{
				if (error) throw error;

				//Store case types into the array defined
				for (let row of response1.rows) {
					caseTypes.push(row.type);
				}


				client.query("SELECT DISTINCT Reason FROM salesforce.case;", (error, response2) =>{
					if (error) throw error;

					//Similary, store case reasons into the array
					for (let row of response2.rows) {
						caseReasons.push(row.reason);
					}

					//render to Case Creation page with values retrieved to display
					res.render('pages/CaseCreation', {
			 			caseTypes : caseTypes,
						caseReasons : caseReasons
					})

					client.end();

				})
		})

  })


  //Insert new case to POSTGRES and then sync to SF
  app.post('/insertCase', (req, res) =>{

  		//req.body allows data to be received from the input form
  		var type = req.body.type;
  		var reason = req.body.reason;
  		var subject = req.body.subject;
  		var description = req.body.description;
  		var sfid = user.sfid;

  		var conn = new sf.Connection({
  			oauth2 : {
  			loginUlr: 'https://login.salesforce.com',
  			clientId: '3MVG9pe2TCoA1Pf4k4wXt2waXdAqcwtpIy2_P4AWL7X2cnGhZtjWe9FQh4wVYlay9jj74ADWuewVxwpF1AY84',
  			clientSecret:'D19D0F5C735C1C208631E644CA12A6D94B9039736F07DA4420D33CBD6FEFD53A'},
  			redirectUri: 'https://tranquil-tundra-99018.herokuapp.com/',
  			accessToken: '6Cel800D0o000001RldH8880o00000221XtUx48l7xD5NnDu2rMGfxbhgpkauTf7AMRRD6kJjtMYsq0phdPoNpqE8NVI9EHVnxY8v9rtM1Y'
  		});
  		conn.login('ibmbwasean@gmail.com', 'bluewolf123mmkDMpFRAmdiL9ArvNV2JbcVY', function(error, userInfo){

  			if(error) throw error;

  		conn.sobject("Case").create({Type: type, Reason: reason, Subject: subject, Description: description, ContactId: sfid}, function(err, response){
  			if(err) throw err;
  				
  			conn.sobject("Case").find(
  				{Id : response.id},
  				'CaseNumber, Subject, Status, CreatedDate'
  			).execute(function(err, records){

  				if(err) throw err;

  				cases.push(
  					{
  						"casenumber": records[0].CaseNumber,
  						"subject": records[0].Subject,
  						"status": records[0].Status,
  						"createddate":records[0].CreatedDate
  					}

  				);

  			})

  			conn.logout();

  			res.render('pages/CaseCreated');
  		})

  	});
  		
  })


//save Profile with update information
app.post('/saveProfile', (req, res) =>{

		//define variables which hold values being passed from the UI page
		var name = req.body.name;
		var title = req.body.title;
		var mobilePhone = req.body.mobilePhone;
		var externalid = req.body.externalid;

		const client = new Client({
			connectionString: process.env.DATABASE_URL || 'postgres://wppudawzdnutie:d2091f922901f53d65c28037ae5f01702e0c0dc8fb957eb39b15467fa1923124@ec2-23-23-173-30.compute-1.amazonaws.com:5432/d7as6ofv8qna9c',
			ssl: true
			});

		client.connect();

		client.query("UPDATE salesforce.contact SET Name = $1, Title = $2, MobilePhone = $3 WHERE externalID__c = $4", 
			[name, title, mobilePhone, externalid],
			(error, results) =>{

				if (error) throw error;

				// Update the global variable to repflect the changes
				user.name = name;
				user.title = title;
				user.mobilephone = mobilePhone;

				res.render('pages/ProfileUpdated');

				client.end();

				})
		
		})

   app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

app.get('/api/init', (req, res) => {
  watson.initAssistant(
    //callback function
    (err, result) => {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(200).send(result)
      }
    }
  );
})

app.post('/api/send', (req, res) => {
  let { sessionID, message } = req.body

  watson.send(
    //callback function
    sessionID, message, (err, result) => {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(200).send(result)
      }
    }
  )
})



//retrieve profile (Contact) info

 //  app.post('/retrieveProfile', (req,res) => {
 //  		var email = req.body.email;

	// 	client.connect();
	// 	client.query('SELECT Name, Title, MobilePhone, externalID__c  FROM salesforce.contact WHERE email = $1', [email], (error, results) => {
	// 		if (error) throw error;
	// 		//res.json(results)

	// 		var name = results.rows[0].name;
	// 		var title = results.rows[0].title;
	// 		var mobilePhone = results.rows[0].mobilephone;
	// 		var externalid = results.rows[0].externalid__c;

	// 		 res.render('pages/ProfileDisplay',  {
	// 		 	name : name,
	// 		 	title: title,
	// 		 	mobilePhone: mobilePhone,
	// 		 	externalid: externalid

	// 		 });

	// 		client.end();
	// 	});
	// })


//retrieve Case related input values
// app.get('/prepareCaseForm', (req, res) =>{
// 			var caseTypes=[];
// 			var caseReasons=[];

// 		client.connect();

// 		client.query("SELECT DISTINCT Type FROM salesforce.case;", (error, response) =>{
// 			if (error) throw error;
// 			for (let row of response.rows) {
// 				caseTypes.push(row.type);
// 				console.log("case type : " + row.type);
// 			}
			
// 		})

// 		client.query("SELECT DISTINCT Reason FROM salesforce.case;", (error, response) =>{
// 			if (error) throw error;
// 			for (let row of response.rows) {
// 				caseReasons.push(row.reason);
// 				console.log("case reason: " + row.reason);
// 			}
			
// 		})

// 		console.log("case type array: " + caseTypes);
// 		console.log("case reason array: " + caseReasons);

// 		client.commit(function(err, response){
// 			res.render('pages/CaseForm', {
// 				caseTypes : caseTypes,
// 				caseReasons : caseReasons
// 			})
// 		})
// 		client.end();
// 	})

