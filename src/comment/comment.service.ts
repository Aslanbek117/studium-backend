import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult, In } from 'typeorm';
import { CourseEntity } from '../course/course.entity';
import { UserEntity } from '../user/user.entity';
import { TutorialEntity } from '../tutorial/tutorial.entity';
import { Comment } from './comment.entity';
import { CreateCommentDTO } from './dto/create-comment';
import { UpdateCommentDTO } from './dto/update-comment';
import { Topic } from '../topic/topic.entity';
@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async findAll(): Promise<Comment[]> {

    return this.commentRepository.find({relations: [ 'topic']});
  }

  async findlAllByTutorialId(topicId: string): Promise<Comment[]> {
    return this.commentRepository.find({where: {topic: {id: topicId}}, relations: ['topic']});
  }

  async updateComment(updateCommentDTO: UpdateCommentDTO): Promise<Comment> {
    const comment = await this.commentRepository.findOne({where: {id: updateCommentDTO.commentId, topic: {id: updateCommentDTO.topicId}}, relations: ['topic']});
    comment.body = updateCommentDTO.body;
    return this.commentRepository.save(comment);
  }

  async create(commentDTO: CreateCommentDTO): Promise<Comment> {
    let comment = new Comment();
    const user = await this.userRepository.findOne({where: {id: parseInt(commentDTO.userId)}});
    const topic = await this.topicRepository.findOne({where: {id: commentDTO.topicId}, relations: ['comments']});
    comment.user = user;
    comment.topic = topic;
    comment.body = commentDTO.body;
    // console.log("topic", topic.comments);
    // if (topic.comments == null) {
    //     topic.comments = [comment];
        
    // } else if (topic.comments.length > 0) {
    //     topic.comments.push(comment);
    // }
    // console.log("DA", topic)
    const savedComment = this.commentRepository.save(comment);
    // await this.topicRepository.update(topic, {comments: topic.comments});
    return savedComment;
  }


  async delete(commentId: string): Promise<String> {

    return "asdas"
  }

}
