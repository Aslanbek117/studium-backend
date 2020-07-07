export class CreateChapterDTO {
  readonly title: string;
  readonly body: string;
  readonly tags: string[];
  readonly userId: string;
  readonly courseId: string;
}
