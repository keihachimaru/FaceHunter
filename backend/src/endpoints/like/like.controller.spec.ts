import { Test, TestingModule } from '@nestjs/testing';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { FacehuntService } from '../facehunt/facehunt.service';
import { UserService } from '../user/user.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('LikeController', () => {
  let controller: LikeController;
  let likeService: any;
  let facehuntService: any;
  let userService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LikeController],
      providers: [
        {
          provide: LikeService,
          useValue: {
            getLikeByAuthorAndFacehunt: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            hasUserLikedPost: jest.fn(),
          },
        },
        {
          provide: FacehuntService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LikeController>(LikeController);
    likeService = module.get<LikeService>(LikeService);
    facehuntService = module.get<FacehuntService>(FacehuntService);
    userService = module.get<UserService>(UserService);
  });

  const dto = { author: 'user123', facehunt: 'hunt123' };
  const mockReq = (id: string) => ({ user: { id } }) as any;

  describe('likeFacehunt', () => {
    it('throws NotFound if user missing', async () => {
      userService.findById.mockResolvedValue(null);
      await expect(controller.likeFacehunt(mockReq('user123'), dto)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequest if user mismatch', async () => {
      userService.findById.mockResolvedValue({ id: 'user123' });
      await expect(controller.likeFacehunt(mockReq('user999'), dto)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFound if facehunt missing', async () => {
      userService.findById.mockResolvedValue({ id: 'user123' });
      facehuntService.findById.mockResolvedValue(null);
      await expect(controller.likeFacehunt(mockReq('user123'), dto)).rejects.toThrow(NotFoundException);
    });

    it('creates a new like if none exists', async () => {
      userService.findById.mockResolvedValue({ id: 'user123' });
      facehuntService.findById.mockResolvedValue({ id: 'hunt123' });
      likeService.getLikeByAuthorAndFacehunt.mockResolvedValue(null);
      likeService.create.mockResolvedValue({ id: 'like123', value: true });

      await controller.likeFacehunt(mockReq('user123'), dto);
      expect(likeService.create).toHaveBeenCalledWith(dto);
    });

    it('toggles like if one exists', async () => {
      const existingLike = { id: 'like123', value: true };
      const updatedLike = { id: 'like123', value: false };

      userService.findById.mockResolvedValue({ id: 'user123' });
      facehuntService.findById.mockResolvedValue({ id: 'hunt123' });
      likeService.getLikeByAuthorAndFacehunt.mockResolvedValue(existingLike);
      likeService.update.mockResolvedValue(updatedLike);

      const result = await controller.likeFacehunt(mockReq('user123'), dto);
      expect(result).toEqual(updatedLike);
    });
  });

  describe('facehuntIsLiked', () => {
    it('throws NotFound if user missing', async () => {
      userService.findById.mockResolvedValue(null);
      await expect(controller.facehuntIsLiked(mockReq('user123'), 'user123', 'hunt123')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequest if user mismatch', async () => {
      userService.findById.mockResolvedValue({ id: 'user123' });
      await expect(controller.facehuntIsLiked(mockReq('someoneElse'), 'user123', 'hunt123')).rejects.toThrow(BadRequestException);
    });

    it('throws NotFound if facehunt missing', async () => {
      userService.findById.mockResolvedValue({ id: 'user123' });
      facehuntService.findById.mockResolvedValue(null);
      await expect(controller.facehuntIsLiked(mockReq('user123'), 'user123', 'hunt123')).rejects.toThrow(NotFoundException);
    });

    it('returns { value: true } if liked', async () => {
      userService.findById.mockResolvedValue({ id: 'user123' });
      facehuntService.findById.mockResolvedValue({ id: 'hunt123' });
      likeService.hasUserLikedPost.mockResolvedValue(true);

      const result = await controller.facehuntIsLiked(mockReq('user123'), 'user123', 'hunt123');
      expect(result).toEqual({ value: true });
    });

    it('returns { value: false } if not liked', async () => {
      userService.findById.mockResolvedValue({ id: 'user123' });
      facehuntService.findById.mockResolvedValue({ id: 'hunt123' });
      likeService.hasUserLikedPost.mockResolvedValue(false);

      const result = await controller.facehuntIsLiked(mockReq('user123'), 'user123', 'hunt123');
      expect(result).toEqual({ value: false });
    });
  });
});
