# Mass Emailing API
This code will be used to send out mass emails.

## Setup
1. Create a Nylas account on [Nylas](https://www.nylas.com/)
2. Follow the setup guide(save your API key and use an email that you can grant access to)
3. Install npm [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
4. Install NodeJS [NodeJS](https://nodejs.org/en)
5. Create a new project in your IDE(VS Code, etc...) then run this in the terminal:
```bash 
git clone https://github.com/GordonDHuang/mailing-service.git
```
6. Run this command in the terminal within your project directory
```bash 
npm install
```
7. Create a .env file with the following and fill in each global variable from Nylas:

```bash
NYLAS_CLIENT_ID=\<INSERT YOUR CLIENT_ID\>  
NYLAS_API_KEY=\<INSERT YOUR API_KEY\>  
NYLAS_API_URI=\<https://api.us.nylas.com or https://api.eu.nylas.com\>  
NYLAS_GRANT_ID=\<INSERT YOUR GRANT_ID\>   
EMAIL=\<INSERT SENDER EMAIL\>
```

## Usage
Fill in all recipients, body, subject, and attachments (make sure the name and file format are correct)   

## Fill out the following documents:
- emails.csv (emails to send out to)
- cc_emails.csv (emails to cc)
- body.txt (email body)

Setup a script or run this in the terminal:

```bash 
node index.js
```

## Documentation
- [Nylas - Setup](https://developer.nylas.com/docs/v3/quickstart/email/#get-your-application-credentials)
- [Nylas - Nylas Developers](https://developer.nylas.com/)
- [Email Schema](https://developer.nylas.com/docs/api/v3/ecc/#post-/v3/grants/-grant_id-/messages/send)
