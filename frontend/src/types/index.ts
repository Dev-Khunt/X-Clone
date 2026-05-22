export type StoredUser = {
  user_id?: number;
  username: string;
  display_name?: string;
  profile_image?: string | null;
  bio?: string;
  country?: string;
  dob?: string;
};

export type Profile = StoredUser & {
  user_id: number;
  email?: string;
  cover_photo?: string | null;
  created_at?: string;
};

export type Tweet = {
  tweet_id: number;
  content?: string;
  created_at?: string;
  username: string;
  display_name?: string;
  profile_image?: string | null;
  media_url?: string | null;
  media_type?: string | null;
  like_count?: number;
  retweet_count?: number;
  comment_count?: number;
  isLiked?: boolean | number;
  isRetweeted?: boolean | number;
  type?: string;
  /** The DB user_id of the tweet author — used for ownership checks */
  user_id?: number;
};

export type CommentItem = {
  comment_id: number;
  /** DB user_id of the commenter — used for ownership checks */
  user_id?: number;
  content: string;
  username: string;
  display_name?: string;
  profile_image?: string | null;
  created_at?: string;
  like_count?: number;
};

/** A comment returned on the Profile → Comments tab, enriched with parent tweet info */
export type CommentWithTweet = CommentItem & {
  tweet_id: number;
  tweet_content: string;
  tweet_username: string;
  tweet_display_name?: string;
  tweet_profile_image?: string | null;
};

export type SearchResult = {
  users: StoredUser[];
  tweets: Tweet[];
};
