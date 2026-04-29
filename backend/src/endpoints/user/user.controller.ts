import { 
    Controller,
    Get, 
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
    NotFoundException,
    BadRequestException
} 
from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { UpdateUserDTO, CreateUserDTO, AddFriendDTO } from './dto/user.dto';
import { MessageService } from '../message/message.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';


@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly messageService: MessageService,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    // Get user profile data : Home
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Req() req: Request) {
        const userID = req.user!['id'];
        const user = await this.userService.findById(userID);

        if(!user) {
            throw new NotFoundException('User not found');
        }
        
        const messages = await Promise.all(
            user.messages.map(id => this.messageService.findById(id.toHexString()))
        );
        const unreadMessages = messages.filter(m => m.status!='read');

        return {
            username: user.username,
            name: user.name,
            unreadMessages: unreadMessages,
            profilePic: user.profilePic,
        };
    }

    // Delete user account : Settings
    @UseGuards(JwtAuthGuard)
    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteAccount(@Req() req: Request) {
        return this.userService.delete(req.user!['id'])
    }

    // Get user public data : Chat
    @Get('chat/:id')
    async getUser(@Param('id') id: string) {
        const user = await this.userService.findById(id);

        if(!user) throw new NotFoundException('User not found');

        return {
            id: user._id,
            profilePic: user.profilePic,
            username: user.username,
        }
    }

    // Get friends list : Friend
    @UseGuards(JwtAuthGuard)
    @Get('friends')
    async getFriends(@Req() req: Request) {
        const userID = req.user!['id'];

        const user = await this.userService.findById(userID);

        if(!user) throw new NotFoundException('User not found');

        const friends = await Promise.all(
            user.friends.map(async (id) => {
                const friend = await this.userService.findById(id.toString());
                if(!friend) return null;
                return {
                    id: friend._id,
                    profilePic: friend.profilePic,
                    username: friend.username
                }
            })
        )

        return friends.filter(Boolean);
    }

    // Add friend : Friend
    @UseGuards(JwtAuthGuard)
    @Patch('add-friend')
    async addFriend(@Req() req: Request, @Body() dto: AddFriendDTO) {
        const userID = req.user!['id'];
        const friendID = dto.friendId;
        
        if (userID === friendID) { 
            throw new BadRequestException("Can't friend yourself");
        }

        const session = await this.connection.startSession();
        await session.startTransaction();
        
        try {
            const [ user, friend ] = await Promise.all([
                this.userService.findById(userID),
                this.userService.findById(friendID)
            ]);

            if(!user || !friend) throw new NotFoundException('No user found');
            if (userID === friendID) throw new BadRequestException("Can't friend yourself")

            if(!user.friends.map(id => id.toHexString()).includes(friendID)) {
                user.friends.push(new Types.ObjectId(friendID));
                friend.friends.push(new Types.ObjectId(userID));

                await Promise.all([
                    this.userService.update(userID, { friends : user.friends.map(id => id.toHexString()) }, session ),
                    this.userService.update(friendID, { friends: friend.friends.map(id => id.toHexString()) }, session ),
                ]);
                
                await session.commitTransaction();
                return { message : 'Friend added successfully' };
            }
            else {
                return { message : 'User is already a friend' };
            }
        }
        catch(e) {
            await session.abortTransaction();
            throw e;
        }
        finally {
            session.endSession();
        }
    }

    // Remove friend: Friend
    @UseGuards(JwtAuthGuard)
    @Patch('remove-friend')
    @UseGuards(JwtAuthGuard)
    async removeFriend(@Req() req: Request, @Body() dto: AddFriendDTO) {
        const userID = req.user!['id'];
        const friendID = dto.friendId;
        
        const [ user, friend ] = await Promise.all([
            this.userService.findById(userID),
            this.userService.findById(friendID)
        ]);

        if(!user || !friend) throw new NotFoundException('No user found');
        
        const updatedFriends = user.friends
          .filter(id => id.toString() !== friendID)
          .map(id => id.toHexString());
        
        const friendUpdatedFriends = friend.friends
          .filter(id => id.toString() !== userID)
          .map(id => id.toHexString());
        
        await Promise.all([
            this.userService.update(userID, { friends : updatedFriends }),
            this.userService.update(friendID, { friends: friendUpdatedFriends })
        ])

        return { message : 'Friend removed successfully' };
    }


}
