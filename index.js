import 'dotenv/config';
import Nylas from 'nylas';
import express from 'express';
import { create } from 'domain';
import FileReader from 'filereader';
import fs from 'fs';
const app = express();

const NylasConfig = {
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: process.env.NYLAS_API_URI,
}

const nylas = new Nylas(NylasConfig)
const identifier = process.env.NYLAS_GRANT_ID;
let draftId;

const createDraft = async () => {
  try {
    const draft = {
      subject: "Blah blah blah",
      to: [{ name: "John Doe", email: "JohnDoe@gmail.com" }],
      body: "This is a test!",
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

const sendDraft = async () => {
  try {
    const sentMessage = await nylas.drafts.send({ identifier, draftId })
    console.log('Draft sent:', sentMessage)
  } catch (error) {
    console.error('Error sending draft:', error)
  }
}

// file to base64
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

const main = async () => {
  try {
    const draftId = await createDraft();
    await sendDraft(draftId);
  } catch (error) {
    console.error('Main process error:', error);
  }
};

main();