import { Controller, Get, Header } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  @Header('Content-Type', 'text/plain')
  health() {
    return 'Hello world';
  }
}
