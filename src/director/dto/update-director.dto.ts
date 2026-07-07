import { PartialType } from '@nestjs/swagger';
import { CreateDirectorDto } from './create-director.dto.js';

export class UpdateDirectorDto extends PartialType(CreateDirectorDto) { }
