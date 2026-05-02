import { likeType, commentType, facehuntType } from '../interfaces';

export async function likeFacehunt(id: number) {
    console.log('Facehunt liked');
}

export async function postComment(id: number, comment: commentType) {
    console.log(`Author ${comment.author} posted ${comment.comment}`);
}

export async function getLikes(id: number): Promise<likeType[]> {
    return [
        {
            author: 10,
        },
        {
            author: 2,
        },
        {
            author: 3,
        },
        {
            author: 4,
        },
        {
            author: 5,
        },
        {
            author: 6,
        },
        {
            author: 7,
        },
        {
            author: 8,
        },
        {
            author: 9,
        }
    ];
}

export async function getComments(id: number): Promise<commentType[] | null> {
    return [
        {
            author: 20,
            username: 'GameMaster99',
            comment: 'Hi',
            profilePic: 'https://picsum.photos/300/300?random=1',
            id: 1,
        },
        {
            author: 2,
            username: 'SniperElite',
            comment: 'Cool shot! Reminds me of that time I got a 1,500 meter headshot in the snow map. The bullet drop calculations had to be perfect for that one.',
            profilePic: 'https://picsum.photos/300/300?random=2',
            id: 2,
        },
        {
            author: 3,
            username: 'TacticalGamer',
            comment: 'Nice facehunt! Though I wonder if you considered the alternative strategy of flanking from the east side? The elevation gives you better cover while maintaining visibility.',
            profilePic: 'https://picsum.photos/300/300?random=3',
            id: 3,
        },
        {
            author: 4,
            username: 'ProGamer2023',
            comment: 'Very good facehunt, gg! I\'ve been analyzing your gameplay and your reaction time is consistently under 200ms, which explains why you\'re always first to shoot.',
            profilePic: 'https://picsum.photos/300/300?random=4',
            id: 4,
        },
        {
            author: 5,
            username: 'SaltyVeteran',
            comment: 'p2w piece of sht... though I have to admit, even with the best gear, it takes skill to pull off moves like that. Maybe I\'m just jealous of your loadout.',
            profilePic: 'https://picsum.photos/300/300?random=5',
            id: 5,
        },
        {
            author: 6,
            username: 'MetaAnalyst',
            comment: 'Thats why sniper class is so op in the current meta. The devs really need to address the bullet penetration mechanics - it makes other classes nearly irrelevant in long-range engagements.',
            profilePic: 'https://picsum.photos/300/300?random=6',
            id: 6,
        },
        {
            author: 7,
            username: 'HonestReviewer',
            comment: 'Mid af... I mean it\'s decent gameplay but we\'ve all seen better. Try incorporating more movement tech like slide-canceling to make your approach less predictable.',
            profilePic: 'https://picsum.photos/300/300?random=7',
            id: 7,
        },
        {
            author: 8,
            username: 'ClipsOfTheMonth',
            comment: 'Best shot ever lol! Mind if I feature this in my monthly top plays compilation? The way you tracked the target through the smoke was insane!',
            profilePic: 'https://picsum.photos/300/300?random=8',
            id: 8,
        },
        {
            author: 9,
            username: 'CuriousNoob',
            comment: 'That is so interesting! As a new player, could you explain how you calculated the bullet drop? I keep missing my long-range shots and this looks like exactly what I need to learn.',
            profilePic: 'https://picsum.photos/300/300?random=9',
            id: 9,
        },
        {
            author: 10,
            username: 'TheStrategist',
            comment: 'Impressive, but have you tried this with the new season 4 attachments? The stabilized barrel reduces sway by 15% which could make your follow-up shots even more accurate.',
            profilePic: 'https://picsum.photos/300/300?random=10',
            id: 10,
        },
        {
            author: 11,
            username: 'LoreMaster',
            comment: 'Fun fact: The rifle you\'re using is actually based on a real-world prototype that was never mass-produced. The in-game description gets most of the history right, but they exaggerated the muzzle velocity by about 100fps.',
            profilePic: 'https://picsum.photos/300/300?random=11',
            id: 11,
        },
        {
            author: 12,
            username: 'CompetitivePlayer',
            comment: 'This would be tournament legal if you disabled the red dot sight. The ESL rules prohibit any optics that provide magnification beyond 4x in the sniper class.',
            profilePic: 'https://picsum.photos/300/300?random=12',
            id: 12,
        },
        {
            author: 13,
            username: 'GraphicsPhile',
            comment: 'Can we talk about how amazing the particle effects are when the bullet connects? The blood splatter physics were completely reworked in the last patch and it shows!',
            profilePic: 'https://picsum.photos/300/300?random=13',
            id: 13,
        },
        {
            author: 14,
            username: 'DadGamer',
            comment: 'My kids showed me this clip and now I understand why they keep begging me to upgrade our internet. That latency is smoother than my morning coffee!',
            profilePic: 'https://picsum.photos/300/300?random=14',
            id: 14,
        },
        {
            author: 15,
            username: 'PatchNotesReader',
            comment: 'This playstyle will be even stronger after next week\'s balance changes. They\'re buffing sniper rifle reload speed by 0.2 seconds across all models according to the test server notes.',
            profilePic: 'https://picsum.photos/300/300?random=15',
            id: 15,
        },
        {
            author: 16,
            username: 'CosplayHunter',
            comment: 'Love the character skin you\'re using! It\'s based on the elite unit from the single-player campaign that was only available for a limited time in 2021. Rare to see it in matches these days.',
            profilePic: 'https://picsum.photos/300/300?random=16',
            id: 16,
        },
        {
            author: 17,
            username: 'SoundDesignNerd',
            comment: 'The audio cues in this clip are perfect - you can hear the echo of the shot bouncing off the canyon walls exactly like it would in real life. The sound team nailed the environmental acoustics!',
            profilePic: 'https://picsum.photos/300/300?random=17',
            id: 17,
        },
        {
            author: 18,
            username: 'Speedrunner',
            comment: 'If you optimize this route slightly, you could shave about 1.5 seconds off the time to reach this position. Not that you need it with aim that good, but every second counts in ranked!',
            profilePic: 'https://picsum.photos/300/300?random=18',
            id: 18,
        },
        {
            author: 19,
            username: 'ControllerPlayer',
            comment: 'As someone who plays on controller, I could never pull this off with thumbsticks. The precision required for these micro-adjustments is why I\'m switching to mouse and keyboard next season.',
            profilePic: 'https://picsum.photos/300/300?random=19',
            id: 19,
        }
    ];
}


export async function getFacehunt(id: number) : Promise<facehuntType | null> {
    return {
        hunt: 'https://picsum.photos/500/500?random=3',
        author: 1,
        time: '23:43',
    };
}
