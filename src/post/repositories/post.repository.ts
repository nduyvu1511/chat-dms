import { BaseRepository } from '@common/repositories'
import { ListRes } from '@common/types'
import { toListResponse } from '@common/utils'
import { RoomPopulate } from '@conversation/types'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { GetPostsQueryDto, UpdatePostDto } from '@post/dtos'
import { CategoryDocument, PostDocument } from '@post/models'
import { Post, PostPopulate, PostRes } from '@post/types'
import { toPostListResponse, toPostResponse } from '@post/utils'
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

  async updatePost(id: string, post: UpdatePostDto) {
    return this.postModel.findByIdAndUpdate(id, post, { new: true })
  }

  async getPostByQuery(filter: FilterQuery<Post>): Promise<PostRes | null> {
    const data = await this.postModel
      .findOne(filter)
      .populate({
        path: 'author',
        model: 'User',
      })
      .populate({
        path: 'Category',
        model: 'category',
      })
      .populate({
        path: 'Attachment',
        model: 'thumbnail',
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

    if (category_id) {
      query.$and.push({ category: category_id })
    }

    if (keyword) {
      query.$and.push({
        title: { $regex: keyword, $options: 'i' },
      })
    }

    console.log({ query })

    const data = await this.postModel
      .find(query)
      .populate({
        path: 'author',
        model: 'User',
      })
      .populate({
        path: 'Category',
        model: 'category',
      })
      .populate({
        path: 'Attachment',
        model: 'thumbnail',
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
    }) as ListRes<PostRes[]>
  }
}
