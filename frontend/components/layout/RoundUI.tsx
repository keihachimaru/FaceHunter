import React from "react";
import { View, StyleSheet } from "react-native";
import GameOverlay from "@/components/ui/GameOverlay";
import PlayersList from "@/components/ui/PlayersList";
import RoundInfo from "@/components/ui/RoundInfo";
import GameActionBar from "@/components/ui/GameActionBar";

import { playerType, shotMessageType } from "@/interfaces/game";
import { usePlayerStore } from '@/stores/usePlayerStore';

type RoundUIProps = {
  otherPlayers: playerType[];
  gameInfo: any; // Replace with proper type if you have it
  setPhase: React.Dispatch<React.SetStateAction<'playing' | 'voting' | 'leaderboard'>>;
  fired: boolean;
  cooldown: boolean;
  handleFire: () => void;
};

export default function RoundUI({
  otherPlayers,
  gameInfo,
  setPhase,
  fired,
  cooldown,
  handleFire,
  shotMessages,
  setDead,
  dead
}: RoundUIProps) {

  const { player, setPlayer } = usePlayerStore();
  return (
    <View style={StyleSheet.absoluteFill}>
      <GameOverlay dead={dead} weapon={player.weapon} />

      <PlayersList otherPlayers={otherPlayers} />

      <RoundInfo
        otherPlayers={otherPlayers}
        gameInfo={gameInfo}
        setPhase={setPhase}
        shotMessages={shotMessages}
        setDead={setDead}
      />

      <GameActionBar
        player={player.player}
        fire={handleFire}
        fired={fired}
        cooldown={cooldown}
      />
    </View>
  );
}
