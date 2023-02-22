import { Document, FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose'

export class BaseRepository<T extends Document> {
  constructor(private readonly model: Model<T>) {}

  async findById(id: string, options?: QueryOptions): Promise<T> {
    return this.model.findById(id, { __v: 0, ...options }).lean()
  }

  findOne(filter?: FilterQuery<T>, projection?: Record<string, unknown>): Promise<T | null> {
    return this.model
      .findOne(filter, {
        __v: 0,
        ...projection,
      })
      .exec()
  }

  async find(filter?: FilterQuery<T>, options?: QueryOptions<T>): Promise<T[]> {
    return this.model.find(filter, undefined, { lean: true, ...options })
  }

  async countDocuments(filter: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter)
  }

  async create(doc: unknown): Promise<T> {
    const createdEntity = new this.model(doc)
    return createdEntity.save()
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<T>,
    updateEntityData: UpdateQuery<unknown>,
    options?: QueryOptions<T>
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(filterQuery, updateEntityData, {
      new: true,
      lean: true,
      projection: {
        __v: 0,
      },
      ...options,
    })
  }

  async deleteMany(filterQuery: FilterQuery<T>): Promise<boolean> {
    const deleteResult = await this.model.deleteMany(filterQuery)
    return deleteResult.deletedCount >= 1
  }

  async findOneAndDelete(filterQuery: FilterQuery<T>, options?: QueryOptions<T>): Promise<boolean> {
    return await this.model.findOneAndDelete(filterQuery, options)
  }

  async aggregate(option: any) {
    return this.model.aggregate(option)
  }

  async populate(result: T[], option: any) {
    return await this.model.populate(result, option)
  }
}
