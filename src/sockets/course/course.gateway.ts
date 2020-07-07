import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChapterService } from 'src/chapter/chapter.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ChapterEntity } from 'src/chapter/chapter.entity';
import { Repository } from 'typeorm';
import { CourseEntity } from 'src/course/course.entity';
import { timer } from 'rxjs';

@WebSocketGateway()
export class CourseGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        @InjectRepository(ChapterEntity)
        private chapterRepository: Repository<ChapterEntity>,
        @InjectRepository(CourseEntity)
        private readonly courseRepository: Repository<CourseEntity>
    ) { }


    @WebSocketServer() server;
    administrators = [];

    async handleConnection(client: any) {
        this.administrators.push(client);
    }

    async handleDisconnect(client) {
        for (let i = 0; i < this.administrators.length; i++) {
            if (this.administrators[i] === client) {
                this.administrators.splice(i, 1);
                break;
            }
        }
        this.broadcast('disconnect', {});
    }

    private broadcast(event, message: any) {
        const broadCastMessage = message;
        for (let c of this.administrators) {
          c.emit(event, broadCastMessage);
        }
      }

    @SubscribeMessage('course')
    async onChat(client, message) {
        console.log("messsage", message)
        client.broadcast.emit('course', message);
    }


    @SubscribeMessage('chapters')
    async onChapterChange(client, messagez) {
        console.log("here")
        await this.sleep(2000);
        const courses = await this.courseRepository.find({ relations: ['students', 'chapters', 'chapters.tutorials', 'students.userToTutorials', 'students.userToTutorials.decisions'] });
        // client.emit('chapters', courses)
        
        this.broadcast('chapters', courses)
    }

    async sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}
