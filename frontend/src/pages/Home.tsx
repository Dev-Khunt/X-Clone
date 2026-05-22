import { useEffect, useState } from "react";
import { Header } from "../components/layout/Header";
import { EmptyState } from "../components/ui/EmptyState";
import { TweetCard } from "../components/tweet/TweetCard";
import { TweetComposer } from "../components/tweet/TweetComposer";
import api from "../services/api";
import { Tweet } from "../types";

export function Home() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadFeed() {
    const { data } = await api.get<Tweet[]>("/tweets/feed");
    setTweets(data);
    setLoading(false);
  }

  useEffect(() => { loadFeed().catch(console.error); }, []);

  return (
    <>
      <Header title="Home" />
      <TweetComposer onPosted={loadFeed} />
      {loading && <EmptyState text="Loading feed..." />}
      {!loading && tweets.length === 0 && <EmptyState text="Nothing here yet" />}
      {tweets.map((tweet) => (
        <TweetCard key={`${tweet.type}-${tweet.tweet_id}-${tweet.created_at}`} tweet={tweet} onChanged={loadFeed} />
      ))}
    </>
  );
}
