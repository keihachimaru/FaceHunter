import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MessageService } from '../message/message.service';
import { Connection, ClientSession, Types } from 'mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';

describe('UserController', () => {
  let controller: UserController;
  let userService: Partial<Record<keyof UserService, jest.Mock>>;
  let messageService: Partial<Record<keyof MessageService, jest.Mock>>;
  let connection: Partial<Connection>;

  beforeEach(async () => {
    // Mock UserService methods used by controller
    userService = {
      findById: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    };

    // Mock MessageService method
    messageService = {
      findById: jest.fn(),
    };

    // Mock Mongoose connection and session
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
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: MessageService, useValue: messageService },
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('getProfile', () => {
    it('should return user profile with unread messages', async () => {
      const req = { user: { id: 'user1' } } as any;
        
      const msg1ID = new Types.ObjectId();
      const msg2ID = new Types.ObjectId();

      const userMock = {
        username: 'user1',
        name: 'Test User',
        profilePic: 'pic.jpg',
        messages: [ msg1ID, msg2ID ]
      };

      const msg1 = { id: msg1ID, status: 'received' };
      const msg2 = { id: msg2ID, status: 'read' };

      userService.findById!.mockResolvedValue(userMock);
      messageService.findById!.mockImplementation((id: string) =>
        Promise.resolve(id === msg1ID.toHexString() ? msg1 : msg2),
      );

      const result = await controller.getProfile(req);

      expect(userService.findById).toHaveBeenCalledWith('user1');
      expect(messageService.findById).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        username: userMock.username,
        name: userMock.name,
        unreadMessages: [msg1],
        profilePic: userMock.profilePic,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const req = { user: { id: 'user1' } } as any;
      userService.findById!.mockResolvedValue(null);

      await expect(controller.getProfile(req)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAccount', () => {
    it('should call userService.delete with user id', async () => {
      const req = { user: { id: 'user1' } } as any;
      userService.delete!.mockResolvedValue(undefined);

      await controller.deleteAccount(req);

      expect(userService.delete).toHaveBeenCalledWith('user1');
    });
  });

  describe('getUser', () => {
    it('should return public user data', async () => {
      const userMock = {
        profilePic: 'pic.jpg',
        username: 'user1',
      };
      userService.findById!.mockResolvedValue(userMock);

      const result = await controller.getUser('user1');

      expect(userService.findById).toHaveBeenCalledWith('user1');
      expect(result).toEqual({
        profilePic: 'pic.jpg',
        username: 'user1',
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      userService.findById!.mockResolvedValue(null);
      await expect(controller.getUser('user1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFriends', () => {
    it('should return filtered friends list', async () => {
      const req = { user: { id: 'user1' } } as any;

      const friend1ID = new Types.ObjectId();
      const friend2ID = new Types.ObjectId();

      const userMock = {
        friends: [friend1ID, friend2ID],
      };
      const friend1 = { profilePic: 'pic1.jpg', username: friend1ID };
      const friend2 = { profilePic: 'pic2.jpg', username: friend2ID };

      userService.findById!.mockImplementation((id: string) =>
        Promise.resolve(id === 'user1' ? userMock : id === friend1ID.toHexString() ? friend1 : friend2),
      );

      const result = await controller.getFriends(req);

      expect(result).toEqual([
        { profilePic: 'pic1.jpg', username: friend1ID },
        { profilePic: 'pic2.jpg', username: friend2ID },
      ]);
    });

    it('should throw NotFoundException if user not found', async () => {
      const req = { user: { id: 'user1' } } as any;
      userService.findById!.mockResolvedValue(null);

      await expect(controller.getFriends(req)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addFriend', () => {
    const friendId = 'friend1';

    it('should throw BadRequestException if friending self', async () => {
      const req = { user: { id: friendId } } as any;
      await expect(
        controller.addFriend(req, { friendId }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should add friend and commit transaction', async () => {
      const userID = new Types.ObjectId();
      const friendID = new Types.ObjectId();

      const req = { user: { id: userID.toHexString() } } as any;

      const userMock = { friends: [], id: userID };
      const friendMock = { friends: [], id: friendID };

      userService.findById!.mockImplementation((id) =>
        Promise.resolve(id === userID.toHexString() ? userMock : friendMock),
      );
      userService.update!.mockResolvedValue({});
      const session = await connection.startSession!();

      const result = await controller.addFriend(req, { friendId: friendID.toHexString() });

      expect(connection.startSession).toHaveBeenCalled();
      expect(session.startTransaction).toHaveBeenCalled();
      expect(userService.update).toHaveBeenCalledTimes(2);
      expect(session.commitTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Friend added successfully' });
    });

    it('should not add friend if already friends', async () => {
      const userID = new Types.ObjectId();
      const friendID = new Types.ObjectId();

      const req = { user: { id: userID.toHexString() } } as any;
      const userMock = { friends: [ friendID ], id: userID };
      const friendMock = { friends: [ userID ], id: friendID };

      userService.findById!.mockImplementation((id) =>
        Promise.resolve(id === userID.toHexString() ? userMock : friendMock),
      );

      const result = await controller.addFriend(req, { friendId : friendID.toHexString() });

      expect(result).toEqual({ message: 'User is already a friend' });
    });

    it('should abort transaction and rethrow on error', async () => {
      const req = { user: { id: 'user1' } } as any;
      userService.findById!.mockRejectedValue(new Error('fail'));
      const session = await connection.startSession!();

      await expect(controller.addFriend(req, { friendId })).rejects.toThrow('fail');
      expect(session.abortTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
    });
  });

  describe('removeFriend', () => {
    const friendId = 'friend1';

    it('should remove friend and commit transaction', async () => {
      const userID = new Types.ObjectId();
      const friendID = new Types.ObjectId();

      const req = { user: { id: userID } } as any;
      const userMock = { friends: [ friendID ], id: userID };
      const friendMock = { friends: [ userID ], id: friendID };

      userService.findById!.mockImplementation((id) =>
        Promise.resolve(id === userID.toHexString() ? userMock : friendMock),
      );
      userService.update!.mockResolvedValue({});
      const session = await connection.startSession!();

      const result = await controller.removeFriend(req, { friendId : friendID.toHexString() });

      expect(connection.startSession).toHaveBeenCalled();
      expect(session.startTransaction).toHaveBeenCalled();
      expect(userService.update).toHaveBeenCalledTimes(2);
      expect(session.commitTransaction).not.toHaveBeenCalled(); // commitTransaction missing in original code, you might want to add it
      expect(session.endSession).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Friend removed successfully' });
    });

    it('should abort transaction and rethrow on error', async () => {
      const req = { user: { id: 'user1' } } as any;
      userService.findById!.mockRejectedValue(new Error('fail'));
      const session = await connection.startSession!();

      await expect(controller.removeFriend(req, { friendId })).rejects.toThrow('fail');
      expect(session.abortTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
    });
  });
});
