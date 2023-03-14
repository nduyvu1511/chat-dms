import { AttachmentDocument } from '@attachment/models'
import { AttachmentRepository } from '@attachment/repositories'
import { Attachment } from '@attachment/types'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreatePostDto, GetPostsQueryDto, UpdatePostDto } from '@post/dtos'
import { CategoryDocument } from '@post/models'
import { CategoryRepository, PostRepository } from '@post/repositories'
import { Category, PostPopulate, PostRes } from '@post/types'
import { toPostResponse } from '@post/utils'
import { User } from '@user/types'

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly attachmentRepository: AttachmentRepository
  ) {}

  async getCategory(id: string): Promise<CategoryDocument> {
    const data = await this.categoryRepository.findById(id)
    if (!data?._id) {
      throw new HttpException('Category not found', HttpStatus.UNAUTHORIZED)
    }

    return data
  }

  async getPostBySlug(slug: string): Promise<PostRes> {
    return await this.postRepository.getPostByQuery({ slug })
  }

  async getPostById(_id: string): Promise<PostRes> {
    return await this.postRepository.getPostByQuery({ _id })
  }

  async getAttachment(id: string): Promise<AttachmentDocument> {
    const data = await this.attachmentRepository.findById(id)
    if (!data?._id) {
      throw new HttpException('Attachment not found', HttpStatus.UNAUTHORIZED)
    }

    return data
  }

  async createPost(params: CreatePostDto, user: User) {
    const category = (await this.getCategory(params.category_id)) as Category
    const thumbnail = (await this.getAttachment(params.attachment_id)) as Attachment

    const post = await this.postRepository.create({
      author: user._id,
      category: params.category_id,
      content: params.content,
      short_content: params.short_content,
      slug: params.slug,
      sub_title: params.sub_title,
      thumbnail: params.attachment_id,
      title: params.title,
      tags: params?.tags || [],
    })

    return toPostResponse({ ...post, category, thumbnail, author: user } as PostPopulate)
  }

  async deletePost(id: string) {
    return await this.postRepository.deletePost(id)
  }

  async restorePost(id: string) {
    return await this.postRepository.restorePost(id)
  }

  async updatePost(id: string, params: UpdatePostDto) {
    return await this.postRepository.findOneAndUpdate({ _id: id }, params)
  }

  async getPosts(params: GetPostsQueryDto) {
    return await this.postRepository.getPosts(params)
  }
}
