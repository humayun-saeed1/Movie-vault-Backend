import { PartialType } from '@nestjs/swagger';
import { CreateActorDto } from './create-actor.dto.js';

export class UpdateActorDto extends PartialType(CreateActorDto) { }
