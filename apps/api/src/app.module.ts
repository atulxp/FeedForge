import { Module } from '@nestjs/common'
import { AccountsController } from './modules/accounts/accounts.controller'
import { DashboardController } from './modules/dashboard/dashboard.controller'
import { HealthController } from './modules/health/health.controller'
import { PostsController } from './modules/posts/posts.controller'
import { LocalStore } from './store/local.store'

@Module({
  controllers: [HealthController, AccountsController, DashboardController, PostsController],
  providers: [LocalStore],
})
export class AppModule {}
