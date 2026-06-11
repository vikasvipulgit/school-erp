import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../database/entities/user.entity';
import { StudentEntity } from '../../database/entities/student.entity';
import { Role } from '../../common/enums/role.enum';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(StudentEntity)
    private studentRepo: Repository<StudentEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.role === Role.STUDENT && payload['studentId']) {
      const student = await this.studentRepo.findOne({ where: { id: payload.sub } });
      if (!student) throw new UnauthorizedException('Student no longer exists');
      return {
        id: student.id,
        studentId: student.studentId,
        role: Role.STUDENT,
        schoolId: 'school_001', // defaults to school_001 for now
      };
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('User no longer exists');
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      teacherId: user.teacherId,
      schoolId: user.schoolId,
    };
  }
}
