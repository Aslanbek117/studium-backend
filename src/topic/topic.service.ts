import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult } from 'typeorm';
import { CourseEntity } from '../course/course.entity';
import { UserEntity } from '../user/user.entity';
import { TutorialEntity } from '../tutorial/tutorial.entity';
import { Topic } from './topic.entity';
import { CreateTopicDTO } from './dto/create-topic';
import { UpdateTopicDTO } from './dto/update-topic';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async findAll(): Promise<Topic[]> {
    const topics: Topic[] = await this.topicRepository.find({relations: ['comments', 'course']})
    topics.map(t => 
    console.log(t.comments));
    return this.topicRepository.find({relations: ['comments', 'course']});
  }

  async findAllByCourseTitle({courseTitle}): Promise<Topic[]> {
    console.log('title', courseTitle)
    const course = await this.courseRepository.findOne({where: {title: courseTitle}, relations: ['topics', 'topics.comments', 'topics.user', 'topics.comments.user']})
    // course.topics
    
    // const topic = await this.topicRepository.find({where: {course: {id: '3'}}, relations: ['course', 'comments']});
    // console.log("da", topic)
    return course.topics;
  }

  async findBytopicId({topicId}): Promise<Topic> {
    console.log('topicId', topicId)
    const topic = await this.topicRepository.findOne({where: {id: topicId}, relations: ['comments', 'user', 'course', 'comments.user']});
    // course.topics
    
    // const topic = await this.topicRepository.find({where: {course: {id: '3'}}, relations: ['course', 'comments']});
    // console.log("da", topic)
    return topic;
  }

  async updateTopic(updateTopicDTO: UpdateTopicDTO): Promise<Topic> {
    const topic = await this.topicRepository.findOne({where: {id: updateTopicDTO.topicId, course: {id: updateTopicDTO.courseId}}, relations: ['comments', 'course']});
    topic.title = updateTopicDTO.title;
    return this.topicRepository.save(topic);
  }

  async create(topicDTO: CreateTopicDTO): Promise<Topic> {
    let topic = new Topic();
    const user = await this.userRepository.findOne({where: {id: topicDTO.userId}});
    const course = await this.courseRepository.findOne({where: {title: topicDTO.courseTitle}});
    topic.user = user;
    topic.course = course;
    topic.title = topicDTO.title;
    topic.body = topicDTO.body;
    const savedTopic = this.topicRepository.save(topic);
    return savedTopic;
  }

  async delete(id: string) {
    // let deleted = await this.courseRepository.delete({id: id});

    let deleted = await this.topicRepository.delete({id: parseInt(id)});
    return deleted.affected > 0 ? true : false;
  }

}
