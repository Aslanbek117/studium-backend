import { CourseEntity } from "../course/course.entity";
import { UserToTutorials } from "./user-tutorials.entity";

export interface UserData {
  username: string;
  lastname: string;
  course: string;
  email: string;
  id: number;
  token: string;
  role: string;
  bio: string;
  image?: string;
  courses: CourseEntity[];
  userToTutorials: UserToTutorials[];
  password: string;
}

export interface UserRO {
  user: UserData;
}