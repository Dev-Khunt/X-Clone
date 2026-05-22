import { Request } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export interface SignUpBody {
  username: string;
  email: string;
  display_name: string;
  password: string; //hashed
  dob: Date;
  bio?: string;
  country: string;
  profile_image?: string;
  cover_photo?: string;
}

export interface User extends RowDataPacket {
  user_id: number;
  username: string;
  email: string;
  password: string; // hashed
}

export interface JwtPayload {
  id: number;
  username?: string;
}

export interface GetProfile extends RowDataPacket {
  user_id: number;
  username: string;
  email: string;
  password: string;
  display_name: string;
  dob: Date;
  country: string;
  profile_image: string;
  cover_photo: string;
  created_at : string;
}

export interface  AuthRequest extends Request  {
    user? : User
}

export interface GetTweets extends RowDataPacket {
  tweet_id : number;
  user_id : number;
  content : string;
  created_at : string;
}

export interface UserTweet extends ResultSetHeader {
  tweet_id: number;
  content: string;
  created_at: Date;
  username: string;
  display_name: string;
  profile_image: string | null;
  media_url: string | null;
  media_type: string | null;
  like_count: number;
  retweet_count: number;
  isRetweeted : number;
  isLiked: number; // MySQL returns 0/1
  type: 'tweet' | 'retweet';
}

export interface UserComment extends ResultSetHeader {
  comment_id: number;
  content: string;
  created_at: Date;
  username: string;
  display_name: string;
  profile_image: string | null;
  like_count: number;
  isLiked: number; // 0 or 1
}

export interface UserLike extends ResultSetHeader {
  tweet_id: number;
  content: string;
  created_at: Date;
  username: string;
  display_name: string;
  profile_image: string | null;
  media_url: string | null;
  media_type: string | null;
  like_count: number;
  retweet_count: number;
  isLiked: number;
  type: 'like';
}

export interface FeedTweet extends ResultSetHeader {
  tweet_id: number;
  content: string;
  created_at: Date;
  username: string;
  display_name: string;
  profile_image: string | null;
  media_url: string | null;
  media_type: string | null;
  like_count : number;
  isRetweeted : number;
  isLiked: number;
  type: 'tweet' | 'retweet';
}


export interface TweetById extends ResultSetHeader {
  tweet_id: number;
  content: string;
  created_at: Date;
  username: string;
  display_name: string;
  profile_image: string | null;
  media_url: string | null;
  media_type: string | null;
  like_count: number;
  isRetweeted : number;
  isLiked: number;
}

export interface UserTweet extends ResultSetHeader {
  tweet_id: number;
  content: string;
  created_at: Date;
  username: string;
  display_name: string;
  profile_image: string | null;
  media_url: string | null;
  media_type: string | null;
  isRetweeted : number;
  like_count: number;
  retweet_count: number;
  isLiked: number;
  type: 'tweet' | 'retweet';
}

export interface Follower extends ResultSetHeader {
user_id: number;
username: string;
display_name: string;
profile_image: string | null;
}

export interface Following extends ResultSetHeader {
user_id: number;
username: string;
display_name: string;
profile_image: string | null;
}


export interface CreateCommentBody {
content: string;
}

export interface ReplyBody {
content: string;
}


export interface Comment extends ResultSetHeader {
comment_id: number;
content: string;
created_at: Date;
username: string;
display_name: string;
profile_image: string | null;
}

export interface Reply extends ResultSetHeader {
comment_id: number;
content: string;
created_at: Date;
username: string;
display_name: string;
profile_image: string | null;
}

export interface DBResult extends ResultSetHeader{
affectedRows: number;
}