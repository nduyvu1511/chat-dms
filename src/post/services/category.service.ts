import { AttachmentRepository } from '@attachment/repositories'
import { Attachment } from '@attachment/types'
import { compareTwoObjectId, createSlug } from '@common/helpers'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateCategoryDto } from '@post/dtos'
import { CategoryRepository, PostRepository } from '@post/repositories'
import { Category, CategoryPopulate, CategoryRes } from '@post/types'
import { toCategoryResponse } from '@post/utils'
import { GetCategoriesQueryDto, UpdateCategoryDto } from './../dtos/index'

@Injectable()
export class CategoryService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly attachmentRepository: AttachmentRepository
  ) {}

  async findCategory(id: string): Promise<Category> {
    const data = await this.categoryRepository.findById(id)
    if (!data?._id) {
      throw new HttpException('Category not found', HttpStatus.BAD_REQUEST)
    }

    return data as Category
  }

  async findAttachment(id: string): Promise<Attachment> {
    const data = await this.attachmentRepository.findById(id)
    if (!data?._id) {
      throw new HttpException('Attachment not found', HttpStatus.BAD_REQUEST)
    }

    return data as Attachment
  }

  async createCategory(params: CreateCategoryDto) {
    const image = params?.attachment_id ? await this.findAttachment(params.attachment_id) : null
    const parent_category = params?.parent_id ? await this.findCategory(params.parent_id) : null

    const category = await this.categoryRepository.create({
      slug: createSlug(params.slug),
      desc: params?.desc || null,
      name: params.name,
      image: image?._id || null,
      parent_id: parent_category?._id || null,
    })

    return toCategoryResponse({ ...category, image } as CategoryPopulate)
  }

  async deleteCategory(id: string) {
    const count = await this.postRepository.countDocuments({ category: id })
    if (count > 0) {
      throw new HttpException(
        'Can not delete this category because it contains posts not found',
        HttpStatus.BAD_REQUEST
      )
    }

    await this.categoryRepository.findOneAndDelete({ _id: id })
    return { category_id: id }
  }

  async updateCategory(id: string, params: UpdateCategoryDto): Promise<CategoryRes> {
    const categ = await this.findCategory(id)

    if (params?.slug) {
      params.slug = createSlug(params.slug)
    }

    if (params.attachment_id && !compareTwoObjectId(categ.image, params.attachment_id)) {
      const imageRes = await this.findAttachment(params.attachment_id)
      params.attachment_id = imageRes._id
    }

    if (params?.parent_id && !compareTwoObjectId(params?.parent_id, categ.parent_id)) {
      const attachmentRes = await this.findCategory(params.parent_id)
      params.parent_id = attachmentRes._id
    }

    const count = await this.postRepository.countDocuments({ category: id })
    if (count > 0) {
      throw new HttpException(
        'Can not delete this category because it contains posts not found',
        HttpStatus.BAD_REQUEST
      )
    }

    await this.categoryRepository.findOneAndUpdate({ _id: id }, params)
    return await this.categoryRepository.getCategory(id)
  }

  async getCategories(params: GetCategoriesQueryDto) {
    return await this.categoryRepository.getCategories(params)
  }

  async getOneCategory(id: string) {
    return await this.categoryRepository.getCategory(id)
  }
}
