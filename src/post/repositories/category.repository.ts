import { BaseRepository } from '@common/repositories'
import { ListRes } from '@common/types'
import { toListResponse } from '@common/utils'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { GetCategoriesQueryDto } from '@post/dtos'
import { CategoryDocument, PostDocument } from '@post/models'
import { Category, CategoryPopulate, CategoryRes } from '@post/types'
import { toCategoryResponse } from '@post/utils'
import { FilterQuery, Model } from 'mongoose'

@Injectable()
export class CategoryRepository extends BaseRepository<CategoryDocument> {
  constructor(
    @InjectModel('Category')
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel('Post')
    private readonly postModel: Model<PostDocument>
  ) {
    super(categoryModel)
  }

  getBySlug(slug: string) {
    return this.categoryModel.findOne({ $and: [{ slug }, { active: true }] })
  }

  async getCategory(id: string): Promise<CategoryRes | null> {
    const data = (await this.categoryModel
      .findOne({ $and: [{ _id: id }, { active: true }] })
      .populate({
        path: 'image',
        model: 'Attachment',
      })) as CategoryPopulate

    if (!data?._id) return null

    return toCategoryResponse(data)
  }

  async getCategories({
    keyword,
    limit,
    offset,
    parent_id,
  }: GetCategoriesQueryDto): Promise<ListRes<CategoryRes[]> | null> {
    const query: FilterQuery<Category> = { $and: [{ active: true }] }

    if (parent_id) {
      query.$and.push({ category: parent_id })
    }

    if (keyword) {
      query.$and.push({
        name: { $regex: keyword, $options: 'i' },
      })
    }

    console.log('cate query: ', query)

    const data = await this.categoryModel
      .find(query)
      .populate({
        path: 'image',
        model: 'Attachment',
      })
      .limit(limit)
      .skip(offset)
      .sort({ created_at: -1 })

    const total = await this.postModel.countDocuments(query)

    return toListResponse({
      data,
      total,
      limit,
      offset,
    }) as ListRes<CategoryRes[]>
  }
}
