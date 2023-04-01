import { HttpResponse } from '@common/utils'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ValidationPipe } from '@nestjs/common/pipes'
import { ApiTags } from '@nestjs/swagger'
import { CreateCategoryDto, GetCategoriesQueryDto, UpdateCategoryDto } from '@post/dtos'
import { CategoryService } from '@post/services'
import { AuthGuard } from '@user/guards'
import { plainToClass } from 'class-transformer'

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createCategory(@Body(new ValidationPipe()) params: CreateCategoryDto) {
    try {
      return this.categoryService.createCategory(
        plainToClass(CreateCategoryDto, params, { excludeExtraneousValues: true })
      )
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get()
  async getCategories(@Query() params: GetCategoriesQueryDto) {
    try {
      const res = await this.categoryService.getCategories(
        plainToClass(GetCategoriesQueryDto, params, { excludeExtraneousValues: true })
      )
      return new HttpResponse(res)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateCategory(@Param('id') id: string, @Body() params: UpdateCategoryDto) {
    try {
      return this.categoryService.updateCategory(
        id,
        plainToClass(UpdateCategoryDto, params, { excludeExtraneousValues: true })
      )
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get(':id')
  async getOneCategory(@Param('id') id: string) {
    try {
      return await this.categoryService.getOneCategory(id)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    try {
      return await this.categoryService.deleteCategory(id)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }
}
