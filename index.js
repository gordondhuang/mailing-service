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
let receivers = [];
// must be named 'emails.csv'
let emails = 'emails.csv';

// Creates a draft of an email to send 
const createDraft = async () => {
  try {
    await csvToArray();
    const draft = {
      subject: "Test", // replace with subject 
      to: [{name: "John Doe", email: "JohnDoe@gmail.com"}], // replace with receiver
      body: "Hello, this is a test!", // replace with your body text
      cc: receivers
      // attachments: [{ 
      //   filename: "test.pdf", 
      //   content: await fileToBase64('./test.pdf'), 
      //   contentType: "image/jpeg", // Content type of the attachment  
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

// List of emails to CC in a CSV file to convert to an array
async function csvToArray() {
  try {
    const files = await fs.promises.readdir('./');

    // Read CSV file
    const stream = fs.createReadStream(emails)
      .pipe(csv())
      .on('data', (data) => receivers.push(data))
      .on('end', () => {
        console.log('CSV parsed successfully');
      });

    await new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });

  } catch (error) {
    console.error('Error reading directory or file:', error);
    throw error; // Propagate the error to the caller
  }
}

const main = async () => {
  try {
    const draftId = await createDraft();
    await sendDraft(draftId);
  } catch (error) {
    console.error('Main process error:', error);
  }
};

main();