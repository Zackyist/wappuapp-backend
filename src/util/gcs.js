'use strict';

import streamifier from 'streamifier';
const logger = require('./logger')(__filename);

const requireEnvs = require('./require-envs');
requireEnvs([
  'GCS_BUCKET_NAME',
  'GCS_TYPE',
  'GCS_PROJECT_ID',
  'GCS_PRIVATE_KEY_ID',
  // 'GCS_PRIVATE_KEY',
  'GCS_PRIVATE_KEY_STRING',
  'GCS_CLIENT_EMAIL',
  'GCS_CLIENT_ID',
  'GCS_AUTH_URI',
  'GCS_TOKEN_URI',
  'GCS_AUTH_PROVIDER_X509_CERT_URL',
  'GCS_CLIENT_X509_CERT_URL',
  'GCS_CLIENT_EMAIL'
]);

const GCS_CONFIG = {
  bucketName: process.env.GCS_BUCKET_NAME,
  baseUrl: 'https://storage.googleapis.com',

  'type': process.env.GCS_TYPE,
  'projectId': process.env.GCS_PROJECT_ID,
  'project_id': process.env.GCS_PROJECT_ID,
  'private_key_id': process.env.GCS_PRIVATE_KEY_ID,
  //'private_key': process.env.GCS_PRIVATE_KEY,
  // the next line expects the env var to be the string from GCS account credentials
  'private_key': process.env.GCS_PRIVATE_KEY_STRING.replace(/\\n/g, '\n'),
  'client_email': process.env.GCS_CLIENT_EMAIL,
  'client_id': process.env.GCS_CLIENT_ID,
  'auth_uri': process.env.GCS_AUTH_URI,
  'token_uri': process.env.GCS_TOKEN_URI,
  'auth_provider_x509_cert_url': process.env.GCS_AUTH_PROVIDER_X509_CERT_URL,
  'client_x509_cert_url': process.env.GCS_CLIENT_X509_CERT_URL,

  credentials: {
    //'private_key': PRIVATE_KEY,
    // the next line expects the env var to be the string from GCS account credentials
    'private_key': process.env.GCS_PRIVATE_KEY_STRING.replace(/\\n/g, '\n'),
    'client_email': process.env.GCS_CLIENT_EMAIL
  }
};

let gcloudStorage;
if (process.env.GCS_ORIGINAL_WAY_OF_LOADING === 'true') {
  console.log('gcs configured using env variables')
  gcloudStorage = require('@google-cloud/storage')(GCS_CONFIG);
} else {
  console.log('gcs configure using keyfile.json dled from google cloud console')
  gcloudStorage = require('gcloud')({
    projectId: process.env.GCS_PROJECT_ID,
    keyFilename: process.env.GCS_KEYFILE_NAME ,
  });
}

const bucket = gcloudStorage.bucket(process.env.GCS_BUCKET_NAME);

// # API
//
// uploadImage
function uploadImageBuffer(imageName, imageBuffer) {
  logger.info('Uploading image to Google Cloud Storage..');
  return new Promise(function(resolve, reject) {
    const file = bucket.file(imageName);
    // console.log(file)
    streamifier.createReadStream(imageBuffer)
      .pipe(file.createWriteStream({
        metadata: { contentType: 'image/jpeg' }
      }))
      .on('error', function(error) {
        console.log(error);
        reject(error);
      })
      .on('finish', function() {
        file.makePublic(function(error, response) {
          console.log(error)
          if (error) {
            return reject(error);
          }
          resolve({
            imageName,
            uploaded: true
          });
        })
      });
  });
};

export {
  uploadImageBuffer,
  GCS_CONFIG
};
