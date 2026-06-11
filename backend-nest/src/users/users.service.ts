import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { UpdateUserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private repo: Repository<UserEntity>,
  ) {}

  async findAll(role?: string) {
    const where = role ? { role: role as any } : {};
    const users = await this.repo.find({ 
      where,
      order: { createdAt: 'DESC' } 
    });
    return users.map(this.sanitize);
  }

  async findOne(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
  }

  async saveFcmToken(userId: string, fcmToken: string) {
    await this.repo.update(userId, { fcmToken });
    return { success: true };
  }

  private sanitize(user: UserEntity) {
    const { passwordHash, refreshTokenHash, ...safe } = user;
    return safe;
  }
}
