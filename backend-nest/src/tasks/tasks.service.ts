import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity, TaskStatus } from '../database/entities/task.entity';
import { TaskAssignmentEntity, TaskAssignmentStatus } from '../database/entities/task-assignment.entity';
import { CreateTaskDto, UpdateTaskDto, UpdateAssignmentStatusDto } from './dto/tasks.dto';
import { Role } from '../common/enums/role.enum';

interface CurrentUser {
  id: string;
  role: Role;
  teacherId: string;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private taskRepo: Repository<TaskEntity>,
    @InjectRepository(TaskAssignmentEntity)
    private assignmentRepo: Repository<TaskAssignmentEntity>,
  ) {}

  // ─── Tasks ────────────────────────────────────────────────────────────────

  async findAllTasks(user: CurrentUser) {
    const isPrivileged = [Role.ADMIN, Role.PRINCIPAL, Role.COORDINATOR].includes(user.role);
    if (isPrivileged) {
      return this.taskRepo.find({ order: { createdAt: 'DESC' } });
    }
    // Teacher: only tasks they are assigned to
    const assignments = await this.assignmentRepo.find({
      where: { teacherId: user.teacherId },
    });
    if (!assignments.length) return [];
    const taskIds = [...new Set(assignments.map((a) => a.taskId))];
    return this.taskRepo
      .createQueryBuilder('t')
      .where('t.id IN (:...ids)', { ids: taskIds })
      .orderBy('t.createdAt', 'DESC')
      .getMany();
  }

  async findOneTask(id: string) {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async createTask(dto: CreateTaskDto, user: CurrentUser) {
    const task = this.taskRepo.create({
      title: dto.title,
      description: dto.description,
      priority: dto.priority ?? 'medium',
      startDate: dto.startDate || null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      remarks: dto.remarks || null,
      assignedTo: dto.assignedTo,
      createdBy: user.id,
      createdByName: dto.createdByName || null,
      status: TaskStatus.PENDING,
      schoolId: 'school_001',
    });
    const saved = await this.taskRepo.save(task);

    if (dto.assignedTo?.length) {
      const assignments = dto.assignedTo.map((teacherId) =>
        this.assignmentRepo.create({
          taskId: saved.id,
          teacherId,
          status: TaskAssignmentStatus.NOT_STARTED,
        }),
      );
      await this.assignmentRepo.save(assignments);
    }

    return saved;
  }

  async updateTask(id: string, dto: UpdateTaskDto, user: CurrentUser) {
    const task = await this.findOneTask(id);
    const isPrivileged = [Role.ADMIN, Role.PRINCIPAL].includes(user.role);
    if (!isPrivileged && task.createdBy !== user.id) {
      throw new ForbiddenException('Cannot update this task');
    }
    await this.taskRepo.update(id, dto as any);
    return this.findOneTask(id);
  }

  async removeTask(id: string) {
    await this.findOneTask(id);
    await this.assignmentRepo.delete({ taskId: id });
    await this.taskRepo.delete(id);
  }

  async cancelTask(id: string, user: CurrentUser) {
    const task = await this.updateTask(id, { status: TaskStatus.CANCELLED }, user);
    await this.assignmentRepo.update({ taskId: id }, { status: TaskAssignmentStatus.CANCELLED });
    return task;
  }

  // ─── Assignments ─────────────────────────────────────────────────────────

  async getAssignmentsForTask(taskId: string) {
    return this.assignmentRepo.find({
      where: { taskId },
      order: { createdAt: 'ASC' },
    });
  }

  async getMyAssignments(user: CurrentUser) {
    const assignments = await this.assignmentRepo.find({
      where: { teacherId: user.teacherId },
      order: { createdAt: 'DESC' },
    });
    // Embed task data
    const taskIds = [...new Set(assignments.map((a) => a.taskId))];
    if (!taskIds.length) return [];
    const tasks = await this.taskRepo
      .createQueryBuilder('t')
      .where('t.id IN (:...ids)', { ids: taskIds })
      .getMany();
    const taskMap = Object.fromEntries(tasks.map((t) => [t.id, t]));
    return assignments.map((a) => ({ ...a, task: taskMap[a.taskId] || null }));
  }

  async getAllAssignmentsWithTasks() {
    const [assignments, tasks] = await Promise.all([
      this.assignmentRepo.find({ order: { createdAt: 'DESC' } }),
      this.taskRepo.find({ order: { createdAt: 'DESC' } }),
    ]);
    const taskMap = Object.fromEntries(tasks.map((t) => [t.id, t]));
    return assignments.map((a) => ({ ...a, task: taskMap[a.taskId] || null }));
  }

  async updateAssignmentStatus(
    assignmentId: string,
    dto: UpdateAssignmentStatusDto,
    user: CurrentUser,
  ) {
    const assignment = await this.assignmentRepo.findOne({ where: { id: assignmentId } });
    if (!assignment) throw new NotFoundException('Assignment not found');

    const isPrivileged = [Role.ADMIN, Role.PRINCIPAL].includes(user.role);
    if (!isPrivileged && assignment.teacherId !== user.teacherId) {
      throw new ForbiddenException('Cannot update this assignment');
    }

    const updates: Partial<TaskAssignmentEntity> = { status: dto.status };
    if (dto.status === TaskAssignmentStatus.IN_PROGRESS) updates.startedAt = new Date();
    if (dto.status === TaskAssignmentStatus.COMPLETED) updates.completedAt = new Date();

    await this.assignmentRepo.update(assignmentId, updates);
    return this.assignmentRepo.findOne({ where: { id: assignmentId } });
  }

  async markOverdueTasks() {
    const now = new Date();
    const activeAssignments = await this.assignmentRepo.find({
      where: [
        { status: TaskAssignmentStatus.NOT_STARTED },
        { status: TaskAssignmentStatus.IN_PROGRESS },
      ],
    });

    const updates: Promise<any>[] = [];
    for (const a of activeAssignments) {
      const task = await this.taskRepo.findOne({ where: { id: a.taskId } });
      if (task?.dueDate && new Date(task.dueDate) < now) {
        updates.push(
          this.assignmentRepo.update(a.id, { status: TaskAssignmentStatus.OVERDUE }),
        );
      }
    }
    await Promise.all(updates);
    return { marked: updates.length };
  }
}
