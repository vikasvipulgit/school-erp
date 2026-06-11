import { Module, Global } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../database/entities/user.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
