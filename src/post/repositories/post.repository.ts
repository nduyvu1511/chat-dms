import { BaseRepository } from '@common/repositories'
import { ListRes } from '@common/types'
import { toListResponse } from '@common/utils'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { GetPostsQueryDto, UpdatePostDto } from '@post/dtos'
import { CategoryDocument, PostDocument } from '@post/models'
import { Post, PostRes } from '@post/types'
import { toPostResponse } from '@post/utils'
import { FilterQuery, Model } from 'mongoose'

@Injectable()
export class PostRepository extends BaseRepository<PostDocument> {
  constructor(
    @InjectModel('Category')
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel('Post')
    private readonly postModel: Model<PostDocument>
  ) {
    super(postModel)
  }

  deletePost(id: string) {
    return this.postModel.findByIdAndUpdate(id, { $set: { active: false } })
  }

  async restorePost(id: string) {
    return this.postModel.findByIdAndUpdate(id, { $set: { active: true } })
  }

  async getPostByQuery(filter: FilterQuery<Post>): Promise<PostRes | null> {
    const data = await this.postModel
      .findOne(filter)
      .populate({
        path: 'author',
        model: 'User',
      })
      .populate({
        path: 'category',
        model: 'Category',
        options: { strictPopulate: false },
      })
      .populate({
        path: 'thumbnail',
        model: 'Attachment',
      })

    if (!data?._id) return null

    return toPostResponse(data as any)
  }

  async getPosts({
    limit,
    category_id,
    keyword,
    offset,
  }: GetPostsQueryDto): Promise<ListRes<PostRes[]>> {
    const query: FilterQuery<Post> = { $and: [{ active: true }] }

    console.log('query: ', { category_id, keyword, limit, offset })

    if (category_id) {
      query.$and.push({ category: category_id })
    }

    if (keyword) {
      query.$and.push({
        title: { $regex: keyword, $options: 'i' },
      })
    }

    console.log('----')
    console.log(query)

    const data = await this.postModel
      .find(query)
      .populate({
        path: 'author',
        model: 'User',
      })
      .populate({
        path: 'category',
        model: 'Category',
      })
      .populate({
        path: 'thumbnail',
        model: 'Attachment',
      })
      .limit(limit)
      .skip(offset)
      .sort({ created_at: -1 })

    const total = await this.postModel.countDocuments(query)

    console.log('data: ', data)

    return toListResponse({
      data,
      total,
      limit,
      offset,
    }) as ListRes<PostRes[]>
  }
}
