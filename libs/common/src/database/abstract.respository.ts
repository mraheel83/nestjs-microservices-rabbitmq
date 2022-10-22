import { Logger, NotFoundException } from '@nestjs/common';
import {
  Connection,
  FilterQuery,
  Model,
  SaveOptions,
  Types,
  UpdateQuery,
} from 'mongoose';
import { AbstractSchema } from './abstract.schema';

export abstract class AbstractRepository<TDocument extends AbstractSchema> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) {}

  /**
   * To find a document in collection by provided filter query.
   *
   * @param filterQuery
   * @returns
   */
  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = await this.model.findOne(filterQuery);
    this.validateDocument(filterQuery, document);

    return document;
  }

  /**
   * To create a single document.
   *
   * @param document
   * @param options
   * @returns
   */
  async create(
    document: Omit<TDocument, '_id'>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const createDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });

    return (
      await createDocument.save(options)
    ).toJSON() as unknown as TDocument;
  }

  /**
   * To find one or more documents by provided filter query.
   *
   * @param filterQuery
   * @returns
   */
  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    return this.model.find(filterQuery, {}, { lean: true });
  }

  /**
   * To update a document that will first find by the filter query.
   *
   * @param filterQuery
   * @param update
   * @returns
   */
  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ) {
    const document = await this.model.findOneAndUpdate(filterQuery, update, {
      lean: true,
      new: true,
    });
    this.validateDocument(filterQuery, document);

    return document;
  }

  /**
   * To upsert an existing document.
   *
   * @param filterQuery
   * @param document
   * @returns
   */
  async upsert(
    filterQuery: FilterQuery<TDocument>,
    document: Partial<TDocument>,
  ) {
    return this.model.findOneAndUpdate(filterQuery, document, {
      lean: true,
      new: true,
      upsert: true,
    });
  }

  /**
   * To start a MongoDB session to associated with client session for consistency.
   */
  async startTransaction() {
    const session = await this.connection.startSession();
    session.startTransaction();

    return session;
  }

  /**
   * To validate the returned document.
   *
   * @param filterQuery
   * @param document
   */
  private validateDocument(
    filterQuery: FilterQuery<TDocument>,
    document: TDocument,
  ): void {
    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found');
    }
  }
}
