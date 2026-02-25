// create-user.dto.ts
import {
  IsDateString,
  IsString,
  Matches,
  IsOptional,
  IsISO8601,
  IsEnum,
  IsObject,
  IsLatitude,
  IsLongitude,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

class BirthPlaceDto {
  @IsLatitude({ message: 'Invalid latitude value' })
  @Type(() => Number)
  latitude: number;

  @IsLongitude({ message: 'Invalid longitude value' })
  @Type(() => Number)
  longitude: number;
}

export class HoroscopeReadInputDto {
  @IsDateString(
    {},
    {
      message: 'dateOfBirth must be a valid date (YYYY-MM-DD)',
    },
  )
  @Transform(({ value }) => value?.trim())
  dateOfBirth: string;

  @IsString({ message: 'timeOfBirth must be a string' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'timeOfBirth must be in 24-hour format (HH:MM), e.g., 14:30',
  })
  timeOfBirth: string;

  @IsEnum(Gender, { message: 'gender must be male or female' })
  gender: Gender;

  @IsObject()
  @ValidateNested()
  @Type(() => BirthPlaceDto)
  birth_place: BirthPlaceDto;
}
