/**
 * Bracket generation logic for single-elimination tournaments.
 * All functions are pure -- no Firebase or external dependencies.
 */

/**
 * Fisher-Yates (Knuth) shuffle. Returns a new shuffled array.
 * @param {any[]} arr - Input array.
 * @returns {any[]} A new array with elements in random order.
 */
export function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Return the smallest power of 2 that is >= n.
 * @param {number} n - A positive integer.
 * @returns {number}
 */
export function nextPowerOf2(n) {
  if (n <= 1) return 1;
  let power = 1;
  while (power < n) {
    power *= 2;
  }
  return power;
}

/**
 * Generate a single-elimination bracket.
 *
 * Players are shuffled and then placed into the first round. If the number
 * of players is not a power of 2, BYE slots are created and the players
 * facing a BYE automatically advance to the next round.
 *
 * @param {object[]} players - Array of player objects. Each must have at
 *   least an `id` and a `nick` property.
 * @returns {object[]} Array of match objects with the shape:
 *   { matchIndex, round, bracketPosition, playerA, playerB, winnerId, status }
 */
export function generateBracket(players) {
  if (!Array.isArray(players) || players.length === 0) return [];
  if (players.length === 1) {
    return [
      {
        matchIndex: 0,
        round: 1,
        bracketPosition: 0,
        playerA: players[0],
        playerB: null,
        winnerId: players[0].id,
        status: 'walkover',
      },
    ];
  }

  const shuffled = shuffleArray(players);
  const size = nextPowerOf2(shuffled.length);
  const totalRounds = Math.log2(size);
  const numByes = size - shuffled.length;
  const numMatchesRound1 = size / 2;

  // Determine which matches in round 1 get a BYE
  const matchHasBye = Array(numMatchesRound1).fill(false);
  let byesAssigned = 0;
  while (byesAssigned < numByes) {
    const randomIndex = Math.floor(Math.random() * numMatchesRound1);
    if (!matchHasBye[randomIndex]) {
      matchHasBye[randomIndex] = true;
      byesAssigned++;
    }
  }

  const matches = [];
  let matchIndex = 0;
  let playerIndex = 0;

  // Build round 1 matches
  const round1 = [];
  for (let i = 0; i < numMatchesRound1; i++) {
    const hasBye = matchHasBye[i];
    
    // playerA is always a real player assigned from the shuffled list
    const realPlayer = shuffled[playerIndex++];
    
    // playerB is a real player OR null (BYE)
    let otherPlayer = null;
    if (!hasBye) {
      otherPlayer = shuffled[playerIndex++];
    }

    // Randomize whether the BYE is in slot A or B for visual variance
    const swap = hasBye && Math.random() < 0.5;
    const finalPlayerA = swap ? null : realPlayer;
    const finalPlayerB = swap ? realPlayer : otherPlayer;

    const match = {
      matchIndex,
      round: 1,
      bracketPosition: i,
      playerA: finalPlayerA,
      playerB: finalPlayerB,
      winnerId: hasBye ? realPlayer.id : null,
      status: hasBye ? 'walkover' : 'scheduled',
    };
    matches.push(match);
    round1.push(match);
    matchIndex++;
  }

  // Build subsequent rounds (empty slots, filled by advancing winners)
  let previousRoundMatches = round1;

  for (let round = 2; round <= totalRounds; round++) {
    const currentRound = [];
    for (let i = 0; i < previousRoundMatches.length; i += 2) {
      const sourceA = previousRoundMatches[i];
      const sourceB = previousRoundMatches[i + 1];

      // If both source matches already have a winner (byes), auto-fill
      const playerA = resolveAdvancingPlayer(sourceA, players);
      const playerB = resolveAdvancingPlayer(sourceB, players);

      const match = {
        matchIndex,
        round,
        bracketPosition: i / 2,
        playerA: playerA,
        playerB: playerB,
        winnerId: null,
        status: 'scheduled',
      };
      matches.push(match);
      currentRound.push(match);
      matchIndex++;
    }
    previousRoundMatches = currentRound;
  }

  return matches;
}

/**
 * Resolve the advancing player from a source match if the match has a winner.
 * @param {object} sourceMatch - A match object.
 * @param {object[]} allPlayers - The full list of players for lookups.
 * @returns {object|null} The advancing player object or null.
 */
function resolveAdvancingPlayer(sourceMatch, allPlayers) {
  if (!sourceMatch || !sourceMatch.winnerId) return null;
  if (sourceMatch.playerA && sourceMatch.playerA.id === sourceMatch.winnerId) {
    return sourceMatch.playerA;
  }
  if (sourceMatch.playerB && sourceMatch.playerB.id === sourceMatch.winnerId) {
    return sourceMatch.playerB;
  }
  return allPlayers.find((p) => p && p.id === sourceMatch.winnerId) || null;
}

/**
 * Advance a winner to the next round match in the bracket.
 *
 * Returns a new array of matches with the winner placed in the appropriate
 * slot of the next-round match.
 *
 * @param {object[]} matches - Current array of match objects.
 * @param {number} matchId - The matchIndex of the completed match.
 * @param {string} winnerId - The ID of the winning player.
 * @returns {object[]} Updated array of match objects.
 */
export function advanceWinner(matches, matchId, winnerId) {
  const updated = matches.map((m) => ({ ...m }));

  const current = updated.find((m) => m.matchIndex === matchId);
  if (!current) return updated;

  current.winnerId = winnerId;
  current.status = 'finished';

  const winnerPlayer =
    (current.playerA && current.playerA.id === winnerId
      ? current.playerA
      : null) ||
    (current.playerB && current.playerB.id === winnerId
      ? current.playerB
      : null);

  // Find the next-round match this winner should advance to
  const nextRound = current.round + 1;
  const nextPosition = Math.floor(current.bracketPosition / 2);
  const nextMatch = updated.find(
    (m) => m.round === nextRound && m.bracketPosition === nextPosition
  );

  if (nextMatch && winnerPlayer) {
    // The slot (A or B) depends on whether the source bracket position is
    // even (goes to playerA) or odd (goes to playerB).
    if (current.bracketPosition % 2 === 0) {
      nextMatch.playerA = winnerPlayer;
    } else {
      nextMatch.playerB = winnerPlayer;
    }
  }

  return updated;
}

/**
 * Determine the winner of a best-of-3 series.
 *
 * @param {object[]} games - Array of game score objects, each with
 *   `playerAScore` and `playerBScore`.
 * @returns {{ winnerId: 'A' | 'B' } | null} An object indicating the winner
 *   side, or null if the series is not yet decided.
 */
export function determineBo3Winner(games) {
  if (!Array.isArray(games) || games.length === 0) return null;

  let aWins = 0;
  let bWins = 0;

  for (const game of games) {
    if (game.playerAScore > game.playerBScore) {
      aWins++;
    } else if (game.playerBScore > game.playerAScore) {
      bWins++;
    }
  }

  if (aWins >= 2) return { winnerId: 'A' };
  if (bWins >= 2) return { winnerId: 'B' };
  return null;
}
