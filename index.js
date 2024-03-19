const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once("ready", () => {
  console.log("Bot is ready!");
  fetchAndPostMatchResults();
  // Fetch and post results every 2 hours
  setInterval(fetchAndPostMatchResults, 60000);
});
let matchesArr = [];
let gamesArr = [];
async function fetchAndPostMatchResults() {
  try {
    const response = await axios.get(
      "https://api.bo3.gg/api/v1/matches?filter[matches.tournament_id][eq]=2066&filter[matches.discipline_id][eq]=1&with=teams,tournament,games,tournament_deep&page[limit]=100"
    );
    //const results = response.data; // Assuming this returns the format you need
    const channel = await client.channels.fetch(resultsChannelId);
    if (channel) {
      console.log(`event has ${response.data.results.length} matches`);
      for (let i = 0; i < response.data.results.length; i++) {
        const matchId = response.data.results[i].id;
        const matchStatus = response.data.results[i].status;
        const team1 = response.data.results[i].team1 ? response.data.results[i].team1.name : "TBD";
        const team2 = response.data.results[i].team2 ? response.data.results[i].team2.name : "TBD";
        const botype = response.data.results[i].bo_type;

        const games = response.data.results[i].games;
        //show matches results
        const oldData = matchesArr.find((match) => match.id === matchId);
        if (oldData) {
          if (oldData.status !== matchStatus) {
            if (matchStatus == "finished") {
              const result = response.data.results[i].winner_team.name;
              const team1Score = response.data.results[i].team1_score;
              const team2Score = response.data.results[i].team2_score;
              const message = `Match Result: ${team1} vs. ${team2} - BO${botype} Winner: ${result} Score: ${team1Score}-${team2Score}`;
              console.log(message);
              channel.send(message);
              const index = matchesArr.findIndex((match) => match.id === matchId);
              matchesArr[index].status = matchStatus;
            } else if (matchStatus == "current") {
              const message = `Match about to start: ${team1} vs. ${team2} - BO${botype}`;
              console.log(message);
              channel.send(message);
              const index = matchesArr.findIndex((match) => match.id === matchId);
              matchesArr[index].status = matchStatus;
            }
          } else {
            //console.log(`match ${matchId} status not updated`);
          }
        } else {
          matchesArr.push({
            id: matchId,
            status: matchStatus,
          });
          console.log(`match ${matchId} added`);
        }
        //show games results
        for (let j = 0; j < games.length; j++) {
          const gameId = games[j].id;
          const gameStatus = games[j].status;
          const mapNumber = games[j].number;
          const mapName = games[j].map_name;
          const oldData = gamesArr.find((game) => game.id === gameId);
          if (oldData) {
            if (oldData.status !== gameStatus) {
              if (gameStatus == "finished") {
                const winner = games[j].winner_clan_name;
                const winningScore = games[j].winner_clan_score;
                const winningTeam = games[j].winner_clan_name;
                const losingScore = games[j].loser_clan_score;
                const losingTeam = games[j].loser_clan_name;
                const message = `Game Result: ${team1} vs. ${team2} Map Number ${mapNumber} (${mapName}) - Winner: ${winner} Score: ${winningScore}-${losingScore}`;
                console.log(message);
                channel.send(message);
                const index = gamesArr.findIndex((game) => game.id === gameId);
                gamesArr[index].status = gameStatus;
              } else if (gameStatus == "current") {
                const message = `Game ${team1} vs. ${team2} Map Number ${mapNumber} (${mapName}) is now live!`;
                console.log(message);
                channel.send(message);
                const index = gamesArr.findIndex((game) => game.id === gameId);
                gamesArr[index].status = gameStatus;
              }
            } else {
              //console.log(`game ${gameId} status not updated`);
            }
          } else {
            gamesArr.push({
              id: gameId,
              status: gameStatus,
            });
            console.log(`game ${gameId} added`);
          }
        }

        //console.log(`loop ${i} done`);
      }
      //console.log(matches);
      // Customize this message format according to the structure of your results
      //const message = `Latest PGL Majors CS2 Match Result: Furia vs. KIO - Bo3 Winner: Furia`;
      //channel.send(message);
    }
  } catch (error) {
    console.error("Error fetching or posting match results:", error);
  }
}

client.login(token);
