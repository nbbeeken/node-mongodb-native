/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const process = require('node:process');
const perf_hooks = require('node:perf_hooks');
const os = require('node:os');

let mongodb, mdbVersion, clientOptions;
// if (process.argv.includes('test3x')) {
//   mongodb = require('mongodb3');
//   ({ version: mdbVersion } = require('mongodb3/package.json'));
//   clientOptions = {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   };
// } else if (process.argv.includes('test6x')) {
//   mongodb = require('mongodb6');
//   ({ version: mdbVersion } = require('mongodb6/package.json'));
//   clientOptions = {
//     enableUtf8Validation: false
//   };
// } else {
//   throw new Error('Must specify driver version to test');
// }

mongodb = require('./lib/index');
({ version: mdbVersion } = require('./package.json'));

clientOptions = {
  enableUtf8Validation: false
};

const { MongoClient, ObjectId } = mongodb;

process.env.TZ = 'America/New_York';

const batchSize = 1000;
const ITERATIONS = 100_000;
const WARM_UP_FRAC = 1000;
const client = new MongoClient(process.env.MONGODB_URI, clientOptions);

const userId = new ObjectId('658ead67830644400403cdeb');
function getBaseDocument() {
  return {
    actionName: 'Action',
    groupId: new ObjectId(),
    groupKey: 'Group-',
    userId,
    content: 'sample.small.text',
    metadata: {
      project: { _id: new ObjectId(), type: 'type', name: 'project.name' },
      source: {
        _id: userId,
        email: 'mail@email.com',
        username: 'source.username',
        bio: 'source.bio',
        fullName: 'source.fullName',
        emotar: 'source.emotar',
        avatar: 'source.avatar'
      },
      note: {
        _id: new ObjectId(),
        name: 'note.name',
        status: 'open',
        note: 'comment.note'
      },
      comment: {
        _id: new ObjectId()
      },
      data: {
        _id: new ObjectId(),
        name: 'data.name',
        latestVersion: {
          _id: new ObjectId(),
          snapshotFragment: { url: 'latestVersion.snapshotFragment.url', width: 120, height: 240 }
        }
      }
    }
  };
}

async function removeAllDocuments(db) {
  const collection = db.collection('documents');
  await collection.deleteMany({});
}
// insert 10k documents to collection 'test'
async function insertDocuments(db) {
  const collection = db.collection('documents');
  const docs = [];
  for (let i = 0; i < 10_000; i++) {
    const newDoc = getBaseDocument();
    newDoc.groupKey += i % 20;
    docs.push(newDoc);
  }
  await collection.insertMany(docs);
}

async function main() {
  // connect and insert documents
  await client.connect();
  const db = client.db('atlas-case');

  console.log(
    [
      `PID: ${process.pid}`,
      `Node.js ${process.version}`,
      `MongoDB driver version ${mdbVersion}`,
      `MongoDB Server: ${(await db.command({ buildInfo: 1 })).version}`,
      `OS: ${os.platform()}`,
      `CPUs: ${os.cpus().length}`,
      `Arch: ${os.arch()}`,
      `RAM: ${os.totalmem() / 1e9} GB`
    ].join('\n')
  );

  await removeAllDocuments(db);
  await insertDocuments(db);

  console.log(
    '  Inserting',
    await db.collection('documents').countDocuments(),
    'documents completed'
  );

  // Warm up
  const startWarmup = perf_hooks.performance.now();
  for (let i = 0; i < ITERATIONS / WARM_UP_FRAC; i++) {
    const cursor = db.collection('documents').find({}, { batchSize });
    await cursor.toArray();
  }
  const endWarmup = perf_hooks.performance.now();

  const warmupTime = (endWarmup - startWarmup) / (ITERATIONS / WARM_UP_FRAC);
  console.log(
    '  Test should end:',
    new Date(+new Date() + warmupTime * ITERATIONS).toLocaleString('en-us'),
    process.env.TZ
  );

  const collection = db.collection('documents');
  const start = perf_hooks.performance.now();
  const histogram = perf_hooks.createHistogram();
  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    const cursor = collection.find({}, { batchSize });
    await cursor.toArray();
    histogram.record(performance.now() - start);
  }
  const end = perf_hooks.performance.now();

  console.log(`
    - Start: ${start} End: ${end}
    - Measurements:       ${(histogram.count + 1) / 2} in ${end - start} ms
    - Average time spent: ${(histogram.mean / 1e6).toFixed(3)} ms
    - Median time spent:  ${(histogram.percentiles.get(50) / 1e6).toFixed(3)} ms
    - Max time spent:     ${(histogram.max / 1e6).toFixed(3)} ms
    - Min time spent:     ${(histogram.min / 1e6).toFixed(3)} ms
    - Stddev time spent:  ${(histogram.stddev / 1e6).toFixed(3)} ms
  \n`);

  await client.close();
}

main().catch(console.error);
