import { Test, TestingModule } from '@nestjs/testing';
import { FacehuntController } from './facehunt.controller';
import { FacehuntService } from './facehunt.service';
import { CommentService } from '../comment/comment.service';
import { UserService } from '../user/user.service';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

describe('FacehuntController', () => {
  let controller: FacehuntController;
  let facehuntService: Partial<Record<keyof FacehuntService, jest.Mock>>;
  let commentService: Partial<Record<keyof CommentService, jest.Mock>>;
  let userService: Partial<Record<keyof UserService, jest.Mock>>;
  let connection: Partial<Connection>;

  beforeEach(async () => {
    facehuntService = {
      findById: jest.fn(),
      getAll: jest.fn(),
    };

    commentService = {};

    userService = {};

    connection = {};

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacehuntController],
      providers: [
        { provide: FacehuntService, useValue: facehuntService },
        { provide: CommentService, useValue: commentService },
        { provide: UserService, useValue: userService },
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();

    controller = module.get<FacehuntController>(FacehuntController);
  });

  describe('getFacehunts', () => {
    it('should return paginated facehunts with default values', async () => {
      const mockFacehunts = [{ id: '1' }, { id: '2' }];
      facehuntService.getAll!.mockResolvedValue(mockFacehunts);

      const result = await controller.getFacehunts(undefined, undefined);

      expect(facehuntService.getAll).toHaveBeenCalledWith(0, 10);
      expect(result).toBe(mockFacehunts);
    });

    it('should parse offset and limit from query params', async () => {
      const mockFacehunts = [{ id: '3' }];
      facehuntService.getAll!.mockResolvedValue(mockFacehunts);

      const result = await controller.getFacehunts('5', '1');

      expect(facehuntService.getAll).toHaveBeenCalledWith(5, 1);
      expect(result).toBe(mockFacehunts);
    });

    it('should fallback to default offset and limit if invalid query params', async () => {
      const mockFacehunts = [{ id: '4' }];
      facehuntService.getAll!.mockResolvedValue(mockFacehunts);

      const result = await controller.getFacehunts('notANumber', 'alsoNotANumber');

      expect(facehuntService.getAll).toHaveBeenCalledWith(0, 10);
      expect(result).toBe(mockFacehunts);
    });
  });

  describe('getFacehunt', () => {
    it('should return facehunt when found', async () => {
      const mockFacehunt = { id: 'abc', name: 'Test Facehunt' };
      facehuntService.findById!.mockResolvedValue(mockFacehunt);

      const dto = { id: 'abc' };
      const result = await controller.getFacehunt(dto);

      expect(facehuntService.findById).toHaveBeenCalledWith('abc');
      expect(result).toBe(mockFacehunt);
    });

    it('should throw NotFoundException if facehunt not found', async () => {
      facehuntService.findById!.mockResolvedValue(null);

      const dto = { id: 'missing' };

      await expect(controller.getFacehunt(dto)).rejects.toThrow(NotFoundException);
      expect(facehuntService.findById).toHaveBeenCalledWith('missing');
    });
  });
});
