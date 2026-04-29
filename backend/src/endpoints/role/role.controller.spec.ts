import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { NotFoundException } from '@nestjs/common';

describe('RoleController', () => {
  let controller: RoleController;
  let roleService: jest.Mocked<RoleService>;

  beforeEach(async () => {
    roleService = {
      findById: jest.fn(),
      getAll: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        { provide: RoleService, useValue: roleService },
      ],
    }).compile();

    controller = module.get<RoleController>(RoleController);
  });

  describe('getRole', () => {
    it('should return a role if found', async () => {
      const mockRole = { id: 'role123', name: 'Warrior', baseHP: 100 };
      roleService.findById.mockResolvedValue(mockRole as any);

      const result = await controller.getRole('role123');
      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundException if role is not found', async () => {
      roleService.findById.mockResolvedValue(null as any);

      await expect(controller.getRole('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles', async () => {
      const roles = [
        { id: 'r1', name: 'Warrior', baseHP: 100 },
        { id: 'r2', name: 'Mage', baseHP: 70 },
      ];

      roleService.getAll.mockResolvedValue(roles as any);

      const result = await controller.getAllRoles();
      expect(result).toEqual(roles);
    });
  });
});
