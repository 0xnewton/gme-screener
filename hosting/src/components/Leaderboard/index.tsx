import { useTokens } from "../../hooks/useTokens";
import { Leaderboard as LeaderboardScaffold } from "./Leaderboard";

const Leaderboard: React.FC = () => {
  const { data: tokens, loading, error } = useTokens();
  console.log("Tokens:", tokens);
  if (error) {
    console.error("Error fetching tokens:", error);
    return <div>Error loading leaderboard</div>;
  }
  return <LeaderboardScaffold loading={loading} tokens={tokens} />;
};

export default Leaderboard;
