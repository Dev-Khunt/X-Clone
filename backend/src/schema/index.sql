Create database if not exists x_clone;
use x_clone;


-- Users Table
create table  users
(
user_id bigint primary key auto_increment,
username varchar(50) unique not null,
display_name varchar(50),
email varchar(100) unique not null,
password varchar(150),
dob date not null,
bio Text default null,
country varchar(50),
profile_image varchar(200) null,
cover_photo varchar(200) null,
is_verified boolean default false,
created_at timestamp default current_timestamp
);

-- Follow table 
create table follow
(
follower_id bigint,
followee_id bigint,
Foreign Key (follower_id) REFERENCES users(user_id),
Foreign Key (followee_id) REFERENCES users(user_id),
primary key (follower_id, followee_id)
);

-- Tweets table  
create table tweets
(
tweet_id bigint primary key auto_increment,
user_id bigint not null,
content Text default null,
created_at timestamp default current_timestamp,
constraint fk_tweets_userId Foreign Key(user_id) references users(user_id) on delete cascade
);


-- Tweets Media
create table tweets_media
(
media_id bigint primary key auto_increment,
tweet_id bigint not null,
media_type varchar(20),
media_url varchar(200),
created_at timestamp default current_timestamp,
constraint fk_media_tweets foreign key(tweet_id) references tweets(tweet_id) on delete cascade
);

-- Retweets Table 
create table retweets
(
user_id bigint not null,
tweet_id bigint not null,
created_at timestamp default current_timestamp,
constraint pk_retweet primary key(user_id,tweet_id),
constraint fk_retweet_user foreign key(user_id) references users(user_id) on delete cascade,
constraint fk_retweet_tweet foreign key(tweet_id) references tweets(tweet_id) on delete cascade
);

-- Reaction table
create table reactions
(
user_id bigint not null,
tweet_id bigint not null,
is_liked boolean default true,
created_at timestamp default current_timestamp,
constraint primary key(user_id,tweet_id),
constraint fk_reaction_tweet foreign key(tweet_id) references tweets(tweet_id) on delete cascade,
constraint fk_reaction_user foreign key(user_id) references users(user_id) on delete cascade
);

-- Comments Table
create table comments
(
comment_id bigint primary key auto_increment,
tweet_id bigint not null,
user_id bigint not null,
content text,
parent_comment_id bigint null,
created_at timestamp default current_timestamp,
constraint fk_comment_parent foreign key (parent_comment_id) references comments(comment_id) on delete set null,
constraint fk_comment_tweet foreign key(tweet_id) references tweets(tweet_id) on delete cascade,
constraint fk_comment_user foreign key(user_id) references users(user_id) on delete cascade
);

-- Comment Reaction Table
create table comment_reactions
(
user_id bigint,
comment_id bigint,
isliked boolean default true,
created_at timestamp default current_timestamp,
constraint primary key(user_id,comment_id),
constraint fk_comm_reaction_tweet foreign key(comment_id) references comments(comment_id) on delete cascade,
constraint fk_comm_reaction_user foreign key(user_id) references users(user_id) on delete cascade
);

-- Notifications Table
create table notifications
(
notification_id bigint primary key auto_increment,
user_id bigint not null,
actor_id bigint not null,
tweet_id bigint null,
comment_id bigint null,
content varchar(100),
notification_type varchar(40), 			-- e.g "like", "comment", "follow"
is_read boolean default false,
created_at timestamp default current_timestamp,
constraint fk_notification_user foreign key(user_id) references users(user_id) on delete cascade,
constraint fk_notification_actor foreign key(actor_id) references users(user_id) on delete cascade,
constraint fk_notification_tweet foreign key(tweet_id) references tweets( tweet_id) on delete set null,
constraint fk_notification_comment foreign key(comment_id) references comments(comment_id) on delete set null
);


-- Captcha table 
create table captcha(
captch_id int  auto_increment PRIMARY KEY,
answer varchar(36) not null,
expires_at datetime not null,
used boolean default false,
created_at timestamp default current_timestamp
);
