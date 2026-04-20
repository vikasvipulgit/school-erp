import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveApplicationEntity, LeaveStatus } from '../database/entities/leave-application.entity';
import { ProxyAssignmentEntity, ProxyStatus } from '../database/entities/proxy-assignment.entity';
import { SubmitLeaveDto, ReviewLeaveDto, CreateProxyDto } from './dto/leave.dto';
import { Role } from '../common/enums/role.enum';

interface CurrentUser { id: string; role: Role; teacherId: string; }

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveApplicationEntity)
    private leaveRepo: Repository<LeaveApplicationEntity>,
    @InjectRepository(ProxyAssignmentEntity)
    private proxyRepo: Repository<ProxyAssignmentEntity>,
  ) {}

  // ─── Leave ────────────────────────────────────────────────────────────────

  async findAll(user: CurrentUser) {
    const isPrivileged = [Role.ADMIN, Role.PRINCIPAL, Role.COORDINATOR].includes(user.role);
    if (isPrivileged) {
      return this.leaveRepo.find({ order: { submittedAt: 'DESC' } });
    }
    return this.leaveRepo.find({
      where: { teacherId: user.teacherId },
      order: { submittedAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const leave = await this.leaveRepo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave application not found');
    return leave;
  }

  async submit(dto: SubmitLeaveDto, user: CurrentUser) {
    const teacherId = dto.teacherId || user.teacherId;
    if (!teacherId) throw new ForbiddenException('Teacher ID required');
    const entity = this.leaveRepo.create({
      teacherId,
      leaveType: dto.leaveType,
      startDate: dto.startDate,
      endDate: dto.endDate,
      reason: dto.reason,
      status: LeaveStatus.PENDING,
      submittedAt: new Date(),
      schoolId: 'school_001',
    });
    return this.leaveRepo.save(entity);
  }

  async approve(id: string, user: CurrentUser) {
    const leave = await this.findOne(id);
    await this.leaveRepo.update(id, {
      status: LeaveStatus.APPROVED,
      approvedBy: user.id,
      approvedAt: new Date(),
    });
    return this.findOne(id);
  }

  async reject(id: string, dto: ReviewLeaveDto, user: CurrentUser) {
    await this.findOne(id);
    await this.leaveRepo.update(id, {
      status: LeaveStatus.REJECTED,
      approvedBy: user.id,
      approvedAt: new Date(),
      remarks: dto.remarks,
    });
    return this.findOne(id);
  }

  // ─── Proxy ────────────────────────────────────────────────────────────────

  findAllProxies() {
    return this.proxyRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findProxy(id: string) {
    const p = await this.proxyRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Proxy assignment not found');
    return p;
  }

  async createProxy(dto: CreateProxyDto, user: CurrentUser) {
    const entity = this.proxyRepo.create({
      ...dto,
      status: ProxyStatus.PENDING,
    });
    return this.proxyRepo.save(entity);
  }

  async approveProxy(id: string, user: CurrentUser) {
    await this.findProxy(id);
    await this.proxyRepo.update(id, {
      status: ProxyStatus.APPROVED,
      approvedBy: user.id,
      approvedAt: new Date(),
    });
    return this.findProxy(id);
  }

  async rejectProxy(id: string, user: CurrentUser) {
    await this.findProxy(id);
    await this.proxyRepo.update(id, {
      status: ProxyStatus.REJECTED,
      approvedBy: user.id,
      approvedAt: new Date(),
    });
    return this.findProxy(id);
  }
}
