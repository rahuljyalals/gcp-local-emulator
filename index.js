const { Storage } = require("@google-cloud/storage");
const stream = require('stream');
const fsp = require('fs').promises;

// For more information on ways to initialize Storage, please see
// https://googleapis.dev/nodejs/storage/latest/Storage.html


// Creates a client using Application Default Credentials
// process.env.STORAGE_EMULATOR_HOST = `http://localhost:9023`
const storage = new Storage({apiEndpoint: 'http://localhost:9023'});

// Creates a client from a Google service account key
// const storage = new Storage({keyFilename: 'key.json'});

/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
// The ID of your GCS bucket
const bucketName = "product";

async function createBucket() {
  try{
  // Creates the new bucket
  await storage.createBucket(bucketName);
  console.log(`Bucket ${bucketName} created.`);
  } catch(error){
    console.log(error)
  }
}

async function fileUploadToGcsUsingStream() {
  try {
    const storageClient = new Storage({apiEndpoint: 'http://localhost:9023'});
    const bucket = storageClient.bucket(bucketName);
    const dataStream = new stream.PassThrough();
    const gcFile = bucket.file('adidas/my.png');
    const fileBuffer = await fsp.readFile('avatar.png', 'utf8');

    if (fileBuffer.toString() !== '') {
      dataStream.push(fileBuffer);
      dataStream.end();
      return await new Promise((resolve, reject) => {
        dataStream
          .pipe(
            gcFile.createWriteStream({
              resumable: false,
              validation: false,
              contentType: 'auto',
              metadata: {
                'Cache-Control': 'public, max-age=31536000',
              },
            })
          )
          .on('error', (error) => {
            console.error('error:', error);
            reject(error);
          })
          .on('finish', () => {
            console.info(`file upload to GCS successfully`);
            resolve(true);
          });
      });
    }
    return false;
  } catch (err) {
    console.error('file upload to GCS failed:',err);
    throw err;
  }
}

async function upload() {
  const bucket = storage.bucket(bucketName);

  bucket.upload("./test.csv", function (err, file) {
    if (err) throw new Error(err);
    console.log("done");
  });
}

async function getFileData() {
  const filePath = "adidas/my.png";
  const file = storage.bucket(bucketName).file(filePath);
  const csvData = await file.download()
  console.error("CSV File Content:", csvData);
}

async function getSignedURI() {
  const filePath = "adidas/my.png";
  storage.bucket(bucketName).file(filePath).getSignedUrl().then(res =>  console.error("URL:", res))
}

// createBucket().then(res => console.log('done')).catch(err => console.error(err))
getSignedURI();
