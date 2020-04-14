import { Injectable, HttpService } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AppService {
  constructor(
    private httpService: HttpService
  )  {}
  @Cron('45 * * * * *')
  async handleCron() {
    console.log("starting");
    const result = await this.httpService.get("https://dku-studium.herokuapp.com/").toPromise();
    console.log("RESULT", result.data);
  }


  getHello(): string {
    return 'Hello World!';
  }
}
