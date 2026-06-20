import { Controller, Get } from '@nestjs/common'
import { LocalStore } from '../../store/local.store'

@Controller('accounts')
export class AccountsController {
  constructor(private readonly store: LocalStore) {}

  @Get()
  getAccounts() {
    return this.store.getAccounts()
  }
}
