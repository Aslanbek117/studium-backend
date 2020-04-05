export class CreateTutorialDTO {
  readonly title: string;
  readonly body: string;
  readonly input: string[];
  readonly output: string[];
  readonly isLecture: boolean;
}
