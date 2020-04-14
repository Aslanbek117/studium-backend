export class CreateTutorialDTO {
  readonly title: string;
  readonly body: string;
  readonly input: [any[]];
  readonly output: any[];
  readonly isLecture: boolean;
  readonly exampleCode: string;
}
