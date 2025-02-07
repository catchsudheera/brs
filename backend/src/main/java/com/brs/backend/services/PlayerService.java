package com.brs.backend.services;

import com.brs.backend.configuration.ApiKeyAuth;
import com.brs.backend.core.ScorePersister;
import com.brs.backend.dto.*;
import com.brs.backend.dto.request.NewPlayer;
import com.brs.backend.dto.request.UpdatePlayer;
import com.brs.backend.model.Player;
import com.brs.backend.model.ScoreHistory;
import com.brs.backend.repositories.PlayerRepository;
import com.brs.backend.repositories.ScoreHistoryRepository;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;

@Component
@Slf4j
public class PlayerService {
    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private ScoreHistoryRepository scoreHistoryRepository;

    @Autowired
    private ScorePersister scorePersister;

    public List<Player> updatePlayerRanking() {
        List<Player> playerList = playerRepository.findAll()
                .stream()
                .filter(Player::isActive)
                .sorted(Comparator.comparingInt(Player::getPlayerRank)) // First with the current ranking to keep consistent ranking when scores are the same
                .sorted((d1, d2) -> Double.compare(d2.getRankScore(), d1.getRankScore())) // Second with the descending order of rank setPoints
                .toList();

        List<Player> playerListSaved = new ArrayList<>();
        int rank = 0;
        for (Player player : playerList) {
            player.setPlayerRank(++rank);
            if (player.getPlayerRank() < player.getHighestRank()) {
                player.setHighestRank(player.getPlayerRank());
                player.setRankSince(LocalDate.now());
            }
            playerListSaved.add(playerRepository.save(player));
        }

        return playerListSaved;
    }

    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    public Optional<Player> getPlayerByEmail(String email) {
        return playerRepository.findByEmail(email);
    }

    public List<PlayerInfo> getPlayerInfoByStatus(Optional<String> status) {
        var eligiblePlayers = getPlayerListByStatus(status);
        return eligiblePlayers.stream()
                .map(e -> {
                    Optional<ScoreHistory> h = scoreHistoryRepository.findFirstByPlayerIdOrderByEncounterDateDesc(e.getId());
                    Period period = Period.between(LocalDate.now(), e.getRankSince());
                    int diff = Math.abs(period.getDays());
                    return new PlayerInfo(e.getId(), e.getName(), e.isActive() ? e.getRankScore() : null, e.isActive() ? e.getPlayerRank() : null,
                            h.orElseGet(() -> getMaxRank(e)).getPlayerOldRank(), e.getColorHex(),
                            e.getHighestRank(), diff + " day(s)", getPlayerStatus(e));
                })
                .toList();
    }

    public List<SecurePlayerInfo> getSecurePlayerInfoByStatus(Optional<String> status) {
        var eligiblePlayers = getPlayerListByStatus(status);
        var players = eligiblePlayers.stream()
                .map(e -> {
                    Optional<ScoreHistory> h = scoreHistoryRepository.findFirstByPlayerIdOrderByEncounterDateDesc(e.getId());
                    Period period = Period.between(LocalDate.now(), e.getRankSince());
                    int diff = Math.abs(period.getDays());
                    return new SecurePlayerInfo(e.getId(), e.getName(), e.isActive() ? e.getRankScore() : null, e.isActive() ? e.getPlayerRank() : null,
                            h.orElseGet(() -> getMaxRank(e)).getPlayerOldRank(), e.getColorHex(),
                            e.getHighestRank(), diff + " day(s)", getPlayerStatus(e), e.getEmail());
                })
                .toList();
        return players;
    }


    public void activatePlayer(int playerId, Double activateScore) {
        Player player = playerRepository.findById(playerId).orElseThrow();
        if (player.isActive()) {
            log.info("Player is already active");
            return;
        }
        scorePersister.activatePlayer(player, activateScore);
    }

    public PlayerInfo addPlayer(NewPlayer newPlayer) {
        var lastActivePlayer = playerRepository.findAll().stream()
                .filter(Player::isActive).max(Comparator.comparingInt(Player::getPlayerRank)).orElseThrow();

        Player player = new Player();
        player.setName(newPlayer.getName());
        player.setPlayerRank(lastActivePlayer.getPlayerRank() + 1);
        player.setHighestRank(lastActivePlayer.getPlayerRank() + 1);
        player.setRankScore(Double.valueOf(newPlayer.getInitialScore()));
        player.setRankSince(LocalDate.now());
        player.setColorHex(generateRandomColorHex());
        player.setEmail(newPlayer.getEmail() != null ? newPlayer.getEmail().toLowerCase() : null);
        player = playerRepository.save(player);
        return convert(player);

    }

    @Transactional
    public PlayerInfo updatePlayer(UpdatePlayer updatePlayer) {
        if (updatePlayer.getId() == null) {
            throw new IllegalArgumentException("Player is is mandatory");
        }
        var player = playerRepository.findById(updatePlayer.getId()).orElseThrow();
        var updated = false;
        if (updatePlayer.getName() != null) {
            player.setName(updatePlayer.getName());
            updated = true;
        }
        if (updatePlayer.getEmail() != null) {
            player.setEmail(updatePlayer.getEmail().toLowerCase());
            updated = true;
        }
        if (updated) {
            player = playerRepository.save(player);
        }
        return new PlayerInfo(player.getId(), player.getName(), player.getRankScore(), player.getPlayerRank(),
                player.getPlayerRank(), player.getColorHex(), player.getHighestRank(),
                0 + " day(s)", getPlayerStatus(player));
    }

    public PlayerAuth getPlayerAuth() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        ApiKeyAuth auth;
        if (authentication instanceof ApiKeyAuth) {
            auth = (ApiKeyAuth) authentication;
        } else {
            log.error("No Authnetication found");
            throw new AccessDeniedException("");
        }

        var email = auth.getLoggedInEmail();
        var player = getPlayerByEmail(email);
        if (player.isEmpty()) {
            log.error("No player found for email: " + email);
            throw new AccessDeniedException("User has no access to this player with email: " + email);
        }
        var playerAuth = new PlayerAuth();
        playerAuth.setPlayer(convert(player.get()));
        if (auth.getAccessLevel() == AccessLevel.ADMIN) {
            playerAuth.setAccessLevel(new AccessLevel[]{AccessLevel.ADMIN, AccessLevel.USER});
        } else {
            playerAuth.setAccessLevel(new AccessLevel[]{AccessLevel.USER});
        }
        return playerAuth;
    }

    private ScoreHistory getMaxRank(Player e) {
        var dummyScoreHistory = new ScoreHistory();
        dummyScoreHistory.setPlayerOldRank(e.getPlayerRank());
        return dummyScoreHistory;
    }

    private String generateRandomColorHex() {
        Random random = new Random();
        int nextInt = random.nextInt(0xffffff + 1);
        return String.format("%06x", nextInt);
    }

    private SecurePlayerInfo convert(Player player) {
        return new SecurePlayerInfo(player.getId(), player.getName(), player.getRankScore(), player.getPlayerRank(),
                player.getPlayerRank(), player.getColorHex(),
                player.getHighestRank(), null, getPlayerStatus(player), player.getEmail());
    }

    private @NotNull List<Player> getPlayerListByStatus(Optional<String> status) {
        return getAllPlayers().stream().filter(p -> {
            if (status.isEmpty() || status.get().isEmpty() || status.get().equalsIgnoreCase("ALL")) {
                return true;
            } else if (status.get().equalsIgnoreCase("INACTIVE")) {
                return p.isDisabled();
            } else if (status.get().equalsIgnoreCase("ACTIVE")) {
                return p.isActive();
            } else if (status.get().equalsIgnoreCase("ENABLED")) {
                return p.isAvailableForGame() && !p.isDisabled();
            } else {
                return true;
            }
        }).toList();
    }


    private PlayerStatus getPlayerStatus(Player player) {
        if(player.isActive()){
            return PlayerStatus.ACTIVE;
        }else if(player.isAvailableForGame()){
            return PlayerStatus.ENABLED;
        }
        return PlayerStatus.DISABLED;
    }
}
