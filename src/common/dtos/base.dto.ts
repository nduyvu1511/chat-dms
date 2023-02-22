import { DEFAULT_LIMIT } from '@common/constant'
import { ApiProperty } from '@nestjs/swagger'
import {
  ClassConstructor,
  ClassTransformOptions,
  Expose,
  plainToInstance,
  Transform,
  Type,
} from 'class-transformer'
import { Allow, IsArray, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator'

export abstract class BaseDto {
  @Expose()
  _id: string

  @Expose()
  created_at: string

  @Expose()
  updated_at: string

  static plainToClass<T>(cls: ClassConstructor<T>, plain: T, options?: ClassTransformOptions) {
    return plainToInstance(cls, plain, { excludeExtraneousValues: true, ...options })
  }
}

export class HttpResponseDto<T> {
  @ApiProperty()
  message: string

  @ApiProperty()
  success: boolean

  @ApiProperty()
  status_code: number

  @ApiProperty()
  data: T
}
export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : 0))
  @Expose()
  offset?: number

  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : DEFAULT_LIMIT))
  @Expose()
  limit?: number
}

export class LngLatDto {
  @Expose()
  @IsNotEmpty()
  lng: string

  @Expose()
  @IsNotEmpty()
  lat: string
}

export interface HttpResponseType<T> {
  message: string
  success: boolean
  status_code: number
  data: T
}

export class Parent<T> {
  @Allow()
  public items: T[]
}

export function createMyClass<T>(Tyspe: T) {
  class ClassName {
    @IsNotEmpty()
    @Expose()
    @IsArray()
    @ValidateNested({
      each: true,
    })
    @Type(() => Tyspe as Function)
    public items: T[]
  }
  return ClassName
}
