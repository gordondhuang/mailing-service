import 'dotenv/config';
import Nylas from 'nylas';
import express from 'express';
import { create } from 'domain';
import FileReader from 'filereader';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
const app = express();

const NylasConfig = {
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: process.env.NYLAS_API_URI,
}

const nylas = new Nylas(NylasConfig)
const identifier = process.env.NYLAS_GRANT_ID;
let draftId;
let recipients = [];
let emails = [];
let variables = []; // format each variables as {strToReplace: <replace this>, str: <replace this>}
let bodyContent;
let recipientEmail; // email of recipient
let recipientName; // name of recipient
let emailsToCC = 'cc_emails.csv';
let emailList = 'email_list.csv';
let fileAttachment;

// Creates a draft of an email to send 
const createDraft = async (recipient, index) => {
  try {
    await bodyToString();
    await replaceAllVars(index);
    const draft = {
      subject: "<Insert subject>", // replace with subject 
      to: [{ email: recipient.email, name: recipient.name }], // replace with recipient
      body: `${bodyContent}`, // replace with your body text
      cc: recipients,
      // !!! Uncomment for attachments !!!
      // attachments: [{ 
      //   filename: fileAttachment, 
      //   content: await fileToBase64(fileAttachment), 
      //   contentType: "pdf", // Content type of the attachment  
      // }]
    }

    const createdDraft = await nylas.drafts.create({
        identifier,
        requestBody: draft,
    })

    console.log('Draft created:', createdDraft)
    draftId = createdDraft.data.id;

  } catch (error) {
    console.error('Error creating draft:', error)
  }
}

// Sends a draft of an email
const sendDraft = async () => {
  try {
    const sentMessage = await nylas.drafts.send({ identifier, draftId })
    console.log('Draft sent:', sentMessage)
  } catch (error) {
    console.error('Error sending draft:', error)
  }
}

// Converts a file(JPEG, PNG, PDF) to base64
const fileToBase64 = (filepath) => {
  return new Promise((resolve, reject) => {
    // Create a readable stream from the file
    const stream = fs.createReadStream(filepath, { encoding: 'base64' });

    let base64String = '';

    // Read chunks of data
    stream.on('data', (chunk) => {
      base64String += chunk;
    });

    // Handle errors
    stream.on('error', (error) => {
      reject(error);
    });

    // When all data is read, resolve with the base64 string
    stream.on('end', () => {
      resolve(base64String);
    });
  });
};

// List of emails in a CSV file to convert to an array
async function csvToArray(csvName, arr) {
  try {
    const files = await fs.promises.readdir('./');

    // Read CSV file
    const stream = fs.createReadStream(csvName)
      .pipe(csv())
      .on('data', (data) => arr.push(data))
      .on('end', () => {
        console.log('CSV parsed successfully');
      });

    await new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });

  } catch (error) {
    console.error('Error reading directory or file:', error);
    throw error;
  }
}

const main = async () => {
  try {
    await csvToArray(emailList, emails);
    await csvToArray(emailsToCC, recipients);
    await csvToArray(emailList, variables);
    for (let i = 0; i < emails.length; i++) {
      const draftId = await createDraft(emails[i], i);
      // !!! Uncomment to send draft !!!
      // await sendDraft(draftId);
    }
  } catch (error) {
    console.error('Main process error:', error);
  }
};

// Reads and converts body text into a string
async function bodyToString() {
  try {
    bodyContent = fs.readFileSync('./body.txt', 'utf-8');
  } catch (error) {
    console.error('Body to String error:', error);
  }
}

// Replaces all variables specified above
async function replaceAllVars(index) {
  try {
    // let files = await fs.promises.readdir('./');
    // let matchingFiles = files.filter(file => file.endsWith("-proposal-globalhack.pdf"));
    let variable = variables[index];
    bodyContent = bodyContent.replaceAll('{companyName}', variable.companyName);
    bodyContent = bodyContent.replaceAll('{mainService}', variable.mainService);
    bodyContent = bodyContent.replaceAll('{industryArea}', variable.industryArea);
    // fileAttachment = variable.companyName + ".pdf";
    // fs.renameSync(matchingFiles[0], fileAttachment);
  } catch (error) {
    console.error('Error wtih replacing all variables');
  }
}

main();