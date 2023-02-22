import { PaginationDto } from '@common/dtos'
import { OBJECT_ID_REGEX } from '@common/regex'
import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsNotEmpty, IsOptional, IsString, Matches, ValidateNested } from 'class-validator'

export class CreatePostDto {
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsString()
  title: string

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  sub_title: string

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsString()
  content: string

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsString()
  @Matches(OBJECT_ID_REGEX)
  attachment_id: string

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsString()
  short_content: string

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsString()
  @Matches(OBJECT_ID_REGEX)
  category_id: string

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsString()
  slug: string

  @ApiProperty({ type: [String] })
  @IsArray()
  @ValidateNested({ each: true })
  tags?: string[]
}

export class UpdatePostDto {
  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  title: string

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  sub_title: string

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  content: string

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  @Matches(OBJECT_ID_REGEX)
  attachment_id: string

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  short_content: string

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  @Matches(OBJECT_ID_REGEX)
  category_id: string

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  slug: string

  @ApiProperty({ type: [String] })
  @IsArray()
  @ValidateNested({ each: true })
  tags?: string[]
}

export class GetPostsQueryDto extends PaginationDto {
  @ApiProperty()
  @Expose()
  @IsOptional()
  keyword?: string

  @ApiProperty()
  @Expose()
  @IsOptional()
  @Matches(OBJECT_ID_REGEX)
  category_id?: string
}

export class CreateCategoryDto {
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsString()
  slug: string

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  @Matches(OBJECT_ID_REGEX)
  parent_id: string

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  @Matches(OBJECT_ID_REGEX)
  attachment_id: string

  @ApiProperty()
  @Expose()
  @IsString()
  @IsOptional()
  desc: string
}

export class UpdateCategoryDto {
  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  slug: string

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  name: string

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  @Matches(OBJECT_ID_REGEX)
  parent_id: string

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  @Matches(OBJECT_ID_REGEX)
  attachment_id: string

  @ApiProperty()
  @Expose()
  @IsString()
  @IsOptional()
  desc: string
}

export class GetCategoriesQueryDto extends PaginationDto {
  @ApiProperty()
  @Expose()
  @IsOptional()
  @Type(() => String)
  keyword?: string

  @ApiProperty()
  @Expose()
  @IsOptional()
  @Type(() => String)
  @Matches(OBJECT_ID_REGEX)
  parent_id?: string
}
