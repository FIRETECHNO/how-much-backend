import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  Body,
  Query,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { Throttle } from '@nestjs/throttler';

import { Response } from 'express';

import * as fs from 'node:fs';
import { join } from 'path';

import YaCloud from 'src/s3/bucket';

// mongo
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Throttle({ default: { limit: 100, ttl: 200000, blockDuration: 5 * 60000 } })
@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService,
  ) { }


  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('lesson_id') lessonId: string,
    @Body('filename') filename: string,
    @Body('chunkIndex') chunkIndex: number,
    @Body('totalChunks') totalChunks: number
  ) {
    return
    const filePath = join(__dirname, '..', '..', 'public', 'lesson-videos', filename);
    const uploadDir = join(__dirname, '..', '..', 'public', 'lesson-videos');

    // Ensure the upload directory exists
    // Note: You can check if the directory exists and create it if it doesn't
    fs.mkdirSync(uploadDir, { recursive: true })

    // Write the chunk to the file
    const writeStream = fs.createWriteStream(filePath, { flags: 'a' });
    writeStream.write(file.buffer);
    writeStream.end();

    // console.log(chunkIndex, totalChunks);
    // Check if it's the last chunk, and if so, perform final steps
    if (Number(chunkIndex) + 1 == Number(totalChunks)) {
      // Handle merging or finalize the upload, send a response, etc.
      // console.log(fileBuffer);
      // setTimeout(() => {

      //   return fs.readFile(filePath, async (err, data) => {
      //     console.log(err, data);

      //     let presignedUrl = await YaCloud.generatePresignedUrl('lesson-videos/' + filename)
      //     // console.log(presignedUrl);

      //     let result = await YaCloud.uploadVideo(data, presignedUrl);
      //     // console.log(result);

      //     return await this.LessonModel.findByIdAndUpdate(lessonId, { $push: { videos: process.env.API_URL + '/static/lesson-videos/' + String(filename) } })
      //   })
      // }, 1000);

      let hlsResult = await this.videoService.createHLS(filePath, lessonId)
      if (hlsResult.status == 'error') {
        return hlsResult
      }

      // return await this.LessonModel.findByIdAndUpdate(lessonId, { $push: { videos: process.env.API_URL + '/static/lesson-videos/' + String(filename) } })
    }

    return { message: 'Chunk uploaded successfully', chunkIndex };
  }

  // @Get('stream/lesson-video')
  // async streamVideo(@Query('filename') filename: string, @Res() res: Response) {
  //   const filePath = join(__dirname, '..', '..', 'public', filename); // Path to your video files

  //   try {
  //     const stats = statSync(filePath);
  //     const fileSize = stats.size;
  //     const range = res.headers['range'];

  //     if (!range) {
  //       res.writeHead(200, {
  //         'Content-Length': fileSize,
  //         'Content-Type': 'video/mp4',
  //       });
  //       createReadStream(filePath).pipe(res);
  //     } else {
  //       const parts = range.replace(/bytes=/, '').split('-');
  //       const start = parseInt(parts[0], 10);
  //       const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  //       if (start >= fileSize || end >= fileSize || start > end) {
  //         res.status(416).send('Requested Range Not Satisfiable');
  //         return;
  //       }

  //       const chunksize = end - start + 1;
  //       const file = createReadStream(filePath, { start, end });

  //       res.writeHead(206, {
  //         'Content-Range': `bytes ${start}-${end}/${fileSize}`,
  //         'Accept-Ranges': 'bytes',
  //         'Content-Length': chunksize,
  //         'Content-Type': 'video/mp4',
  //       });

  //       file.pipe(res);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     res.status(404).send('File not found');
  //   }
  // }
}