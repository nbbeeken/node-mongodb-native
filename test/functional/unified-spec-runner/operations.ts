/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from 'chai';
import { Collection, Db } from '../../../src';
import { ChangeStream, Document, InsertOneOptions } from '../../../src';
import { BulkWriteResult } from '../../../src/bulk/common';
import { EventCollector } from '../../tools/utils';
import { EntitiesMap } from './entities';
import { expectErrorCheck, expectResultCheck } from './match';
import type * as uni from './schema';

async function abortTransactionOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function aggregateOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  const dbOrCollection = entities.get(op.object) as Db | Collection;
  if (!(dbOrCollection instanceof Db || dbOrCollection instanceof Collection)) {
    throw new Error(`Operation object '${op.object}' must be a db or collection`);
  }
  return dbOrCollection
    .aggregate(op.arguments.pipeline, {
      allowDiskUse: op.arguments.allowDiskUse,
      batchSize: op.arguments.batchSize,
      bypassDocumentValidation: op.arguments.bypassDocumentValidation,
      maxTimeMS: op.arguments.maxTimeMS,
      maxAwaitTimeMS: op.arguments.maxAwaitTimeMS,
      collation: op.arguments.collation,
      hint: op.arguments.hint,
      out: op.arguments.out
    })
    .toArray();
}
async function assertCollectionExistsOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function assertCollectionNotExistsOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function assertIndexExistsOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function assertIndexNotExistsOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function assertDifferentLsidOnLastTwoCommandsOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function assertSameLsidOnLastTwoCommandsOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function assertSessionDirtyOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function assertSessionNotDirtyOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function assertSessionPinnedOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function assertSessionUnpinnedOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function assertSessionTransactionStateOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function bulkWriteOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<BulkWriteResult> {
  const collection = entities.getEntity('collection', op.object);
  return collection.bulkWrite(op.arguments.requests);
}
async function commitTransactionOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  const session = entities.getEntity('session', op.object);
  return session.commitTransaction();
}
async function createChangeStreamOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<ChangeStream> {
  const watchable = entities.get(op.object);
  if (!('watch' in watchable)) {
    throw new Error(`Entity ${op.object} must be watchable`);
  }
  const changeStream = watchable.watch(op.arguments.pipeline, {
    fullDocument: op.arguments.fullDocument,
    maxAwaitTimeMS: op.arguments.maxAwaitTimeMS,
    resumeAfter: op.arguments.resumeAfter,
    startAfter: op.arguments.startAfter,
    startAtOperationTime: op.arguments.startAtOperationTime,
    batchSize: op.arguments.batchSize
  });
  changeStream.eventCollector = new EventCollector(changeStream, ['init', 'change', 'error']);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Change stream never started'));
    }, 2000);

    changeStream.cursor.once('init', () => {
      clearTimeout(timeout);
      resolve(changeStream);
    });
  });
}
async function createCollectionOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function createIndexOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function deleteOneOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  const collection = entities.getEntity('collection', op.object);
  return collection.deleteOne(op.arguments.filter);
}
async function dropCollectionOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function endSessionOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function findOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  const collection = entities.getEntity('collection', op.object);
  const { filter, sort, batchSize, limit } = op.arguments;
  return collection.find(filter, { sort, batchSize, limit }).toArray();
}
async function findOneAndReplaceOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  const collection = entities.getEntity('collection', op.object);
  return collection.findOneAndReplace(op.arguments.filter, op.arguments.replacement);
}
async function findOneAndUpdateOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  const collection = entities.getEntity('collection', op.object);
  const returnOriginal = op.arguments.returnDocument === 'Before';
  return (
    await collection.findOneAndUpdate(op.arguments.filter, op.arguments.update, { returnOriginal })
  ).value;
}
async function failPointOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  const client = entities.getEntity('client', op.arguments.client);
  return client.enableFailPoint(op.arguments.failPoint);
}
async function insertOneOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  const collection = entities.getEntity('collection', op.object);

  const session = entities.getEntity('session', op.arguments.session, false);

  const options = {
    session
  } as InsertOneOptions;

  return collection.insertOne(op.arguments.document, options);
}
async function insertManyOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  const collection = entities.getEntity('collection', op.object);

  const session = entities.getEntity('session', op.arguments.session, false);

  const options = {
    session,
    ordered: op.arguments.ordered ?? true
  };

  return collection.insertMany(op.arguments.documents, options);
}
async function iterateUntilDocumentOrErrorOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  const changeStream = entities.getEntity('stream', op.object);
  // Either change or error promise will finish
  return Promise.race([
    changeStream.eventCollector.waitAndShiftEvent('change'),
    changeStream.eventCollector.waitAndShiftEvent('error')
  ]);
}
async function listDatabasesOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function replaceOneOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  const collection = entities.getEntity('collection', op.object);
  return collection.replaceOne(op.arguments.filter, op.arguments.replacement, {
    bypassDocumentValidation: op.arguments.bypassDocumentValidation,
    collation: op.arguments.collation,
    hint: op.arguments.hint,
    upsert: op.arguments.upsert
  });
}
async function startTransactionOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<void> {
  const session = entities.getEntity('session', op.object);
  session.startTransaction();
}
async function targetedFailPointOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function deleteOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function downloadOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function uploadOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function withTransactionOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  throw new Error('not implemented.');
}
async function countDocumentsOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<number> {
  const collection = entities.getEntity('collection', op.object);
  return collection.countDocuments(op.arguments.filter as Document);
}
async function deleteManyOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  const collection = entities.getEntity('collection', op.object);
  return collection.deleteMany(op.arguments.filter);
}
async function distinctOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  const collection = entities.getEntity('collection', op.object);
  return collection.distinct(op.arguments.fieldName as string, op.arguments.filter as Document);
}
async function estimatedDocumentCountOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<number> {
  const collection = entities.getEntity('collection', op.object);
  return collection.estimatedDocumentCount();
}
async function findOneAndDeleteOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  const collection = entities.getEntity('collection', op.object);
  return collection.findOneAndDelete(op.arguments.filter);
}
async function runCommandOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  const db = entities.getEntity('db', op.object);
  return db.command(op.arguments.command);
}
async function updateManyOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  const collection = entities.getEntity('collection', op.object);
  return collection.updateMany(op.arguments.filter, op.arguments.update);
}
async function updateOneOperation(
  entities: EntitiesMap,
  op: uni.OperationDescription
): Promise<Document> {
  const collection = entities.getEntity('collection', op.object);
  return collection.updateOne(op.arguments.filter, op.arguments.update);
}

type RunOperationFn = (
  entities: EntitiesMap,
  op: uni.OperationDescription
) => Promise<Document | number | void>;
export const operations = new Map<string, RunOperationFn>();

operations.set('abortTransaction', abortTransactionOperation);
operations.set('aggregate', aggregateOperation);
operations.set('assertCollectionExists', assertCollectionExistsOperation);
operations.set('assertCollectionNotExists', assertCollectionNotExistsOperation);
operations.set('assertIndexExists', assertIndexExistsOperation);
operations.set('assertIndexNotExists', assertIndexNotExistsOperation);
operations.set(
  'assertDifferentLsidOnLastTwoCommands',
  assertDifferentLsidOnLastTwoCommandsOperation
);
operations.set('assertSameLsidOnLastTwoCommands', assertSameLsidOnLastTwoCommandsOperation);
operations.set('assertSessionDirty', assertSessionDirtyOperation);
operations.set('assertSessionNotDirty', assertSessionNotDirtyOperation);
operations.set('assertSessionPinned', assertSessionPinnedOperation);
operations.set('assertSessionUnpinned', assertSessionUnpinnedOperation);
operations.set('assertSessionTransactionState', assertSessionTransactionStateOperation);
operations.set('bulkWrite', bulkWriteOperation);
operations.set('commitTransaction', commitTransactionOperation);
operations.set('createChangeStream', createChangeStreamOperation);
operations.set('createCollection', createCollectionOperation);
operations.set('createIndex', createIndexOperation);
operations.set('deleteOne', deleteOneOperation);
operations.set('dropCollection', dropCollectionOperation);
operations.set('endSession', endSessionOperation);
operations.set('find', findOperation);
operations.set('findOneAndReplace', findOneAndReplaceOperation);
operations.set('findOneAndUpdate', findOneAndUpdateOperation);
operations.set('failPoint', failPointOperation);
operations.set('insertOne', insertOneOperation);
operations.set('insertMany', insertManyOperation);
operations.set('iterateUntilDocumentOrError', iterateUntilDocumentOrErrorOperation);
operations.set('listDatabases', listDatabasesOperation);
operations.set('replaceOne', replaceOneOperation);
operations.set('startTransaction', startTransactionOperation);
operations.set('targetedFailPoint', targetedFailPointOperation);
operations.set('delete', deleteOperation);
operations.set('download', downloadOperation);
operations.set('upload', uploadOperation);
operations.set('withTransaction', withTransactionOperation);

// Versioned API adds these:
operations.set('countDocuments', countDocumentsOperation);
operations.set('deleteMany', deleteManyOperation);
operations.set('distinct', distinctOperation);
operations.set('estimatedDocumentCount', estimatedDocumentCountOperation);
operations.set('findOneAndDelete', findOneAndDeleteOperation);
operations.set('runCommand', runCommandOperation);
operations.set('updateMany', updateManyOperation);
operations.set('updateOne', updateOneOperation);

export async function executeOperationAndCheck(
  operation: uni.OperationDescription,
  entities: EntitiesMap
): Promise<void> {
  const opFunc = operations.get(operation.name);
  expect(opFunc, `Unknown operation: ${operation.name}`).to.exist;

  let result;

  try {
    result = await opFunc(entities, operation);
  } catch (error) {
    // FIXME: Remove when project is done:
    if (error.message === 'not implemented.') {
      throw error;
    }
    if (operation.expectError) {
      expectErrorCheck(error, operation.expectError, entities);
    } else {
      expect.fail(`Operation ${operation.name} failed with ${error.message}`);
    }
    return;
  }

  // We check the positive outcome here so the try-catch above doesn't catch our chai assertions

  if (operation.expectError) {
    expect.fail(`Operation ${operation.name} succeeded but was not supposed to`);
  }

  if (operation.expectResult) {
    expect(expectResultCheck(result, operation.expectResult, entities)).to.be.true;
  }

  if (operation.saveResultAsEntity) {
    entities.set(operation.saveResultAsEntity, result);
  }
}