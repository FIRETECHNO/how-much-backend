import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';

@Module({
  imports: [],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule { }
