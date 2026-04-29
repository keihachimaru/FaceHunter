import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Connection, ClientSession, Types } from 'mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { FacehuntService } from '../facehunt/facehunt.service';

describe('CommentController', () => {
  let controller: CommentController;
  let commentService: Partial<Record<keyof CommentService, jest.Mock>>;
  let connection: Partial<Connection>;
  let facehuntService: Partial<Record<keyof FacehuntService, jest.Mock>>;

  beforeEach(async () => {
    commentService = {
      findById: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    };

    facehuntService = {
      findById: jest.fn(), 
    };

    const session: Partial<ClientSession> = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    connection = {
      startSession: jest.fn().mockResolvedValue(session),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        { provide: CommentService, useValue: commentService },
        { provide: getConnectionToken(), useValue: connection },
        { provide: FacehuntService, useValue: facehuntService },
      ],
    }).compile();

    controller = module.get<CommentController>(CommentController);
  });

  describe('getComment', () => {
    it('should return comment by ID', async () => {
      const commentId = new Types.ObjectId();
      const commentMock = { id: commentId, content: 'Test comment' };

      commentService.findById!.mockResolvedValue(commentMock);
      const req = { user: { id: new Types.ObjectId().toHexString() } } as any;

      const result = await controller.getComment(req, commentId.toHexString());

      expect(commentService.findById).toHaveBeenCalledWith(commentId.toHexString());
      expect(result).toEqual(commentMock);
    });

    it('should throw NotFoundException if comment not found', async () => {
      const commentId = new Types.ObjectId();
      commentService.findById!.mockResolvedValue(null);

      const req = { user: { id: new Types.ObjectId().toHexString() } } as any;

      await expect(controller.getComment(req, commentId.toHexString())).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteComment', () => {
    it('should delete comment if author matches', async () => {
      const commentId = new Types.ObjectId();
      const userId = new Types.ObjectId();
      const req = { user: { id: userId.toHexString() } } as any;

      const commentMock = {
        id: commentId,
        author: userId,
        content: 'Test',
      };

      commentService.findById!.mockResolvedValue(commentMock);
      commentService.delete!.mockResolvedValue(undefined);

      const result = await controller.deleteComment(req, { id: commentId.toHexString() });

      expect(commentService.findById).toHaveBeenCalledWith(commentId.toHexString());
      expect(commentService.delete).toHaveBeenCalledWith(commentId.toHexString());
      expect(result).toEqual({ message: 'Comment successfully deleted' });
    });

    it('should throw NotFoundException if comment not found', async () => {
      commentService.findById!.mockResolvedValue(null);
      const req = { user: { id: new Types.ObjectId().toHexString() } } as any;

      await expect(
        controller.deleteComment(req, { id: new Types.ObjectId().toHexString() }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if comment author mismatch', async () => {
      const commentId = new Types.ObjectId();
      const reqUserId = new Types.ObjectId();
      const differentAuthorId = new Types.ObjectId();
      const req = { user: { id: reqUserId.toHexString() } } as any;

      const commentMock = {
        id: commentId,
        author: differentAuthorId, // different author
        content: 'Test',
      };

      commentService.findById!.mockResolvedValue(commentMock);

      await expect(
        controller.deleteComment(req, { id: commentId.toHexString() }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateComment', () => {
    it('should update comment if author matches', async () => {
      const commentId = new Types.ObjectId();
      const userId = new Types.ObjectId();
      const req = { user: { id: userId.toHexString() } } as any;

      const commentMock = {
        id: commentId,
        author: userId,
        content: 'Old Content',
      };

      commentService.findById!.mockResolvedValue(commentMock);
      commentService.update!.mockResolvedValue(undefined);

      const result = await controller.updateComment(req, {
        id: commentId.toHexString(),
        content: 'Updated content',
      });

      expect(commentService.findById).toHaveBeenCalledWith(commentId.toHexString());
      expect(commentService.update).toHaveBeenCalledWith(commentId.toHexString(), {
        content: 'Updated content',
      });
      expect(result).toEqual({ message: 'Comment successfully edited' });
    });

    it('should throw NotFoundException if comment not found', async () => {
      commentService.findById!.mockResolvedValue(null);
      const req = { user: { id: new Types.ObjectId().toHexString() } } as any;

      await expect(
        controller.updateComment(req, {
          id: new Types.ObjectId().toHexString(),
          content: 'Updated content',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if comment author mismatch', async () => {
      const commentId = new Types.ObjectId();
      const reqUserId = new Types.ObjectId();
      const differentAuthorId = new Types.ObjectId();
      const req = { user: { id: reqUserId.toHexString() } } as any;

      const commentMock = {
        id: commentId,
        author: differentAuthorId,
        content: 'Old Content',
      };

      commentService.findById!.mockResolvedValue(commentMock);

      await expect(
        controller.updateComment(req, {
          id: commentId.toHexString(),
          content: 'Updated content',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

    describe('postComment', () => {
      const userId = new Types.ObjectId().toHexString();

      it('should post a comment successfully', async () => {
        const dto = {
          facehunt: 'post123',
          author: userId,
          content: 'This is a comment',
        };

        // mock postService.findById to simulate an existing post
        const mockPostService = {
          findById: jest.fn().mockResolvedValueOnce({ id: dto.facehunt }),
        };

        // manually inject mock postService into controller
        (controller as any).facehuntService = mockPostService;

        commentService.create = jest.fn().mockResolvedValueOnce({ ...dto, id: 'comment456' });

        const req = { user: { id: userId } } as any;
        const result = await controller.postComment(req, dto);

        expect(mockPostService.findById).toHaveBeenCalledWith(dto.facehunt);
        expect(commentService.create).toHaveBeenCalledWith(dto);
        expect(result).toEqual({ ...dto, id: 'comment456' });
      });

      it('should throw if user and author do not match', async () => {
        const dto = {
          facehunt: 'post123',
          author: 'wrongUser',
          content: 'Invalid mismatch',
        };

        const req = { user: { id: userId } } as any;

        await expect(controller.postComment(req, dto)).rejects.toThrow(BadRequestException);
        expect(commentService.create).not.toHaveBeenCalled();
      });

      it('should throw if post does not exist', async () => {
        const dto = {
          facehunt: 'missingPost',
          author: userId,
          content: 'Comment for missing post',
        };

        const mockPostService = {
          findById: jest.fn().mockResolvedValueOnce(null),
        };

        (controller as any).facehuntService = mockPostService;

        const req = { user: { id: userId } } as any;

        await expect(controller.postComment(req, dto)).rejects.toThrow(BadRequestException);
        expect(mockPostService.findById).toHaveBeenCalledWith(dto.facehunt);
        expect(commentService.create).not.toHaveBeenCalled();
      });
    });
});
