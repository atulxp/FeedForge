import { Controller, Get } from '@nestjs/common'

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'feedforge-api',
      storage: 'local-file',
      timestamp: new Date().toISOString(),
    }
  }
}
